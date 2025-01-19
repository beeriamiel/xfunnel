import { createAdminClient } from '@/app/supabase/server';
import { fetchMozMetrics } from '../clients/moz';
import { SupabaseBatchTrackingService } from '../services/batch-tracking';
import { randomUUID } from 'crypto';
import { MozResponse } from '../clients/moz';

interface QueueStats {
  totalCitations: number;
  processedCitations: number;
  failedCitations: number;
  inProgress: boolean;
  currentBatch?: number;
  lastProcessedAt?: string;
  averageProcessingTime?: number;
  successRate?: number;
}

export class MozEnrichmentQueue {
  private batchSize: number;
  private stats: QueueStats;
  private processing: boolean;
  private retryLimit: number;
  private failedCitations: Set<number>;
  private processingTimes: number[];

  constructor(batchSize = 50, retryLimit = 3) {
    this.batchSize = batchSize;
    this.retryLimit = retryLimit;
    this.failedCitations = new Set();
    this.processing = false;
    this.processingTimes = [];
    this.stats = {
      totalCitations: 0,
      processedCitations: 0,
      failedCitations: 0,
      inProgress: false,
      successRate: 100
    };
  }

  private updateStats(processingTime: number) {
    this.processingTimes.push(processingTime);
    // Keep only last 100 processing times
    if (this.processingTimes.length > 100) {
      this.processingTimes.shift();
    }
    
    this.stats.averageProcessingTime = 
      this.processingTimes.reduce((a, b) => a + b, 0) / this.processingTimes.length;
    
    this.stats.successRate = 
      ((this.stats.processedCitations / 
        (this.stats.processedCitations + this.stats.failedCitations)) * 100) || 100;
    
    this.stats.lastProcessedAt = new Date().toISOString();
  }

  async getQueueStats(): Promise<QueueStats> {
    return this.stats;
  }

  private async fetchCitationBatch(): Promise<Array<{ id: number; citation_url: string }>> {
    const adminClient = await createAdminClient();
    
    const { data: citations, error } = await adminClient
      .from('citations')
      .select('id, citation_url')
      .is('domain_authority', null)
      .is('page_authority', null)
      .order('id')
      .limit(this.batchSize);

    if (error) {
      console.error('Error fetching citations:', error);
      throw error;
    }

    return citations || [];
  }

  private ensureValidUrl(url: string): string {
    if (!url) return url;
    
    // If URL already has a protocol, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // Add https:// as default protocol
    return `https://${url}`;
  }

  /**
   * Process a specific batch of citations with Moz metrics
   */
  private async processSpecificBatch(citations: Array<{ id: number; citation_url: string }>, batchId: string): Promise<void> {
    if (citations.length === 0) return;

    const startTime = Date.now();
    console.log('Starting batch processing:', {
      batchId,
      timestamp: new Date().toISOString(),
      citationCount: citations.length,
      firstCitation: citations[0].citation_url,
      lastCitation: citations[citations.length - 1].citation_url
    });

    try {
      // Ensure all URLs are properly formatted before sending to Moz API
      const mozResponse = await fetchMozMetrics(citations.map(c => this.ensureValidUrl(c.citation_url))) as MozResponse;
      const adminClient = await createAdminClient();

      let batchSuccesses = 0;
      let batchFailures = 0;

      // Add null check and proper response structure handling
      if (!mozResponse || !mozResponse.result || !mozResponse.result.results_by_site) {
        console.error('Invalid Moz API response structure:', mozResponse);
        throw new Error('Invalid Moz API response structure');
      }

      console.log('Moz API response structure:', {
        hasResponse: !!mozResponse,
        hasResult: !!(mozResponse && mozResponse.result),
        hasResultsBySite: !!(mozResponse && mozResponse.result && mozResponse.result.results_by_site),
        resultCount: mozResponse?.result?.results_by_site?.length || 0,
        firstResult: mozResponse?.result?.results_by_site?.[0] || null
      });

      for (const citation of citations) {
        const citationStartTime = Date.now();
        try {
          // Find matching result in Moz response
          const result = mozResponse.result.results_by_site.find(
            r => this.normalizeUrl(r.site_query.query) === this.normalizeUrl(citation.citation_url)
          );

          if (result?.site_metrics) {
            const { error: updateError } = await adminClient
              .from('citations')
              .update({
                domain_authority: result.site_metrics.domain_authority,
                page_authority: result.site_metrics.page_authority,
                spam_score: result.site_metrics.spam_score,
                root_domains_to_root_domain: result.site_metrics.root_domains_to_root_domain,
                external_links_to_root_domain: result.site_metrics.external_pages_to_root_domain,
                ...(result.site_metrics.last_crawled ? { moz_last_crawled: result.site_metrics.last_crawled } : {}),
                moz_last_updated: new Date().toISOString()
              })
              .eq('id', citation.id);

            if (updateError) {
              console.error('Citation update failed:', {
                batchId,
                citationId: citation.id,
                url: citation.citation_url,
                error: updateError,
                duration: Date.now() - citationStartTime
              });
              this.failedCitations.add(citation.id);
              this.stats.failedCitations++;
              batchFailures++;
            } else {
              console.log('Citation processed successfully:', {
                batchId,
                citationId: citation.id,
                url: citation.citation_url,
                metrics: {
                  domainAuthority: result.site_metrics.domain_authority,
                  pageAuthority: result.site_metrics.page_authority,
                  spamScore: result.site_metrics.spam_score
                },
                duration: Date.now() - citationStartTime
              });
              this.stats.processedCitations++;
              batchSuccesses++;
            }
          } else {
            const error = mozResponse.errors_by_site?.find(
              e => e.site_query.query === citation.citation_url
            );
            console.error('No metrics found for citation:', {
              batchId,
              citationId: citation.id,
              url: citation.citation_url,
              error: error?.error.message,
              duration: Date.now() - citationStartTime
            });
            this.failedCitations.add(citation.id);
            this.stats.failedCitations++;
            batchFailures++;
          }
        } catch (error) {
          console.error('Citation processing error:', {
            batchId,
            citationId: citation.id,
            url: citation.citation_url,
            error: error instanceof Error ? {
              name: error.name,
              message: error.message,
              stack: error.stack
            } : error,
            duration: Date.now() - citationStartTime
          });
          this.failedCitations.add(citation.id);
          this.stats.failedCitations++;
          batchFailures++;
        }
      }

      const batchDuration = Date.now() - startTime;
      console.log('Batch processing completed:', {
        batchId,
        timestamp: new Date().toISOString(),
        duration: batchDuration,
        totalCitations: citations.length,
        successful: batchSuccesses,
        failed: batchFailures,
        averageTimePerCitation: batchDuration / citations.length
      });

      this.updateStats(batchDuration);

    } catch (error) {
      const batchDuration = Date.now() - startTime;
      console.error('Batch processing failed:', {
        batchId,
        timestamp: new Date().toISOString(),
        duration: batchDuration,
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : error,
        citationCount: citations.length
      });

      citations.forEach(citation => {
        this.failedCitations.add(citation.id);
        this.stats.failedCitations++;
      });

      this.updateStats(batchDuration);
    }
  }

  /**
   * Process a specific list of citations
   */
  async processBatch(
    citations: Array<{ id: number; citation_url: string }>,
    companyId: number,
    accountId: string
  ): Promise<void> {
    if (citations.length === 0) return;

    const batchTracker = await SupabaseBatchTrackingService.initialize();
    const batchId = randomUUID();

    try {
      this.stats.inProgress = true;
      this.stats.totalCitations = citations.length;

      // Debug log
      console.log('Creating batch with:', {
        type: 'citations_moz',
        companyId,
        accountId,
        metadata: {
          citationCount: citations.length
        }
      });

      // Create a batch record with proper batch type and metadata
      await batchTracker.createBatch('citations_moz', companyId, accountId, {
        citationCount: citations.length
      });

      // Process citations in chunks of batchSize
      for (let i = 0; i < citations.length; i += this.batchSize) {
        const batch = citations.slice(i, i + this.batchSize);
        await this.processSpecificBatch(batch, batchId);
      }
    } catch (error) {
      console.error('Error processing citations batch:', {
        batchId,
        companyId,
        accountId,
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : error
      });
      throw error;
    } finally {
      this.stats.inProgress = false;
    }
  }

  /**
   * Process all unprocessed citations for a company
   */
  async processQueue(companyId: number, accountId: string): Promise<void> {
    if (this.processing) {
      console.log('Queue is already being processed');
      return;
    }

    const batchTracker = await SupabaseBatchTrackingService.initialize();
    const batchId = randomUUID();

    try {
      this.processing = true;
      this.stats.inProgress = true;

      await batchTracker.createBatch('citations_moz', companyId, accountId, {
        processingType: 'full_queue'
      });

      let hasMore = true;
      while (hasMore) {
        const citations = await this.fetchCitationBatch();
        if (citations.length === 0) {
          hasMore = false;
          continue;
        }

        await this.processSpecificBatch(citations, batchId);
        this.stats.totalCitations += citations.length;
      }

      // Handle any failed citations
      if (this.failedCitations.size > 0) {
        await this.retryFailed(accountId);
      }

      await batchTracker.completeBatch(batchId);
      console.log('Completed processing all citations');
    } catch (error) {
      console.error('Queue processing error:', error);
      throw error;
    } finally {
      this.processing = false;
      this.stats.inProgress = false;
    }
  }

  async retryFailed(accountId: string): Promise<void> {
    if (this.failedCitations.size === 0) {
      console.log('No failed citations to retry');
      return;
    }

    console.log(`Retrying ${this.failedCitations.size} failed citations`);
    const failedIds = Array.from(this.failedCitations);
    this.failedCitations.clear();
    this.stats.failedCitations = 0;

    const adminClient = await createAdminClient();
    const batchTracker = await SupabaseBatchTrackingService.initialize();

    const { data: citations, error } = await adminClient
      .from('citations')
      .select('id, citation_url')
      .in('id', failedIds);

    if (error) {
      console.error('Error fetching failed citations:', error);
      throw error;
    }

    if (citations && citations.length > 0) {
      const batchId = randomUUID();
      
      await batchTracker.createBatch('citations_moz', 0, accountId, {
        isRetry: true,
        originalIds: failedIds
      });

      for (let i = 0; i < citations.length; i += this.batchSize) {
        const batch = citations.slice(i, i + this.batchSize);
        await this.processSpecificBatch(batch, batchId);
      }

      await batchTracker.completeBatch(batchId);
    }
  }

  // Add helper method to normalize URLs for comparison
  private normalizeUrl(url: string): string {
    if (!url) return '';
    // Remove protocol, www, and trailing slashes for comparison
    return url.replace(/^https?:\/\//i, '')
              .replace(/^www\./i, '')
              .replace(/\/+$/, '')
              .toLowerCase();
  }
} 