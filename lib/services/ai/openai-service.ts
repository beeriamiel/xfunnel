import OpenAI from 'openai';
import { AIService, ICPGenerationResponse, QuestionGenerationResponse } from './types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class OpenAIService implements AIService {
  async generateICPs(
    systemPrompt: string,
    userPrompt: string,
    context: Record<string, any>
  ): Promise<ICPGenerationResponse> {
    try {
      console.log('OpenAI Service - Generating ICPs:', {
        contextKeys: Object.keys(context),
        promptLengths: {
          system: systemPrompt.length,
          user: userPrompt.length
        }
      });

      const completion = await openai.chat.completions.create({
        model: "chatgpt-4o-latest",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" }
      });

      const responseContent = completion.choices[0].message.content;
      if (!responseContent) {
        throw new Error('No content in OpenAI response');
      }

      return JSON.parse(responseContent) as ICPGenerationResponse;
    } catch (error) {
      console.error('OpenAI ICP generation error:', error);
      throw error;
    }
  }

  async generateQuestions(
    systemPrompt: string,
    userPrompt: string,
    context: Record<string, any>
  ): Promise<QuestionGenerationResponse> {
    try {
      const completion = await openai.chat.completions.create({
        model: "chatgpt-4o-latest",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" }
      });

      if (!completion.choices[0]?.message?.content) {
        console.error('Empty response from OpenAI');
        throw new Error('No content in OpenAI response');
      }

      console.log('Raw OpenAI response:', completion.choices[0].message.content);
      
      let parsedResponse: any;
      try {
        parsedResponse = JSON.parse(completion.choices[0].message.content);
      } catch (parseError: unknown) {
        console.error('JSON Parse Error:', parseError);
        console.error('Raw response:', completion.choices[0].message.content);
        throw new Error(`Invalid JSON response from OpenAI: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
      }

      if (!parsedResponse?.questions || !Array.isArray(parsedResponse.questions)) {
        console.error('Invalid response structure:', parsedResponse);
        throw new Error('OpenAI response missing questions array');
      }

      return parsedResponse as QuestionGenerationResponse;
    } catch (error) {
      console.error('OpenAI question generation error:', error);
      throw error;
    }
  }
} 