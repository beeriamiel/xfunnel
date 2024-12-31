import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateOpenAIResponse(query: string) {
  console.log('Calling OpenAI API with query:', query);

  try {
    const response = await openai.chat.completions.create({
      model: "chatgpt-4o-latest",
      messages: [
        {
          role: "system",
          content: "You are a helpful AI assistant focused on providing accurate information about companies and products. When citing sources, use [Citation: URL] format. Be specific about rankings and recommendations."
        },
        {
          role: "user",
          content: query
        }
      ],
      temperature: 0.2,
      max_tokens: 1000
    });

    console.log('Raw OpenAI Response:', JSON.stringify(response, null, 2));

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content in OpenAI response');
    }

    // Extract citations if present in the response
    // OpenAI doesn't provide citations directly, so we'll look for URLs in the response
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const citations = content.match(urlRegex) || [];

    return {
      response_text: content,
      answer_engine: 'openai',
      url: null,
      citations: citations,
      websearchqueries: []
    };
  } catch (error) {
    console.error('OpenAI API error:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
    throw error;
  }
} 