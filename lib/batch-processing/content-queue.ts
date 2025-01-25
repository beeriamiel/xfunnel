import { createAdminClient } from '@/app/supabase/server';
import { FirecrawlClient } from '../clients/firecrawl';
import { SupabaseBatchTrackingService } from '@/lib/services/batch-tracking';

interface QueueStats {
  totalUrls: number;
  processedUrls: number;
  failedUrls: number;
  inProgress: boolean;
  currentUrl?: string;
}

interface Citation {
  id: number;
  citation_url: string;
  query_text?: string | null;
  response_text?: string | null;
  content_markdown?: string | null;
  content_scraped_at?: string | null;
  content_scraping_error?: string | null;
  is_original?: boolean | null;
  content_analysis?: string | null;
  content_analysis_updated_at?: string | null;
}

export class ContentScrapingQueue {
  private batchSize: number;
  private stats: QueueStats;
  private processing: boolean;
  private firecrawlClient: FirecrawlClient;
  private batchTracker: SupabaseBatchTrackingService | null = null;

  constructor(batchSize = 5) {
    this.batchSize = batchSize;
    this.processing = false;
    this.firecrawlClient = new FirecrawlClient();
    this.stats = {
      totalUrls: 0,
      processedUrls: 0,
      failedUrls: 0,
      inProgress: false
    };
  }

  private async initializeBatchTracker() {
    if (!this.batchTracker) {
      this.batchTracker = await SupabaseBatchTrackingService.initialize();
    }
    return this.batchTracker;
  }

  async getQueueStats(): Promise<QueueStats> {
    return this.stats;
  }

  private async processCitationContent(
    citation: Citation,
    batchId: string
  ): Promise<void> {
    // Skip PDFs and other document types
    if (citation.citation_url.toLowerCase().match(/\.(pdf|doc|docx|ppt|pptx)$/)) {
      console.log('Skipping document URL:', {
        citationId: citation.id,
        url: citation.citation_url,
        type: 'document'
      });
      return;
    }

    const adminClient = await createAdminClient();
    
    try {
      console.log('Processing citation content:', {
        citationId: citation.id,
        url: citation.citation_url
      });

      this.stats.currentUrl = citation.citation_url;
      
      const content = await this.firecrawlClient.scrapeUrl(citation.citation_url);
      
      const updateData: any = {
        content_scraped_at: new Date().toISOString()
      };

      if (content) {
        updateData.content_markdown = content;
        updateData.content_scraping_error = null;
      } else {
        updateData.content_scraping_error = 'Failed to scrape content';
      }

      const { error: updateError } = await adminClient
        .from('citations')
        .update(updateData)
        .eq('id', citation.id);

      if (updateError) {
        throw updateError;
      }

      this.stats.processedUrls++;
      console.log('Successfully processed citation content:', {
        citationId: citation.id,
        hasContent: !!content
      });
    } catch (error) {
      this.stats.failedUrls++;
      console.error('Error processing citation content:', {
        citationId: citation.id,
        url: citation.citation_url,
        error: error instanceof Error ? error.message : error
      });

      // Update citation with error
      await adminClient
        .from('citations')
        .update({
          content_scraping_error: error instanceof Error ? error.message : String(error),
          content_scraped_at: new Date().toISOString()
        })
        .eq('id', citation.id);

      throw error;
    }
  }

  async processBatch(
    citations: Array<{ id: number; citation_url: string }>,
    companyId: number,
    accountId: string
  ): Promise<void> {
    if (this.processing) {
      console.log('Queue is already being processed');
      return;
    }

    try {
      this.processing = true;
      this.stats.inProgress = true;

      const batchTracker = await this.initializeBatchTracker();
      const batchId = await batchTracker.createBatch('citations_content', companyId, accountId, {
        totalUrls: citations.length,
        processingType: 'content_scraping'
      });

      console.log('Starting content scraping batch:', {
        batchId,
        citationCount: citations.length
      });

      // Process in smaller batches
      for (let i = 0; i < citations.length; i += this.batchSize) {
        const batch = citations.slice(i, i + this.batchSize);
        
        // Process each citation in the batch sequentially
        for (const citation of batch) {
          try {
            await this.processCitationContent(citation, batchId);
          } catch (error) {
            console.error('Citation processing error:', {
              citationId: citation.id,
              error: error instanceof Error ? error.message : error
            });
            // Continue with next citation
            continue;
          }
        }

        // Small delay between batches to prevent rate limiting
        if (i + this.batchSize < citations.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      await batchTracker.completeBatch(batchId);
      console.log('Completed content scraping batch:', {
        batchId,
        stats: this.stats
      });
    } catch (error) {
      console.error('Batch processing error:', error);
      throw error;
    } finally {
      this.processing = false;
      this.stats.inProgress = false;
    }
  }
} 