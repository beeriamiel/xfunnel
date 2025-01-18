import { createAdminClient } from "@/app/supabase/server";
import { Database, CitationSourceType, ExistingCitationData } from "@/types/supabase";
import { MozEnrichmentQueue } from './moz-queue';
import { ContentScrapingQueue } from './content-queue';
import { classifyUrl, normalizeCompanyName } from '@/lib/utils/url-classifier';
import { SourceType } from '@/lib/types/batch';
import { ContentAnalysisService } from '@/lib/services/content-analysis-service';
import { SupabaseClient } from '@supabase/supabase-js';


type CitationInsert = Database['public']['Tables']['citations']['Insert'] & {
  mentioned_companies_count?: string[] | null;
};
type ResponseAnalysis = Database['public']['Tables']['response_analysis']['Row'] & {
  company_name: string;
};

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
  source_type?: CitationSourceType | null;
  // Add fields for data copying
  is_original?: boolean;
  origin_citation_id?: number | null;
  content_markdown?: string | null;
  moz_last_updated?: string | null;
  content_scraped_at?: string | null;
  content_analysis?: any | null;
  content_analysis_updated_at?: string | null;
  domain_authority?: number | null;
  page_authority?: number | null;
  spam_score?: number | null;
  root_domains_to_root_domain?: number | null;
  external_links_to_root_domain?: number | null;
}

export interface ParsedCitation {
  urls: string[];
  context: string[];
  relevance: number[];
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
      citation_order: index + 1,
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

  const adminClient = await createAdminClient();

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
        source_type: citation.source_type ?? 'EARNED',
        is_original: citation.is_original ?? true,
        origin_citation_id: citation.origin_citation_id,
        // Add these fields for data copying
        content_markdown: citation.content_markdown,
        moz_last_updated: citation.moz_last_updated,
        content_scraped_at: citation.content_scraped_at,
        content_analysis: citation.content_analysis,
        content_analysis_updated_at: citation.content_analysis_updated_at,
        domain_authority: citation.domain_authority,
        page_authority: citation.page_authority,
        spam_score: citation.spam_score,
        root_domains_to_root_domain: citation.root_domains_to_root_domain,
        external_links_to_root_domain: citation.external_links_to_root_domain
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

function cleanUrl(url: string): string {
  // Remove common Markdown/formatting artifacts only from the end of URLs
  return url
    .replace(/\]\.$/g, '') // Remove ]. at the end
    .replace(/\]$/g, '')   // Remove ] at the end
    .replace(/\.$/, '')    // Remove trailing period
    .trim();               // Remove any whitespace
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

  // Process ALL URLs with cleaning step
  const validUrls = citationsParsed.urls.filter(url => {
    try {
      const cleanedUrl = cleanUrl(url);
      console.log('URL Cleaning:', {
        original: url,
        cleaned: cleanedUrl,
        changed: url !== cleanedUrl
      });
      
      // Validate cleaned URL
      new URL(cleanedUrl);
      return true;
    } catch {
      console.warn('Invalid URL found:', url);
      return false;
    }
  }).map(url => cleanUrl(url)); // Apply cleaning to valid URLs

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
  const adminClient = await createAdminClient();

  try {
    // Extract URLs first
    const { urls, isValid } = extractCitationMetadata(citationsParsed);
    if (!isValid) {
      console.log('No valid citations to process');
      return;
    }

    // Check for existing citations
    const existingCitations = await Promise.all(
      urls.map(url => checkExistingCitation(url, adminClient))
    );

    // Split into new and reusable citations
    const newUrls = urls.filter((_, index) => !existingCitations[index]);
    
    // Create new citations from newUrls
    const newCitations = newUrls.map((url, index) => ({
      citation_url: url,
      citation_order: index + 1,
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
    }));

    // Type-safe handling of reusable citations
    interface ReusableCitation {
      url: string;
      existing: NonNullable<ExistingCitationData>;
    }

    const reusableCitations = urls
      .map((url, index) => ({
        url,
        existing: existingCitations[index]
      }))
      .filter((citation): citation is ReusableCitation => 
        citation.existing !== null);

    console.log('Citation processing split:', {
      totalUrls: urls.length,
      newUrls: newUrls.length,
      reusableUrls: reusableCitations.length
    });

    if (newUrls.length === 0) {
      console.log('All citations will be reused from existing database entries');
    }

    // Prepare reusable citations with data from originals
    const reusableCitationsData = reusableCitations.map(({ url, existing }) => {
      // Create base citation metadata without processing
      const baseCitation: CitationMetadata = {
        citation_url: url,
        citation_order: 0, // Will be set during batch insert
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

      // Return combined citation with existing data
      return {
        ...baseCitation,
        is_original: false,
        origin_citation_id: existing.id,
        content_markdown: existing.content_markdown,
        moz_last_updated: existing.moz_last_updated,
        content_scraped_at: existing.content_scraped_at,
        content_analysis: existing.content_analysis,
        content_analysis_updated_at: existing.content_analysis_updated_at,
        domain_authority: existing.domain_authority,
        source_type: existing.source_type,
        page_authority: existing.page_authority,
        spam_score: existing.spam_score,
        root_domains_to_root_domain: existing.root_domains_to_root_domain,
        external_links_to_root_domain: existing.external_links_to_root_domain
      };
    });

    // Combine all citations and proceed with insertion
    const allCitations = [...newCitations, ...reusableCitationsData];

    console.log('Starting citations transaction:', {
      responseAnalysisId: responseAnalysis.id,
      citationCount: allCitations.length
    });

    // Add URL classification to citations
    const citationsWithSourceType = allCitations.map(citation => {
      console.log('Citation classification input:', {
        citationUrl: citation.citation_url,
        companyName: responseAnalysis.company_name,
        hasCompanyName: !!responseAnalysis.company_name,
        mentionedCompanies: responseAnalysis.mentioned_companies,
        responseAnalysisId: responseAnalysis.id
      });

      return {
        ...citation,
        source_type: classifyUrl(
          citation.citation_url,
          responseAnalysis.company_name || '',
          responseAnalysis.mentioned_companies || []
        )
      };
    });

    // RESTORE: Insert citations and get their IDs
    const citationIds = await insertCitationBatch(citationsWithSourceType);

    console.log('Initial citation pool:', {
      citationIds,
      count: citationIds.length
    });

    try {
      console.log('Starting parallel enrichment processes:', {
        responseAnalysisId: responseAnalysis.id,
        citationIds,
        newCitationsCount: newCitations.length,
        reusableCitationsCount: reusableCitationsData.length
      });

      // Get only new citations for content scraping
      const { data: citationsToProcess, error } = await adminClient
        .from('citations')
        .select('id, citation_url, query_text, response_text, content_markdown')
        .in('id', citationIds)
        .eq('is_original', true);

      if (error) {
        throw error;
      }

      // Run content scraping and Moz enrichment for new citations if any
      if (citationsToProcess && citationsToProcess.length > 0) {
        try {
          const mozQueue = new MozEnrichmentQueue();
          const contentQueue = new ContentScrapingQueue();

          console.log('Starting enrichment processes for new citations:', {
            responseAnalysisId: responseAnalysis.id,
            citationCount: citationsToProcess.length,
            timestamp: new Date().toISOString()
          });

          await Promise.all([
            mozQueue.processBatch(citationsToProcess, responseAnalysis.company_id),
            contentQueue.processBatch(citationsToProcess, responseAnalysis.company_id)
          ]);
        } catch (enrichmentError) {
          console.error('Enrichment error:', {
            error: enrichmentError,
            responseAnalysisId: responseAnalysis.id,
            citationStats: {
              total: allCitations.length,
              new: newCitations.length,
              reused: reusableCitationsData.length
            }
          });
        }
      }

      // Always wait for content scraping to complete, regardless of citation type
      console.log('Waiting for any content scraping to complete...');
      await waitForContentScraping(citationIds, adminClient, responseAnalysis);

      // Process content analysis for new citations
      if (citationsToProcess && citationsToProcess.length > 0) {
        for (const citation of citationsToProcess) {
          try {
            const contentAnalysisService = new ContentAnalysisService();
            const analysis = await contentAnalysisService.analyzeContent(
              citation.query_text || '',
              citation.response_text || '',
              citation.content_markdown || ''
            );

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
          } catch (analysisError) {
            console.error('Content analysis failed for citation:', {
              citationId: citation.id,
              error: analysisError,
              timestamp: new Date().toISOString()
            });
          }
        }
      }

      // Process company mentions for all citations with content
      await processCompanyMentions(citationIds, responseAnalysis, adminClient);

    } catch (error) {
      console.error('Processing error:', {
        error,
        responseAnalysisId: responseAnalysis.id,
        citationStats: {
          total: allCitations.length,
          new: newCitations.length,
          reused: reusableCitationsData.length
        }
      });
      // Don't throw - we want to keep the citations even if processing fails
    }

    console.log('Successfully completed citations transaction');
  } catch (error) {
    console.error('Transaction failed:', error);
    throw error;
  }
}

// Add this new function after the existing imports
function countCompanyMentions(content: string, companies: string[]): string[] {
  if (!content || !companies || companies.length === 0) {
    return [];
  }

  console.log('Counting company mentions:', {
    contentLength: content.length,
    companyCount: companies.length
  });

  return companies.map(company => {
    // Use the same normalization as ranking detection
    const normalizedCompany = normalizeCompanyName(company);
    const normalizedContent = content.toLowerCase();
    
    // Count occurrences using normalized names
    const count = (normalizedContent.match(
      new RegExp(escapeRegExp(normalizedCompany), 'g')
    ) || []).length;

    return `${company}:${count}`;
  });
}

// Add helper function for RegExp escaping
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
} 
function normalizecompanyname (name: string): string  {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

// Add helper function if not already present
async function checkExistingCitation(
  url: string,
  adminClient: SupabaseClient<Database>
): Promise<ExistingCitationData | null> {
  // Calculate date 120 days ago
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 120);

  const { data: existingCitation } = await adminClient
    .from('citations')
    .select('*')
    .eq('citation_url', url)
    .eq('is_original', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  return existingCitation;
}
async function processCompanyMentions(
  citationIds: number[],
  responseAnalysis: ResponseAnalysis,
  adminClient: SupabaseClient<Database>
): Promise<void> {
  try {
    // Query all citations with content
    const { data: citationsWithContent, error: contentError } = await adminClient
      .from('citations')
      .select(`
        id,
        citation_url,
        query_text,
        response_text,
        content_markdown,
        is_original,
        content_analysis
      `)
      .in('id', citationIds)
      .not('content_markdown', 'is', null);

    if (contentError) {
      throw contentError;
    }

    if (citationsWithContent && citationsWithContent.length > 0) {
      console.log('Processing company mentions for citations:', {
        total: citationsWithContent.length,
        new: citationsWithContent.filter(c => c.is_original).length,
        reused: citationsWithContent.filter(c => !c.is_original).length
      });

      // Process each citation
      for (const citation of citationsWithContent) {
        try {
          if (citation.content_markdown && (responseAnalysis.mentioned_companies?.length ?? 0) > 0) {
            console.log('Counting company mentions for citation:', {
              citationId: citation.id,
              isOriginal: citation.is_original,
              companiesCount: responseAnalysis.mentioned_companies?.length ?? 0
            });

            const mentionCounts = countCompanyMentions(
              citation.content_markdown,
              responseAnalysis.mentioned_companies ?? []
            );

            // Update the citation with mention counts
            const { error: updateError } = await adminClient
              .from('citations')
              .update({ mentioned_companies_count: mentionCounts })
              .eq('id', citation.id);

            if (updateError) {
              console.error('Failed to update mention counts:', {
                citationId: citation.id,
                error: updateError
              });
            } else {
              console.log('Updated mention counts:', {
                citationId: citation.id,
                counts: mentionCounts
              });
            }
          }
        } catch (error) {
          console.error('Failed to process company mentions for citation:', {
            citationId: citation.id,
            error
          });
          // Continue with other citations
        }
      }
    }
  } catch (error) {
    console.error('Company mention processing failed:', {
      error,
      citationIds
    });
    // Don't throw - keep processing pipeline running
  }
}
// Add this helper function at the bottom of the file
async function waitForContentScraping(
  citationIds: number[],
  adminClient: SupabaseClient<Database>,
  responseAnalysis: ResponseAnalysis,
  maxAttempts = 30,
  pollInterval = 1000
): Promise<void> {
  console.log('Waiting for content scraping to complete:', {
    citationCount: citationIds.length,
    maxWaitTime: maxAttempts * (pollInterval / 1000) + ' seconds'
  });

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const { data: citations, error } = await adminClient
      .from('citations')
      .select('id, content_scraped_at, content_scraping_error, content_markdown')
      .in('id', citationIds);

    if (error) {
      console.error('Error checking citation status:', error);
      throw error;
    }

    const processed = citations?.filter(c => 
      c.content_scraped_at !== null || c.content_scraping_error !== null
    );

    console.log('Content scraping progress:', {
      attempt: attempt + 1,
      processed: processed?.length ?? 0,
      total: citationIds.length,
      withContent: citations?.filter(c => c.content_markdown !== null).length ?? 0,
      withErrors: citations?.filter(c => c.content_scraping_error !== null).length ?? 0
    });

    if (processed && processed.length === citationIds.length) {
      console.log('Content scraping completed for all citations');
      return;
    }

    await new Promise(resolve => setTimeout(resolve, pollInterval));
  }

  throw new Error(`Timeout waiting for content scraping after ${maxAttempts} attempts`);
}

