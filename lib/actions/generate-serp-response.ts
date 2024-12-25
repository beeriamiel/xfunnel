import { searchWithSerpApi } from '@/lib/clients/serpapi';

interface SerpResponse {
  response_text: string;
  answer_engine: string;
  url: string | null;
  citations: string[];
}

export async function generateSerpResponse(query: string): Promise<SerpResponse> {
  try {
    console.log('Starting SerpAPI search for query:', query);
    const searchResponse = await searchWithSerpApi(query);
    
    // Extract AI overview snippets
    const aiOverviewText = searchResponse.ai_overview?.text_blocks
      ?.map(block => block.snippet)
      .filter(Boolean)
      .join('\n\n') || '';

    console.log('AI Overview text:', aiOverviewText);

    // Extract organic result links for citations
    const citations = searchResponse.organic_results
      ?.map(result => result.link)
      .filter(Boolean) || [];

    console.log('Found citations:', citations);

    const response = {
      response_text: aiOverviewText || 'No AI overview available for this query.',
      answer_engine: 'google_search',
      url: null,
      citations,
    };

    console.log('Generated SerpAPI response:', response);
    return response;
  } catch (error) {
    console.error('Error generating SERP response:', error);
    throw error;
  }
} 