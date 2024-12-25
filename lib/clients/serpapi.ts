import { getJson } from "serpapi";

interface SerpAPIResponse {
  organic_results?: Array<{
    link: string;
    title: string;
    snippet: string;
  }>;
  ai_overview?: {
    text_blocks: Array<{
      type: string;
      snippet: string;
    }>;
  };
}

export async function searchWithSerpApi(query: string): Promise<SerpAPIResponse> {
  try {
    console.log('Making SerpAPI request for query:', query);
    
    const response = await getJson({
      api_key: process.env.SERPAPI_API_KEY,
      engine: "google",
      q: query,
      google_domain: "google.com",
      gl: "us", // United States
      hl: "en", // English
      location: "United States",
    });

    console.log('SerpAPI raw response:', JSON.stringify(response, null, 2));
    return response as SerpAPIResponse;
  } catch (error) {
    console.error('SerpAPI search error:', error);
    throw new Error(`SerpAPI search failed: ${error}`);
  }
} 