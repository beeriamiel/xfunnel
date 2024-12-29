import { createAdminClient } from "@/app/supabase/server";
import { Database } from "@/types/supabase";
import { MozEnrichmentQueue } from './moz-queue';
import { ContentScrapingQueue } from './content-queue';
import { classifyUrl } from '@/lib/utils/url-classifier';
import { SourceType } from '@/lib/types/batch';
import { ContentAnalysisService } from '@/lib/services/content-analysis-service';

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
  source_type: ('Documentation' | 'Blog' | 'GitHub' | 'Guide' | 'Tutorial') | null;
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
    const sourceType = citationsParsed.source_types[index] || null;

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
      query_text: responseAnalysis.query_text ?? '',
      source_type: sourceType
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
export async function insertCitationBatch(citations: CitationMetadata[]): Promise<number[]> {
  if (citations.length === 0) {
    console.log('No citations to insert');
    return [];
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
        query_text: citation.query_text,
        source_type: citation.source_type
      })))
      .select('id');

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
      rowCount: data?.length
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
      insertedRows: data?.length
    });

    return (data || []).map(row => row.id);
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
    // Get company data for URL classification
    const { data: company } = await adminClient
      .from('companies')
      .select('name')
      .eq('id', responseAnalysis.company_id)
      .single();

    // RESTORE: Initial citation processing
    const citations = await processCitations(responseAnalysis, citationsParsed);
    
    if (citations.length === 0) {
      console.log('No valid citations to process in transaction');
      return;
    }

    console.log('Starting citations transaction:', {
      responseAnalysisId: responseAnalysis.id,
      citationCount: citations.length
    });

    // Add URL classification to citations
    const citationsWithSourceType = citations.map(citation => ({
      ...citation,
      source_type: classifyUrl(
        citation.citation_url,
        company?.name || '',
        responseAnalysis.mentioned_companies || []
      )
    }));

    // RESTORE: Insert citations and get their IDs
    const citationIds = await insertCitationBatch(citationsWithSourceType);

    try {
      console.log('Starting parallel enrichment processes:', {
        responseAnalysisId: responseAnalysis.id,
        citationIds
      });

      // Get the citations we just inserted
      const { data: newCitations, error } = await adminClient
        .from('citations')
        .select('id, citation_url, query_text, response_text, content_markdown')
        .in('id', citationIds);

      if (error) {
        throw error;
      }

      if (newCitations && newCitations.length > 0) {
        try {
          // Run Moz enrichment and content scraping in parallel
          const mozQueue = new MozEnrichmentQueue();
          const contentQueue = new ContentScrapingQueue();

          console.log('Starting enrichment processes:', {
            responseAnalysisId: responseAnalysis.id,
            citationCount: newCitations.length,
            timestamp: new Date().toISOString()
          });

          // Wait for both processes to complete
          await Promise.all([
            mozQueue.processBatch(newCitations, responseAnalysis.company_id),
            contentQueue.processBatch(newCitations, responseAnalysis.company_id)
          ]);

          console.log('Enrichment processes completed, waiting for content to be saved...');
          
          // Add delay to ensure content is saved
          await new Promise(resolve => setTimeout(resolve, 3000));

          // Get citations that have content
          const { data: citationsWithContent, error: contentError } = await adminClient
            .from('citations')
            .select(`
              id,
              citation_url,
              query_text,
              response_text,
              content_markdown
            `)
            .in('id', citationIds)
            .filter('content_markdown', 'not.is', null);

          if (contentError) {
            throw contentError;
          }

          // Process content analysis if we have citations with content
          if (citationsWithContent && citationsWithContent.length > 0) {
            console.log('Starting content analysis phase:', {
              totalCitations: citationsWithContent.length,
              citationIds: citationsWithContent.map(c => c.id),
              timestamp: new Date().toISOString()
            });

            const contentAnalysisService = new ContentAnalysisService();
            const BATCH_SIZE = 3; // Smaller batch size for Claude API

            // Process in batches
            for (let i = 0; i < citationsWithContent.length; i += BATCH_SIZE) {
              const batch = citationsWithContent.slice(i, i + BATCH_SIZE);
              
              console.log(`Processing content analysis batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(citationsWithContent.length/BATCH_SIZE)}`);

              // Process batch in parallel
              await Promise.all(
                batch.map(async (citation) => {
                  try {
                    console.log('Starting content analysis for citation:', {
                      citationId: citation.id,
                      contentLength: citation.content_markdown?.length,
                      timestamp: new Date().toISOString()
                    });

                    const analysis = await contentAnalysisService.analyzeContent(
                      citation.query_text || '',
                      citation.response_text || '',
                      citation.content_markdown || ''
                    );

                    // Update citation with analysis
                    const { error: updateError } = await adminClient
                      .from('citations')
                      .update({ 
                        content_analysis: JSON.stringify(analysis),
                        content_analysis_updated_at: new Date().toISOString()
                      })
                      .eq('id', citation.id);

                    if (updateError) {
                      throw updateError;
                    }

                    console.log('Content analysis completed for citation:', {
                      citationId: citation.id,
                      analysisWordCount: analysis.analysis_details.total_words,
                      timestamp: new Date().toISOString()
                    });

                  } catch (analysisError) {
                    console.error('Content analysis failed for citation:', {
                      citationId: citation.id,
                      error: analysisError,
                      timestamp: new Date().toISOString()
                    });
                    // Continue with other citations
                  }
                })
              );

              // Rate limiting between batches
              if (i + BATCH_SIZE < citationsWithContent.length) {
                console.log('Rate limiting pause between batches...');
                await new Promise(resolve => setTimeout(resolve, 2000));
              }
            }

            console.log('Content analysis phase completed:', {
              totalProcessed: citationsWithContent.length,
              timestamp: new Date().toISOString()
            });
          }

          console.log('All enrichment processes completed:', {
            responseAnalysisId: responseAnalysis.id,
            mozStats: await mozQueue.getQueueStats(),
            contentStats: await contentQueue.getQueueStats(),
            timestamp: new Date().toISOString()
          });

        } catch (enrichmentError) {
          console.error('Enrichment error:', {
            error: enrichmentError,
            responseAnalysisId: responseAnalysis.id,
            timestamp: new Date().toISOString()
          });
          // Don't throw - we want to keep the citations even if enrichment fails
        }
      }
    } catch (enrichmentError) {
      console.error('Enrichment error:', {
        error: enrichmentError,
        responseAnalysisId: responseAnalysis.id
      });
      // Don't throw - we want to keep the citations even if enrichment fails
    }

    console.log('Successfully completed citations transaction');
  } catch (error) {
    console.error('Transaction failed:', error);
    throw error;
  }
} 