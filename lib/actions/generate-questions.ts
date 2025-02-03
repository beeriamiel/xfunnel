import { createClient, createAdminClient } from "@/app/supabase/server";
import { EngineSelection } from "@/app/company-actions";
import { generatePerplexityResponse } from '@/lib/actions/generate-perplexity-response';
import { generateGeminiResponse } from "./generate-gemini-response";
import { generateClaudeResponse } from './generate-claude-response';
import { generateOpenAIResponse } from './generate-openai-response';
import { generateSerpResponse } from './generate-serp-response';
import { Database } from "@/types/supabase";
import { parsePrompt } from "@/lib/prompts/prompt-parser";
import { ResponseAnalysisQueue } from "@/lib/batch-processing/queue";
import { AIModelType } from "@/lib/services/ai/types";
import { AIServiceFactory } from "@/lib/services/ai/factory";
import { SupabaseBatchTrackingService } from "@/lib/services/batch-tracking";

type Tables = Database['public']['Tables'];
type Query = Tables['queries']['Row'];
type Response = Tables['responses']['Row'];
type Persona = Tables['personas']['Row'];
type ICP = Tables['ideal_customer_profiles']['Row'];

interface PersonaWithICP extends Omit<Persona, 'icp'> {
  icp: ICP[];
}

type QueryWithId = Pick<Query, 'id' | 'query_text' | 'buyer_journey_phase'>;

const VALID_PHASES = [
  'problem_exploration',
  'solution_education',
  'solution_comparison',
  'solution_evaluation',
  'final_research'
] as const;

async function processNewResponses() {
  const adminClient = await createAdminClient();
  
  // Get the latest response ID that has been analyzed
  const { data: lastAnalyzed } = await adminClient
    .from('response_analysis')
    .select('response_id')
    .order('response_id', { ascending: false })
    .limit(1)
    .single();

  // Get the latest response ID
  const { data: lastResponse } = await adminClient
    .from('responses')
    .select('id')
    .order('id', { ascending: false })
    .limit(1)
    .single();

  if (!lastResponse) {
    console.log('No responses to analyze');
    return;
  }

  const startId = (lastAnalyzed?.response_id || 0) + 1;
  const endId = lastResponse.id;

  if (startId > endId) {
    console.log('No new responses to analyze');
    return;
  }

  console.log(`Processing responses from ID ${startId} to ${endId}`);
  const queue = new ResponseAnalysisQueue();
  
  // Get company ID and account ID from the first response
  const { data: firstResponse } = await adminClient
    .from('responses')
    .select(`
      id,
      query_id,
      queries!inner (
        company_id,
        account_id
      )
    `)
    .eq('id', startId)
    .single();

  if (!firstResponse?.queries?.company_id || !firstResponse?.queries?.account_id) {
    throw new Error('Could not find company ID or account ID for responses');
  }

  await queue.processQueue(
    startId, 
    endId, 
    firstResponse.queries.company_id,
    firstResponse.queries.account_id
  );
}

export async function generateQuestions(
  companyName: string, 
  engines: EngineSelection,
  personaId: number,
  systemPromptName: string,
  userPromptName: string,
  model: AIModelType = 'chatgpt-4o-latest',
  accountId: string,
  productId: number
): Promise<{ queries: QueryWithId[], batchId: string }> {
  const supabase = await createClient();
  const adminClient = await createAdminClient();
  const batchTracker = await SupabaseBatchTrackingService.initialize();
  let batchId: string | undefined;
  
  console.log('Starting question generation:', {
    model,
    companyName,
    personaId,
    systemPrompt: systemPromptName,
    userPrompt: userPromptName,
    engines: Object.keys(engines).filter((k): k is keyof typeof engines => engines[k as keyof typeof engines]),
  });

  try {
    // Validate model selection
    if (!['gpt-4-turbo-preview', 'claude-3.5-sonnet'].includes(model)) {
      throw new Error(`Invalid model selected: ${model}`);
    }

    // Get the authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) {
      console.error('User error:', userError);
      throw new Error('Authentication required');
    }

    if (!user?.id) {
      throw new Error('User must be authenticated');
    }

    // 1. Check if company exists or create it
    let { data: existingCompany, error: companyError } = await adminClient
      .from('companies')
      .select('id')
      .eq('name', companyName)
      .single();

    if (companyError && companyError.code !== 'PGRST116') { // PGRST116 is "not found" error
      throw new Error('Failed to check company existence');
    }

    let companyId: number;
    
    if (!existingCompany) {
      // Create new company
      const { data: newCompany, error: insertError } = await adminClient
        .from('companies')
        .insert([{ 
          name: companyName
        }])
        .select('id')
        .single();

      if (insertError) {
        console.error('Company creation error:', insertError);
        throw new Error(`Failed to create company: ${insertError.message}`);
      }
      companyId = newCompany.id;
    } else {
      companyId = existingCompany.id;
    }

    // Create a new batch for question generation
    batchId = await batchTracker.createBatch('query', companyId, accountId, {
      model,
      systemPromptName,
      userPromptName,
      personaId,
      engines: Object.keys(engines).filter((k): k is keyof typeof engines => engines[k as keyof typeof engines])
    });
    await batchTracker.updateBatchStatus(batchId, 'in_progress');

    // 2. Fetch the prompt from Supabase
    // First, let's check all prompts to see what we have
    const { data: allPrompts, error: allPromptsError } = await supabase
      .from('prompts')
      .select('id, name, is_active');

    console.log('Available prompts:', allPrompts?.map(p => ({ 
      id: p.id, 
      name: p.name, 
      nameLength: p.name.length,
      nameWithEscapes: JSON.stringify(p.name),
      isActive: p.is_active 
    })));

    // Then fetch the specific prompt we need
    const { data: prompts, error: promptError } = await supabase
      .from('prompts')
      .select('*')
      .in('name', [systemPromptName, userPromptName])
      .eq('is_active', true);

    if (promptError) {
      console.error('Failed to fetch prompts:', promptError);
      throw new Error(`Failed to fetch prompts: ${promptError.message}`);
    }

    // Validate we got both prompts
    if (!prompts || prompts.length !== 2) {
      console.error('Missing required prompts:', {
        systemPrompt: systemPromptName,
        userPrompt: userPromptName,
        found: prompts?.length || 0
      });
      throw new Error('Could not find both required prompts. Please ensure both system and user prompts exist and are active.');
    }

    // Get the prompt templates
    const systemPromptTemplate = prompts.find(p => p.name === systemPromptName);
    const userPromptTemplate = prompts.find(p => p.name === userPromptName);

    if (!systemPromptTemplate || !userPromptTemplate) {
      throw new Error(`Missing required prompts: ${!systemPromptTemplate ? 'system' : 'user'} prompt not found`);
    }

    // Get persona data for context
    let contextData;
    if (personaId) {
      // Get all needed data in one query with proper joins
      const { data: companyData, error: companyError } = await adminClient
        .from('companies')
        .select(`
          id,
          name,
          industry,
          product_category,
          competitors (
            competitor_name
          ),
          ideal_customer_profiles!inner (
            id,
            vertical,
            company_size,
            region,
            personas!inner (
              id,
              title,
              department,
              seniority_level
            )
          )
        `)
        .eq('name', companyName)
        .single();

      if (companyError) {
        console.error('Failed to fetch company data:', companyError);
        throw new Error(`Failed to fetch company data: ${companyError.message}`);
      }

      // Find the specific persona we're interested in
      const persona = companyData?.ideal_customer_profiles
        ?.flatMap(icp => icp.personas)
        .find(p => p.id === personaId);

      const icp = companyData?.ideal_customer_profiles
        ?.find(icp => icp.personas?.some(p => p.id === personaId));

      if (!persona || !icp) {
        throw new Error('Persona not found for the given company');
      }

      // Add detailed debug logging
      console.log('Raw data:', {
        company_full: companyData,
        icp_data: icp,
        persona_data: persona,
        competitors_raw: companyData.competitors
      });

      // Structure data to match PromptContext interface
      contextData = {
        persona: {
          title: persona.title,
          department: persona.department,
          seniority_level: persona.seniority_level
        },
        icp: {
          vertical: icp.vertical,
          company_size: icp.company_size,
          region: icp.region
        },
        company: {
          name: companyData.name,
          industry: companyData.industry,
          product_category: companyData.product_category
        },
        competitors: companyData.competitors?.map(c => c.competitor_name) || []
      };

      // After fetching data
      console.log('Structured context data:', contextData);
    }

    // Parse the prompts with properly structured context
    const parsedSystemPrompt = parsePrompt(
      systemPromptTemplate.prompt_text,
      contextData || {
        persona: { title: '', department: '', seniority_level: '' },
        icp: { vertical: '', company_size: '', region: '' },
        company: { name: companyName, industry: null, product_category: null },
        competitors: []
      }
    );

    const parsedUserPrompt = parsePrompt(
      userPromptTemplate.prompt_text,
      contextData || {
        persona: { title: '', department: '', seniority_level: '' },
        icp: { vertical: '', company_size: '', region: '' },
        company: { name: companyName, industry: null, product_category: null },
        competitors: []
      }
    );

    // Save prompts to database for future reference
    const { error: promptLogError } = await adminClient
      .from('prompt_logs')
      .insert([{
        company_id: companyId,
        persona_id: personaId,
        system_prompt: parsedSystemPrompt,
        user_prompt: parsedUserPrompt,
        prompt_template_ids: [systemPromptTemplate.id, userPromptTemplate.id],
        context_data: contextData || null
      }]);

    if (promptLogError) {
      console.error('Failed to save prompt logs:', promptLogError);
      // Continue execution even if logging fails
    }

    // Use AI service factory to get the appropriate service
    const aiService = AIServiceFactory.getInstance().getService(model);
    const generatedQuestions = await aiService.generateQuestions(
      parsedSystemPrompt,
      parsedUserPrompt,
      contextData || {}
    );

    if (!generatedQuestions?.questions || !Array.isArray(generatedQuestions.questions)) {
      const error = new Error(`Invalid response from ${model}: missing or invalid questions array`);
      console.error(error);
      await batchTracker.updateBatchStatus(batchId, 'failed', error.message);
      throw error;
    }

    // Insert questions with batch information
    const queries: QueryWithId[] = [];
    for (const question of generatedQuestions.questions) {
      console.log('🔵 Inserting query with data:', {
        query_text: question.query_text,
        buyer_journey_phase: question.buyer_journey_phase,
        company_id: companyId,
        persona_id: personaId,
        user_id: user.id,
        query_batch_id: batchId,
        created_by_batch: true,
        account_id: accountId,
        product_id: productId
      });

      const { data: query, error: queryError } = await adminClient
        .from('queries')
        .insert({
          query_text: question.query_text,
          buyer_journey_phase: question.buyer_journey_phase,
          company_id: companyId,
          persona_id: personaId,
          user_id: user.id,
          query_batch_id: batchId,
          created_by_batch: true,
          account_id: accountId,
          product_id: productId
        })
        .select('id, query_text, buyer_journey_phase')
        .single();

      if (queryError) {
        console.error('Query insertion error:', queryError);
        continue;
      }

      queries.push(query);
    }

    await batchTracker.completeBatch(batchId);

    return {
      queries,
      batchId
    };

  } catch (error) {
    console.error('Question generation failed:', error);
    if (batchId) {
      await batchTracker.updateBatchStatus(
        batchId,
        'failed',
        error instanceof Error ? error.message : 'Unknown error during question generation'
      );
    }
    throw error;
  }
}

type ResponseMapper = (response: {
  text?: string | null;
  response_text?: string | null;
  citations?: string[] | null;
  url?: string | null;
  websearchqueries?: string[] | null;
}) => {
  query_id: number;
  response_text: string;
  answer_engine: string;
  url: string | null;
  citations: string[] | null;
  websearchqueries: string[] | null;
};

export async function processQueriesWithEngines(
  queries: QueryWithId[], 
  engines: EngineSelection,
  responseBatchId: string,
  accountId: string
) {
  console.log(`Processing ${queries.length} queries with selected engines:`, engines);
  
  const adminClient = await createAdminClient();
  const batchSize = 5;
  let totalInserted = 0;
  
  for (let i = 0; i < queries.length; i += batchSize) {
    const batch = queries.slice(i, i + batchSize);
    console.log(`Processing batch ${Math.floor(i/batchSize) + 1} of ${Math.ceil(queries.length/batchSize)}`);
    
    await Promise.all(
      batch.map(async (query) => {
        try {
          const enginePromises: Promise<any>[] = [];
          const responseObjects: ResponseMapper[] = [];

          if (engines.perplexity) {
            enginePromises.push(generatePerplexityResponse(query.query_text));
            responseObjects.push((r) => ({
              query_id: query.id,
              response_text: r.text || '',
              answer_engine: 'perplexity',
              url: null,
              citations: r.citations || [],
              websearchqueries: []
            }));
          }

          if (engines.gemini) {
            enginePromises.push(generateGeminiResponse(query.query_text));
            responseObjects.push((r) => ({
              query_id: query.id,
              response_text: r.response_text || '',
              answer_engine: 'gemini',
              url: r.url || null,
              citations: r.citations || [],
              websearchqueries: r.websearchqueries || []
            }));
          }

          if (engines.claude) {
            enginePromises.push(generateClaudeResponse(query.query_text));
            responseObjects.push((r) => ({
              query_id: query.id,
              response_text: r.response_text || '',
              answer_engine: 'claude',
              url: r.url || null,
              citations: r.citations || [],
              websearchqueries: []
            }));
          }

          if (engines.openai) {
            enginePromises.push(generateOpenAIResponse(query.query_text));
            responseObjects.push((r) => ({
              query_id: query.id,
              response_text: r.response_text || '',
              answer_engine: 'openai',
              url: r.url || null,
              citations: r.citations || [],
              websearchqueries: []
            }));
          }

          if (engines.google_search) {
            enginePromises.push(generateSerpResponse(query.query_text));
            responseObjects.push((r) => ({
              query_id: query.id,
              response_text: r.response_text || '',
              answer_engine: 'google_search',
              url: r.url || null,
              citations: r.citations || [],
              websearchqueries: []
            }));
          }

          const responses = await Promise.all(enginePromises);
          
          const { error: insertError } = await adminClient
            .from('responses')
            .insert(
              responses.map((response, index) => ({
                ...responseObjects[index](response),
                response_batch_id: responseBatchId,
                created_by_batch: true,
                account_id: accountId
              }))
            );
            
          if (insertError) {
            console.error(`Failed to insert responses for query ${query.id}:`, insertError);
          } else {
            totalInserted += responses.length;
            console.log(`Inserted ${responses.length} responses for query ${query.id}. Total inserted: ${totalInserted}`);
          }
        } catch (error) {
          console.error(`Failed to process query ${query.id}:`, error);
        }
      })
    );

    if (i + batchSize < queries.length) {
      console.log('Waiting before next batch...');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  
  console.log(`Completed processing all queries. Total responses inserted: ${totalInserted}`);
} 