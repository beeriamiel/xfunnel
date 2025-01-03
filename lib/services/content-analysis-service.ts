import { ClaudeService } from './ai/claude-service';
import { createAdminClient } from '@/app/supabase/server';

interface ContentAnalysisResponse {
  metrics: {
    keyword_usage: MetricScore;
    statistics: MetricScore;
    quotations: MetricScore;
    citations: MetricScore;
    fluency: MetricScore;
    technical_terms: MetricScore;
    authority: MetricScore;
    readability: MetricScore;
    unique_words: MetricScore;
  };
  analysis_details: {
    total_words: number;
    avg_sentence_length: number;
    keyword_density: number;
    technical_term_count: number;
    statistics_count: number;
    quote_count: number;
    citation_count: number;
  };
}

interface MetricScore {
  score: number;
  components: {
    [key: string]: number;
  };
}

export class ContentAnalysisService {
  private claudeService: ClaudeService;
  private adminClient;

  constructor() {
    this.claudeService = new ClaudeService();
    this.adminClient = createAdminClient();
  }

  private validateAnalysisResponse(response: any): ContentAnalysisResponse {
    // Check top-level structure
    if (!response.metrics || !response.analysis_details) {
      throw new Error('Invalid response structure: missing metrics or analysis_details');
    }

    // Required metric categories
    const requiredMetrics = [
      'keyword_usage', 'statistics', 'quotations', 'citations',
      'fluency', 'technical_terms', 'authority', 'readability', 'unique_words'
    ];

    // Validate each metric
    for (const metric of requiredMetrics) {
      if (!response.metrics[metric]) {
        throw new Error(`Missing required metric: ${metric}`);
      }
      if (typeof response.metrics[metric].score !== 'number') {
        throw new Error(`Invalid score for metric: ${metric}`);
      }
      if (!response.metrics[metric].components) {
        throw new Error(`Missing components for metric: ${metric}`);
      }
    }

    // Validate analysis details
    const requiredDetails = [
      'total_words', 'avg_sentence_length', 'keyword_density',
      'technical_term_count', 'statistics_count', 'quote_count', 'citation_count'
    ];

    for (const detail of requiredDetails) {
      if (typeof response.analysis_details[detail] !== 'number') {
        throw new Error(`Invalid or missing analysis detail: ${detail}`);
      }
    }

    return response as ContentAnalysisResponse;
  }

  async analyzeContent(
    queryText: string,
    responseText: string,
    contentMarkdown: string
  ): Promise<ContentAnalysisResponse> {
    try {
      console.log('Starting content analysis:', {
        queryTextLength: queryText?.length || 0,
        responseTextLength: responseText?.length || 0,
        markdownLength: contentMarkdown?.length || 0,
        timestamp: new Date().toISOString()
      });

      // Get prompts from database
      const { data: prompts, error: promptError } = await this.adminClient
        .from('prompts')
        .select('*')
        .in('name', ['Citation_Analysis v1.00 - system', 'Citation_Analysis v1.00 - user'])
        .eq('is_active', true);

      if (promptError || !prompts || prompts.length !== 2) {
        throw new Error('Failed to fetch analysis prompts');
      }

      const systemPrompt = prompts.find(p => p.name === 'Citation_Analysis v1.00 - system')?.prompt_text;
      const userPrompt = prompts.find(p => p.name === 'Citation_Analysis v1.00 - user')?.prompt_text;

      if (!systemPrompt || !userPrompt) {
        throw new Error('Missing required prompts for content analysis');
      }

      // Format XML content
      const formattedContent = `
<query>${queryText}</query>
<response>${responseText}</response>
<markdown>${contentMarkdown}</markdown>
      `.trim();

      // Use the same pattern as claude-service.ts
      const message = await this.claudeService.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 4096,
        system: systemPrompt,
        messages: [
          { role: 'user', content: userPrompt + '\n\n' + formattedContent }
        ]
      });

      if (!message.content[0] || message.content[0].type !== 'text') {
        throw new Error('Invalid response from Claude');
      }

      // Use the same cleaning function from claude-service.ts
      const cleanJSON = this.cleanMarkdownJSON(message.content[0].text);
      
      // Log cleaned response for debugging
      console.log('Cleaned Claude response:', {
        length: cleanJSON.length,
        preview: cleanJSON.substring(0, 200) + '...',
        timestamp: new Date().toISOString()
      });

      const parsedResponse = JSON.parse(cleanJSON);
      
      // Validate the response
      const validatedResponse = this.validateAnalysisResponse(parsedResponse);

      console.log('Content analysis completed:', {
        success: true,
        totalWords: validatedResponse.analysis_details.total_words,
        timestamp: new Date().toISOString()
      });

      return validatedResponse;

    } catch (error) {
      console.error('Content analysis failed:', {
        error,
        queryTextLength: queryText?.length || 0,
        responseTextLength: responseText?.length || 0,
        markdownLength: contentMarkdown?.length || 0,
        timestamp: new Date().toISOString(),
        errorDetails: error instanceof Error ? {
          message: error.message,
          name: error.name,
          stack: error.stack
        } : 'Unknown error type'
      });
      throw error;
    }
  }

  private cleanMarkdownJSON(text: string): string {
    return text
      .replace(/^```json\s*/g, '')
      .replace(/\s*```\s*$/g, '')
      .trim();
  }
}