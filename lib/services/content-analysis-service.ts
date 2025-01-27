import { ClaudeService } from './ai/claude-service';
import { DeepSeekService } from './ai/deepseek-service';
import { createAdminClient } from '@/app/supabase/server';
import { SupabaseClient } from '@supabase/supabase-js';

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
  private deepseekService: DeepSeekService;
  private adminClient!: SupabaseClient;

  constructor() {
    this.claudeService = new ClaudeService();
    this.deepseekService = new DeepSeekService();
  }

  private async initAdminClient() {
    if (!this.adminClient) {
      this.adminClient = await createAdminClient();
    }
    return this.adminClient;
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
    contentMarkdown: string,
    accountId: string
  ): Promise<ContentAnalysisResponse> {
    try {
      // Direct markdown testing logs
      console.log('Raw content check:', {
        markdownContent: {
          raw: contentMarkdown,
          type: typeof contentMarkdown,
          length: contentMarkdown?.length || 0,
          isString: typeof contentMarkdown === 'string',
          firstChar: contentMarkdown?.[0],
          lastChar: contentMarkdown?.[contentMarkdown.length - 1],
          hasContent: !!contentMarkdown,
          preview: contentMarkdown?.substring(0, 150)
        },
        timestamp: new Date().toISOString()
      });

      // Enhanced initial logging
      console.log('Starting content analysis with details:', {
        queryText: {
          length: queryText?.length || 0,
          preview: queryText?.substring(0, 100) + '...',
          isEmpty: !queryText
        },
        responseText: {
          length: responseText?.length || 0,
          preview: responseText?.substring(0, 100) + '...',
          isEmpty: !responseText
        },
        contentMarkdown: {
          length: contentMarkdown?.length || 0,
          preview: contentMarkdown?.substring(0, 100) + '...',
          isEmpty: !contentMarkdown,
          isNull: contentMarkdown === null,
          isUndefined: contentMarkdown === undefined
        },
        accountId,
        timestamp: new Date().toISOString()
      });

      console.log('Starting content analysis:', {
        queryTextLength: queryText?.length || 0,
        responseTextLength: responseText?.length || 0,
        markdownLength: contentMarkdown?.length || 0,
        timestamp: new Date().toISOString()
      });

      // Get prompts from database
      const adminClient = await this.initAdminClient();
      const { data: prompts, error: promptError } = await adminClient
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

      // Add logging for prompts
      console.log('Content Analysis Prompts:', {
        systemPromptLength: systemPrompt.length,
        userPromptLength: userPrompt.length,
        systemPromptPreview: systemPrompt.substring(0, 200) + '...',
        userPromptPreview: userPrompt.substring(0, 200) + '...'
      });

      // Format XML content with enhanced validation
      const hasValidContent = contentMarkdown && contentMarkdown.length > 0;
      console.log('Content validation check:', {
        hasValidContent,
        contentType: typeof contentMarkdown,
        contentLength: contentMarkdown?.length || 0,
        timestamp: new Date().toISOString()
      });

      const formattedContent = `
<query>${queryText}</query>
<response>${responseText}</response>
<markdown>${contentMarkdown}</markdown>
      `.trim();

      // Enhanced XML formatting logs
      console.log('XML Content Formatting:', {
        preFormatting: {
          queryLength: queryText?.length || 0,
          responseLength: responseText?.length || 0,
          markdownLength: contentMarkdown?.length || 0
        },
        postFormatting: {
          totalLength: formattedContent.length,
          queryTag: {
            start: formattedContent.indexOf('<query>'),
            end: formattedContent.indexOf('</query>')
          },
          responseTag: {
            start: formattedContent.indexOf('<response>'),
            end: formattedContent.indexOf('</response>')
          },
          markdownTag: {
            start: formattedContent.indexOf('<markdown>'),
            end: formattedContent.indexOf('</markdown>')
          }
        },
        validation: {
          hasAllTags: 
            formattedContent.includes('<query>') && 
            formattedContent.includes('</query>') &&
            formattedContent.includes('<response>') &&
            formattedContent.includes('</response>') &&
            formattedContent.includes('<markdown>') &&
            formattedContent.includes('</markdown>')
        },
        timestamp: new Date().toISOString()
      });

      // Select model based on environment variable
      const selectedModel = process.env.CONTENT_ANALYSIS_MODEL || 'claude';
      
      console.log('Selected AI Model:', {
        model: selectedModel,
        envVar: process.env.CONTENT_ANALYSIS_MODEL,
        timestamp: new Date().toISOString()
      });

      let message;
      try {
        if (selectedModel === 'deepseek') {
          console.log('Initiating Deepseek request:', {
            model: 'deepseek-chat',
            maxTokens: 4096,
            inputSize: (systemPrompt + userPrompt + formattedContent).length,
            timestamp: new Date().toISOString()
          });

          message = await this.deepseekService.messages.create({
            model: 'deepseek-chat',
            max_tokens: 4096,
            system: systemPrompt,
            messages: [
              { role: 'user', content: userPrompt + '\n\n' + formattedContent }
            ]
          });

          console.log('Deepseek raw response:', {
            hasContent: !!message.content,
            contentLength: message.content?.length || 0,
            firstContentType: message.content?.[0]?.type,
            rawResponsePreview: JSON.stringify(message).substring(0, 200) + '...',
            timestamp: new Date().toISOString()
          });
        } else {
          message = await this.claudeService.messages.create({
            model: 'claude-3-sonnet-20240229',
            max_tokens: 4096,
            system: systemPrompt,
            messages: [
              { role: 'user', content: userPrompt + '\n\n' + formattedContent }
            ]
          });
        }
      } catch (modelError) {
        console.error('Model API error:', {
          model: selectedModel,
          error: modelError,
          timestamp: new Date().toISOString(),
          errorDetails: modelError instanceof Error ? {
            message: modelError.message,
            name: modelError.name,
            stack: modelError.stack
          } : 'Unknown error type'
        });
        throw new Error(`${selectedModel.toUpperCase()} API error: ${modelError instanceof Error ? modelError.message : 'Unknown error'}`);
      }

      if (!message.content[0] || message.content[0].type !== 'text') {
        const errorDetails = {
          model: selectedModel,
          contentLength: message.content?.length || 0,
          contentType: message.content[0]?.type,
          rawContent: JSON.stringify(message.content).substring(0, 200) + '...',
          timestamp: new Date().toISOString()
        };
        console.error('Invalid model response structure:', errorDetails);
        throw new Error(`Invalid response from ${selectedModel.toUpperCase()}`);
      }

      // Use the same cleaning function from claude-service.ts
      const cleanJSON = this.cleanMarkdownJSON(message.content[0].text);
      
      // Log cleaned response and parsing attempt
      console.log('Model response cleaning:', {
        model: selectedModel,
        originalLength: message.content[0].text.length,
        cleanedLength: cleanJSON.length,
        cleanedPreview: cleanJSON.substring(0, 200) + '...',
        timestamp: new Date().toISOString()
      });

      let parsedResponse;
      try {
        parsedResponse = JSON.parse(cleanJSON);
        console.log('JSON parsing successful:', {
          model: selectedModel,
          hasMetrics: !!parsedResponse.metrics,
          hasAnalysisDetails: !!parsedResponse.analysis_details,
          responseKeys: Object.keys(parsedResponse),
          timestamp: new Date().toISOString()
        });
      } catch (parseError) {
        console.error('JSON parsing failed:', {
          model: selectedModel,
          error: parseError,
          cleanedJSON: cleanJSON.substring(0, 200) + '...',
          timestamp: new Date().toISOString()
        });
        throw parseError;
      }

      // Validate the response
      const validatedResponse = this.validateAnalysisResponse(parsedResponse);

      console.log('Content analysis completed:', {
        success: true,
        totalWords: validatedResponse.analysis_details.total_words,
        timestamp: new Date().toISOString()
      });

      // Enhanced model response logging
      if (message.content[0] && message.content[0].type === 'text') {
        console.log('Model response content details:', {
          model: selectedModel,
          responseType: message.content[0].type,
          responseLength: message.content[0].text.length,
          responsePreview: message.content[0].text.substring(0, 200) + '...',
          timestamp: new Date().toISOString()
        });
      }

      return validatedResponse;

    } catch (error) {
      console.error('Content analysis failed:', {
        error,
        model: process.env.CONTENT_ANALYSIS_MODEL || 'claude',
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