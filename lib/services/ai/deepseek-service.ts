import type { ContentAnalysisProvider } from './types';

interface DeepSeekMessage {
  role: 'user' | 'system';
  content: string;
}

interface DeepSeekResponse {
  content: Array<{
    type: 'text';
    text: string;
  }>;
}

export class DeepSeekService implements ContentAnalysisProvider {
  private apiKey: string;
  private baseUrl = 'https://api.deepseek.com/v1';

  constructor() {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      throw new Error('Missing DEEPSEEK_API_KEY environment variable');
    }
    this.apiKey = apiKey;
  }

  messages = {
    create: async ({
      model,
      system,
      messages,
      max_tokens
    }: {
      model: string;
      system: string;
      messages: DeepSeekMessage[];
      max_tokens: number;
    }): Promise<DeepSeekResponse> => {
      try {
        const response = await fetch(`${this.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: system },
              ...messages
            ],
            max_tokens,
            response_format: { type: 'json_object' }
          })
        });

        if (!response.ok) {
          const error = await response.json();
          console.error('DeepSeek API error response:', error);
          throw new Error(`DeepSeek API error: ${response.status} ${JSON.stringify(error)}`);
        }

        const data = await response.json();
        console.log('Raw DeepSeek Response:', JSON.stringify(data, null, 2));

        return {
          content: [{
            type: 'text',
            text: data.choices[0].message.content
          }]
        };
      } catch (error) {
        console.error('DeepSeek API error:', error);
        throw error;
      }
    }
  };
}