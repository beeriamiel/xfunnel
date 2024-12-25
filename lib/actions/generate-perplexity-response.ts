import OpenAI from 'openai';

// Define Perplexity-specific types
type PerplexityResponse = OpenAI.Chat.ChatCompletion & {
  citations?: string[];
};

type PerplexityClient = Omit<OpenAI, 'chat'> & {
  chat: {
    completions: {
      create(params: any): Promise<PerplexityResponse>;
    };
  };
};

const perplexity = new OpenAI({
  apiKey: process.env.PERPLEXITY_API_KEY!,
  baseURL: "https://api.perplexity.ai"
}) as PerplexityClient;

export async function generatePerplexityResponse(query: string) {
  console.log('Calling Perplexity API with query:', query);
  
  const response = await perplexity.chat.completions.create({
    model: "llama-3.1-sonar-large-128k-online",
    messages: [{
      role: "user",
      content: query
    }],
    temperature: 0.2,
    max_tokens: 1000,
    return_citations: true
  });
  
  console.log('Raw Perplexity Response:', response);
  
  return {
    text: response.choices[0].message.content,
    citations: response.citations || []
  };
} 