import { generateQuestions, processQueriesWithEngines } from "./generate-questions";
import { createAdminClient } from "@/app/supabase/server";
import { EngineSelection } from "@/app/company-actions";
import { updateGenerationProgress } from "@/lib/services/progress-tracking";
import { Database } from "@/types/supabase";
import { AIModelType } from "@/lib/services/ai/types";
import { SupabaseBatchTrackingService } from "@/lib/services/batch-tracking";
import { ResponseAnalysisQueue } from "@/lib/batch-processing/queue";

type Tables = Database['public']['Tables'];
type Persona = Tables['personas']['Row'];
type ICP = Tables['ideal_customer_profiles']['Row'];
type QueryWithId = Pick<Tables['queries']['Row'], 'id' | 'query_text' | 'buyer_journey_phase'>;

interface PersonaWithICP extends Pick<Persona, 'id' | 'title' | 'seniority_level' | 'department'> {
  icp: Pick<ICP, 'vertical' | 'company_size' | 'region'> & {
    company: Pick<Tables['companies']['Row'], 'name'>;
  };
}

async function updateResponseBatchIds(
  adminClient: ReturnType<typeof createAdminClient>,
  queryIds: number[],
  responseBatchId: string
) {
  try {
    const { error } = await adminClient
      .from('responses')
      .update({
        response_batch_id: responseBatchId,
        created_by_batch: true
      })
      .in('query_id', queryIds);

    if (error) {
      console.error('Failed to update responses with batch IDs:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error updating response batch IDs:', error);
    throw error;
  }
}

export async function generateQuestionsForAllPersonas(
  companyName: string,
  engines: EngineSelection,
  systemPromptName: string,
  userPromptName: string,
  model: AIModelType = 'chatgpt-4o-latest',
  icpBatchId?: string
) {
  const adminClient = createAdminClient();
  const batchTracker = new SupabaseBatchTrackingService();
  const batchSize = 3;
  const delayBetweenBatches = 5000;
  let responseBatchId: string | undefined;
  let successfulQueries = 0;
  let failedQueries = 0;
  let allGeneratedQueries: QueryWithId[] = [];

  try {
    // Get company ID first for progress tracking
    const { data: company } = await adminClient
      .from('companies')
      .select('id')
      .eq('name', companyName)
      .single();

    if (!company) throw new Error('Company not found');

    // Create a new batch for responses
    responseBatchId = await batchTracker.createBatch('response', company.id, {
      model,
      systemPromptName,
      userPromptName,
      engines: Object.keys(engines).filter((k): k is keyof typeof engines => engines[k as keyof typeof engines]),
      icpBatchId
    });
    await batchTracker.updateBatchStatus(responseBatchId, 'in_progress');

    // Get all personas for this company
    console.log('Fetching personas for company:', companyName);

    const query = adminClient
      .from('personas')
      .select(`
        id,
        title,
        seniority_level,
        department,
        icp:ideal_customer_profiles!inner (
          vertical,
          company_size,
          region,
          company:companies!inner (
            name
          )
        )
      `)
      .eq('icp.company.name', companyName);

    const { data: personas, error: personasError } = await query;

    console.log('Personas query result:', {
      personas,
      error: personasError,
      queryDetails: {
        table: 'personas',
        select: `id, title, seniority_level, department, icp:ideal_customer_profiles!inner(vertical, company_size, region, company:companies!inner(name))`,
        filter: `icp.company.name = ${companyName}`
      }
    });

    if (personasError) {
      console.error('Error fetching personas:', personasError);
      await updateGenerationProgress(company.id, 'failed', 0, 'Failed to fetch personas');
      throw new Error(`Failed to fetch personas: ${personasError.message}`);
    }

    if (!personas || personas.length === 0) {
      console.error('No personas found for company:', companyName);
      await updateGenerationProgress(company.id, 'failed', 0, 'No personas found');
      throw new Error('No personas found for company');
    }

    await updateGenerationProgress(company.id, 'generating_questions', 0);

    // Process personas in batches
    for (let i = 0; i < personas.length; i += batchSize) {
      const batch = personas.slice(i, i + batchSize);
      const batchProgress = Math.round((i / personas.length) * 100);
      
      await updateGenerationProgress(company.id, 'generating_questions', batchProgress);
      console.log(`Processing batch ${i / batchSize + 1} of ${Math.ceil(personas.length / batchSize)}`);
      
      try {
        // Process each persona in the batch concurrently
        const batchResults = await Promise.all(
          batch.map(async (persona) => {
            try {
              const result = await generateQuestions(
                companyName, 
                engines, 
                persona.id,
                systemPromptName,
                userPromptName,
                model
              );

              // 1. Collect queries for later processing
              allGeneratedQueries = [...allGeneratedQueries, ...result.queries];

              // 2. Link queries to response batch
              const queryIds = result.queries.map(q => q.id);
              if (queryIds.length > 0) {
                await updateResponseBatchIds(
                  adminClient,
                  queryIds,
                  responseBatchId!
                );
              }

              // 3. Track successful queries
              successfulQueries += result.queries.length;
              console.log(`Generated ${result.queries.length} questions for persona: ${persona.title}`);

              return result;
            } catch (error) {
              failedQueries++;
              console.error(`Failed to generate questions for persona ${persona.title}:`, error);
              return null;
            }
          })
        );

        // Filter out failed results and log success rate
        const successfulResults = batchResults.filter(Boolean);
        console.log(`Batch completion rate: ${successfulResults.length}/${batch.length} personas`);

        // Add delay between batches if not the last batch
        if (i + batchSize < personas.length) {
          console.log(`Waiting ${delayBetweenBatches/1000} seconds before next batch...`);
          await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
        }
      } catch (error) {
        console.error(`Batch processing failed at index ${i}:`, error);
        if (responseBatchId) {
          await batchTracker.updateBatchStatus(
            responseBatchId,
            'failed',
            `Failed during batch ${Math.floor(i / batchSize) + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }
        await updateGenerationProgress(
          company.id, 
          'failed', 
          batchProgress, 
          `Failed during batch ${Math.floor(i / batchSize) + 1}`
        );
        throw error;
      }
    }

    // 4. Process all collected queries with engines
    if (allGeneratedQueries.length > 0) {
      await processQueriesWithEngines(
        allGeneratedQueries, 
        engines,
        responseBatchId!
      );
      
      // 5. Start the response processing queue
      const queue = new ResponseAnalysisQueue();
      const { data: responseRange } = await adminClient
        .from('responses')
        .select('id')
        .eq('response_batch_id', responseBatchId)
        .order('id', { ascending: true });

      if (responseRange?.length) {
        const startId = responseRange[0].id;
        const endId = responseRange[responseRange.length - 1].id;
        await queue.processQueue(startId, endId, company.id);
      }
    }

    // Update final batch status
    await batchTracker.updateBatchStatus(responseBatchId!, 'completed');
    await batchTracker.updateBatchMetadata(responseBatchId!, {
      successful_queries: successfulQueries,
      failed_queries: failedQueries,
      total_personas: personas.length
    });

    await updateGenerationProgress(company.id, 'complete', 100);

    return {
      responseBatchId,
      statistics: {
        successful_queries: successfulQueries,
        failed_queries: failedQueries,
        total_personas: personas.length
      }
    };

  } catch (error) {
    console.error('Question generation for all personas failed:', error);
    if (responseBatchId) {
      await batchTracker.updateBatchStatus(
        responseBatchId,
        'failed',
        error instanceof Error ? error.message : 'Unknown error during batch question generation'
      );
    }
    throw error;
  }
} 