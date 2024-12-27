import { createAdminClient } from "@/app/supabase/server";
import { Database } from "@/types/supabase";

type CitationInsert = Database['public']['Tables']['citations']['Insert'];
type ResponseAnalysis = Database['public']['Tables']['response_analysis']['Row'];

interface CitationMetadata {
  citation_url: string;
  citation_order: number;
  response_analysis_id: number;
  company_id: number;
  recommended: boolean;
  company_mentioned: boolean;
  buyer_persona: string | null;
  buyer_journey_phase: string | null;
  rank_list: string | null;
  mentioned_companies: string[];
  icp_vertical: string | null;
  response_text: string;
  region: string | null;
  ranking_position: number | null;
  query_text: string | null;
}

interface ParsedCitation {
  urls: string[];
  context: string[];
  relevance: number[];
  source_types: ('Documentation' | 'Blog' | 'GitHub' | 'Guide' | 'Tutorial')[];
}

/**
 * Process citations from response analysis and prepare them for insertion
 */
export async function processCitations(
  responseAnalysis: ResponseAnalysis,
  citationsParsed: ParsedCitation | null
): Promise<CitationMetadata[]> {
  if (!citationsParsed || !citationsParsed.urls || citationsParsed.urls.length === 0) {
    console.log('No citations to process for response analysis:', responseAnalysis.id);
    return [];
  }

  console.log('Processing citations for response analysis:', {
    responseAnalysisId: responseAnalysis.id,
    citationCount: citationsParsed.urls.length
  });

  return citationsParsed.urls.map((url, index) => {
    const metadata: CitationMetadata = {
      citation_url: url,
      citation_order: index + 1, // 1-based indexing
      response_analysis_id: responseAnalysis.id,
      company_id: responseAnalysis.company_id,
      recommended: responseAnalysis.recommended ?? false,
      company_mentioned: responseAnalysis.company_mentioned ?? false,
      buyer_persona: responseAnalysis.buyer_persona,
      buyer_journey_phase: responseAnalysis.buying_journey_stage,
      rank_list: responseAnalysis.rank_list,
      mentioned_companies: responseAnalysis.mentioned_companies ?? [],
      icp_vertical: responseAnalysis.icp_vertical ?? '',
      response_text: responseAnalysis.response_text ?? '',
      region: responseAnalysis.geographic_region ?? '',
      ranking_position: responseAnalysis.ranking_position,
      query_text: responseAnalysis.query_text ?? ''
    };

    console.log('Created citation metadata:', {
      url,
      order: index + 1,
      responseAnalysisId: responseAnalysis.id
    });

    return metadata;
  });
}

/**
 * Insert a batch of citations into the database
 */
export async function insertCitationBatch(citations: CitationMetadata[]): Promise<void> {
  if (citations.length === 0) {
    console.log('No citations to insert');
    return;
  }

  const adminClient = createAdminClient();

  try {
    // Add detailed logging of the exact data being inserted
    console.log('Citation batch details:', {
      totalCitations: citations.length,
      firstCitation: citations[0],
      allCitations: citations,
      clientConfig: {
        // Log non-sensitive client config
        isSingleton: !!adminClient,
        tables: Object.keys(adminClient)
      }
    });

    const { data, error, status, statusText } = await adminClient
      .from('citations')
      .insert(citations.map(citation => ({
        citation_url: citation.citation_url,
        citation_order: citation.citation_order,
        response_analysis_id: citation.response_analysis_id,
        company_id: citation.company_id,
        recommended: citation.recommended,
        company_mentioned: citation.company_mentioned,
        buyer_persona: citation.buyer_persona,
        buyer_journey_phase: citation.buyer_journey_phase,
        rank_list: citation.rank_list,
        mentioned_companies: citation.mentioned_companies,
        icp_vertical: citation.icp_vertical,
        response_text: citation.response_text,
        region: citation.region,
        ranking_position: citation.ranking_position,
        query_text: citation.query_text
      })));

    // Log full response details
    console.log('Insert operation details:', {
      success: !error,
      status,
      statusText,
      error: error ? {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      } : null,
      dataInserted: !!data,
      rowCount: (data as unknown as CitationInsert[])?.length
    });

    if (error) {
      console.error('Error inserting citations:', {
        error,
        failedData: citations
      });
      throw error;
    }

    console.log('Successfully inserted citations batch:', {
      count: citations.length,
      insertedRows: (data as unknown as CitationInsert[])?.length
    });
  } catch (error) {
    console.error('Failed to insert citations:', {
      error,
      errorType: error instanceof Error ? error.constructor.name : typeof error,
      errorMessage: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
}

/**
 * Extract and validate citation URLs
 */
export function extractCitationMetadata(
  citationsParsed: ParsedCitation | null
): { urls: string[]; isValid: boolean } {
  if (!citationsParsed || !citationsParsed.urls) {
    return { urls: [], isValid: false };
  }

  const validUrls = citationsParsed.urls.filter(url => {
    try {
      new URL(url);
      return true;
    } catch {
      console.warn('Invalid URL found:', url);
      return false;
    }
  });

  return {
    urls: validUrls,
    isValid: validUrls.length > 0
  };
}

/**
 * Process citations in a transaction
 */
export async function processCitationsTransaction(
  responseAnalysis: ResponseAnalysis,
  citationsParsed: ParsedCitation | null
): Promise<void> {
  const adminClient = createAdminClient();

  try {
    // Start transaction
    const citations = await processCitations(responseAnalysis, citationsParsed);
    
    if (citations.length === 0) {
      console.log('No valid citations to process in transaction');
      return;
    }

    console.log('Starting citations transaction:', {
      responseAnalysisId: responseAnalysis.id,
      citationCount: citations.length
    });

    // Insert citations
    await insertCitationBatch(citations);

    console.log('Successfully completed citations transaction');
  } catch (error) {
    console.error('Transaction failed:', error);
    throw error;
  }
} 