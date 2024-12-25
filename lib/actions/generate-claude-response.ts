import { createClaudeClient } from '../clients/claude';

export async function generateClaudeResponse(query: string) {
  console.log('Calling Claude API with query:', query);

  try {
    const client = createClaudeClient();
    const apiKey = process.env.CLAUDE_API_KEY;

    if (!apiKey) {
      throw new Error('Missing CLAUDE_API_KEY environment variable');
    }
    
    const response = await fetch(`${client.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: query
              }
            ]
          }
        ],
        temperature: 0.2
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Claude API error response:', error);
      throw new Error(`Claude API error: ${response.status} ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    console.log('Raw Claude Response:', JSON.stringify(data, null, 2));

    return {
      response_text: data.content[0].text,
      answer_engine: 'claude',
      url: null,
      citations: [],
      websearchqueries: []
    };
  } catch (error) {
    console.error('Claude API error:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
    throw error;
  }
} 