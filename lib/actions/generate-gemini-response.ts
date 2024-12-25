import { createGeminiClient } from "../clients/gemini";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, DynamicRetrievalMode } from "@google/generative-ai";

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
  try {
    console.log('Resolving redirect URL:', redirectUrl);
    const response = await fetch(redirectUrl, {
      method: 'HEAD',
      redirect: 'follow'
    });
    console.log('Resolved to:', response.url);
    return response.url;
  } catch (error) {
    console.error('Failed to resolve redirect URL:', redirectUrl, error);
    return redirectUrl;
  }
}

async function processCitationsWithRedirects(urls: string[]): Promise<string[]> {
  console.log('Processing citations with redirects:', urls);
  const resolvedUrls = await Promise.all(
    urls.map(async (url) => {
      if (url.includes('vertexaisearch.cloud.google.com/grounding-api-redirect')) {
        return resolveRedirectUrl(url);
      }
      return url;
    })
  );
  console.log('Resolved URLs:', resolvedUrls);
  return resolvedUrls.filter(Boolean);
}

export async function generateGeminiResponse(query: string) {
  const genAI = createGeminiClient();
  const model = genAI.getGenerativeModel({ 
    model: "models/gemini-1.5-pro-002",
    tools: [{
      googleSearchRetrieval: {
        dynamicRetrievalConfig: {
          mode: DynamicRetrievalMode.MODE_DYNAMIC,
          dynamicThreshold: 0.7,
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