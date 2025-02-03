import { Anthropic } from '@anthropic-ai/sdk';
import { createAdminClient } from '../utils/supabase';

interface InternalRankingResult {
  rank_list: string | null;
  ranking_position: number | null;
  confidence: number;
  method: string;
}

interface Prompt {
  name: string;
  prompt_text: string;
}

async function findRankingWithPrompts(text: string, ourCompanyName: string, competitors: string[]): Promise<InternalRankingResult | null> {
  console.log("\n=== Starting findRankingWithPrompts ===");
  console.log("Input:", { 
    textLength: text.length, 
    ourCompanyName, 
    competitors,
    hasText: !!text,
    hasCompanyName: !!ourCompanyName,
    competitorsCount: competitors.length
  });

  const adminClient = await createAdminClient();

  try {
    console.log('Fetching prompts from database...');
    // Fetch prompts from database
    const { data: prompts, error: promptError } = await adminClient
      .from('prompts')
      .select('*')
      .in('name', ['Company Mention Analysis v1.00 - system', 'Company Mention Analysis v1.00 - user'])
      .eq('is_active', true);

    console.log('Prompts fetch result:', {
      success: !promptError,
      promptsFound: prompts?.length || 0,
      error: promptError?.message
    });

    if (promptError || !prompts || prompts.length !== 2) {
      console.error('Failed to fetch prompts:', {
        error: promptError,
        promptsCount: prompts?.length,
        promptNames: prompts?.map(p => p.name)
      });
      return null;
    }

    const systemPrompt = prompts.find(p => p.name.includes('system'))?.prompt_text;
    const userPrompt = prompts.find(p => p.name.includes('user'))?.prompt_text;

    console.log('Found prompts:', {
      hasSystemPrompt: !!systemPrompt,
      hasUserPrompt: !!userPrompt,
      systemPromptLength: systemPrompt?.length,
      userPromptLength: userPrompt?.length
    });

    if (!systemPrompt || !userPrompt) {
      console.error('Missing required prompts');
      return null;
    }

    // Replace variables in user prompt
    const filledUserPrompt = userPrompt
      .replace('[[RESPONSE_TEXT]]', text)
      .replace('[[COMPANY_NAME]]', ourCompanyName)
      .replace('[[COMPETITORS]]', competitors.join('\n'));

    console.log('\n=== Claude Request Details ===');
    console.log('System Prompt:', {
      full: systemPrompt,
      preview: systemPrompt.slice(0, 100) + '...'
    });
    console.log('User Prompt:', {
      full: filledUserPrompt,
      preview: filledUserPrompt.slice(0, 100) + '...'
    });
    console.log('Input Variables:', {
      responseTextLength: text.length,
      responseTextPreview: text.slice(0, 100) + '...',
      companyName: ourCompanyName,
      competitors: competitors
    });

    const anthropic = new Anthropic({
      apiKey: process.env.CLAUDE_API_KEY,
    });

    console.log('Calling Claude API...');
    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        { role: 'user', content: filledUserPrompt }
      ],
    });

    if (!message.content[0] || message.content[0].type !== 'text') {
      console.log('No content in Claude response');
      return null;
    }

    const response = message.content[0].text.trim();
    console.log('\n=== Raw Claude Response ===');
    console.log('Full Response:', response);
    console.log('Response Type:', typeof response);
    console.log('Response Length:', response.length);

    try {
      console.log('\n=== Parsing Attempt ===');
      const result = JSON.parse(response);
      console.log('Successfully parsed response:', {
        parsed: result,
        structure: {
          hasCompanyMentioned: 'company_mentioned' in result,
          hasMentionedCompanies: 'mentioned_companies' in result,
          hasRankList: 'rank_list' in result,
          hasRankingPosition: 'ranking_position' in result
        }
      });

      // Validate response structure
      if (
        typeof result.company_mentioned !== 'boolean' ||
        !Array.isArray(result.mentioned_companies) ||
        (result.rank_list !== null && typeof result.rank_list !== 'string') ||
        (result.ranking_position !== null && typeof result.ranking_position !== 'number')
      ) {
        console.error('Invalid response structure:', {
          company_mentioned_type: typeof result.company_mentioned,
          mentioned_companies_type: Array.isArray(result.mentioned_companies) ? 'array' : typeof result.mentioned_companies,
          rank_list_type: typeof result.rank_list,
          ranking_position_type: typeof result.ranking_position
        });
        return null;
      }

      return {
        rank_list: result.rank_list,
        ranking_position: result.ranking_position,
        confidence: 1.0,
        method: 'claude'
      };

    } catch (parseError) {
      console.error('Failed to parse Claude response:', {
        error: parseError,
        responsePreview: response.slice(0, 200)
      });
      return null;
    }

  } catch (error) {
    console.error('Error in findRankingWithPrompts:', {
      error,
      phase: 'unknown',
      stack: error instanceof Error ? error.stack : undefined
    });
    return null;
  }
} 