import { createGeminiClient } from "../clients/gemini";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, DynamicRetrievalMode } from "@google/generative-ai";
import { resolveUrlWithFirecrawl } from '../utils/url-resolver';

interface GeminiCitation {
  startIndex?: number;
  endIndex?: number;
  uri?: string;
  license?: string;
}

interface GroundingChunkWeb {
  uri?: string;
}

interface GroundingChunk {
  web?: GroundingChunkWeb;
}

interface GroundingMetadata {
  groundingChunks?: GroundingChunk[];
  webSearchQueries?: string[];
}

async function resolveRedirectUrl(redirectUrl: string): Promise<string> {
  const MAX_RETRIES = 2;
  const TIMEOUT_MS = 2000;
  const BACKOFF_MS = 500;

  const headers = {
    'User-Agent': 'Mozilla/5.0 (compatible; XFunnelBot/1.0)',
    'Accept': '*/*'
  };

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      if (attempt > 0) {
        // Wait before retry with exponential backoff
        await new Promise(resolve => setTimeout(resolve, BACKOFF_MS * attempt));
      }

      console.log(`Resolution attempt ${attempt + 1}/${MAX_RETRIES + 1} for:`, redirectUrl);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

      const response = await fetch(redirectUrl, {
        method: 'GET',
        redirect: 'follow',
        headers,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        console.log('URL resolution successful:', response.url);
        return response.url;
      }
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed:`, error instanceof Error ? error.message : 'Unknown error');
      
      // If it's the last attempt, try Firecrawl as fallback
      if (attempt === MAX_RETRIES) {
        console.log('All standard resolution attempts failed, trying Firecrawl fallback for:', redirectUrl);
        return resolveUrlWithFirecrawl(redirectUrl);
      }
    }
  }

  // If everything fails, return original URL
  return redirectUrl;
}

async function processCitationsWithRedirects(urls: string[]): Promise<string[]> {
  console.log('Processing citations with redirects:', urls);
  const resolvedUrls = await Promise.all(
    urls.map(async (url) => {
      if (url.includes('vertexaisearch.cloud.google.com/grounding-api-redirect')) {
        console.log('Detected Vertex AI redirect URL, attempting resolution:', url);
        return resolveUrlWithFirecrawl(url);
      }
      return resolveRedirectUrl(url);
    })
  );
  console.log('Resolved URLs:', resolvedUrls);
  return resolvedUrls.filter(Boolean);
}

export async function generateGeminiResponse(query: string) {
  const genAI = createGeminiClient();
  console.log('Initializing Gemini model: models/gemini-1.5-flash-latest');
  const model = genAI.getGenerativeModel({ 
    model: "models/gemini-1.5-flash-latest",
    tools: [{
      googleSearchRetrieval: {
        dynamicRetrievalConfig: {
          mode: DynamicRetrievalMode.MODE_DYNAMIC,
          dynamicThreshold: 0.3,
        },
      },
    }],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 1000,
    },
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ],
  });

  try {
    console.log('Calling Gemini API with query:', query);

    const result = await model.generateContent([
      { text: query }
    ]);

    const response = await result.response;
    const text = response.text();
    
    // Log full response with proper depth to see nested objects
    console.log('Raw Gemini Response:', JSON.stringify({
      text: text,
      candidates: response.candidates,
      promptFeedback: response.promptFeedback,
      groundingMetadata: response.candidates?.[0]?.groundingMetadata
    }, null, 2));

    // Get standard citations
    const standardCitationsOriginal = response.candidates?.[0]?.citationMetadata?.citationSources?.map(
      (citation: GeminiCitation) => citation.uri || ''
    ).filter((uri): uri is string => Boolean(uri)) || [];

    // Get grounded citations from groundingMetadata in candidates[0]
    const groundedCitationsOriginal = (response.candidates?.[0]?.groundingMetadata as GroundingMetadata)?.groundingChunks?.map(
      (chunk: GroundingChunk) => chunk.web?.uri
    ).filter((uri): uri is string => Boolean(uri)) || [];

    console.log('Original citations:', {
      standard: standardCitationsOriginal,
      grounded: groundedCitationsOriginal
    });

    // Process both types of citations through redirect resolution
    const standardCitations = await processCitationsWithRedirects(standardCitationsOriginal);
    const groundedCitations = await processCitationsWithRedirects(groundedCitationsOriginal);

    console.log('Resolved citations:', {
      standard: standardCitations,
      grounded: groundedCitations
    });

    // Get web search queries from groundingMetadata in candidates[0]
    const webSearchQueries = response.candidates?.[0]?.groundingMetadata?.webSearchQueries || [];

    // Combine resolved citations
    const citations = [...standardCitations, ...groundedCitations].filter(Boolean);

    console.log('Final citations to save:', citations);
    console.log('Web search queries to save:', webSearchQueries);

    return {
      response_text: text,
      answer_engine: "gemini",
      url: null,
      citations: citations,
      websearchqueries: webSearchQueries
    };
  } catch (error) {
    console.error("Gemini API error:", error);
    throw error;
  }
} 