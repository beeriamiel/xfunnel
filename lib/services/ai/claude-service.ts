import Anthropic from '@anthropic-ai/sdk';
import { AIService, ICPGenerationResponse, QuestionGenerationResponse } from './types';

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

function cleanMarkdownJSON(text: string): string {
  // Remove markdown code block markers and any whitespace around them
  return text
    .replace(/^```json\s*/g, '')  // Remove opening ```json
    .replace(/\s*```\s*$/g, '')   // Remove closing ```
    .trim();                      // Clean any remaining whitespace
}

export class ClaudeService implements AIService {
  async generateICPs(
    systemPrompt: string,
    userPrompt: string,
    context: Record<string, any>
  ): Promise<ICPGenerationResponse> {
    try {
      console.log('Claude Service - Generating ICPs:', {
        contextKeys: Object.keys(context),
        promptLengths: {
          system: systemPrompt.length,
          user: userPrompt.length
        }
      });

      const message = await anthropic.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 4096,
        system: systemPrompt,
        messages: [
          { role: 'user', content: userPrompt }
        ],
      });

      if (!message.content[0] || message.content[0].type !== 'text') {
        console.error('Empty response from Claude');
        throw new Error('No content in Claude response');
      }

      console.log('Raw Claude response:', message.content[0].text);
      const cleanJSON = cleanMarkdownJSON(message.content[0].text);
      return JSON.parse(cleanJSON) as ICPGenerationResponse;
    } catch (error) {
      console.error('Claude ICP generation error:', error);
      throw error;
    }
  }

  async generateQuestions(
    systemPrompt: string,
    userPrompt: string,
    context: Record<string, any>
  ): Promise<QuestionGenerationResponse> {
    try {
      const message = await anthropic.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 4096,
        system: systemPrompt,
        messages: [
          { role: 'user', content: userPrompt }
        ],
      });

      if (!message.content[0] || message.content[0].type !== 'text') {
        console.error('Empty response from Claude');
        throw new Error('No content in Claude response');
      }

      const text = message.content[0].text;

      console.log('Raw Claude response:', text);
      const cleanJSON = cleanMarkdownJSON(text);
      console.log('Cleaned JSON:', cleanJSON);

      let parsedResponse: any;
      try {
        parsedResponse = JSON.parse(cleanJSON);
      } catch (parseError: unknown) {
        console.error('JSON Parse Error:', parseError);
        console.error('Raw response:', text);
        console.error('Cleaned JSON:', cleanJSON);
        throw new Error(`Invalid JSON response from Claude: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
      }

      if (!parsedResponse?.questions || !Array.isArray(parsedResponse.questions)) {
        console.error('Invalid response structure:', parsedResponse);
        throw new Error('Claude response missing questions array');
      }

      return parsedResponse as QuestionGenerationResponse;
    } catch (error) {
      console.error('Claude question generation error:', error);
      throw error;
    }
  }
} 