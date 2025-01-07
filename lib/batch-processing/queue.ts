import { createAdminClient } from '@/app/supabase/server'
import { Database } from "@/types/supabase";
import { analyzeResponse, Response } from "./analysis";
import { SupabaseBatchTrackingService } from '@/lib/services/batch-tracking'
import { processCitationsTransaction } from './citation-processor';
import { CitationRecoveryQueue } from './citation-recovery-queue';

type ResponseAnalysisInsert = Omit<Database['public']['Tables']['response_analysis']['Insert'], 'id'> & {
  citations_parsed: JSON;
  competitors_list: string[];
  mentioned_companies: string[];
  solution_analysis?: JSON | null;
  ranking_position: number | null;
  created_by_batch?: boolean;
};

interface QueueStats {
  totalResponses: number;
  processedResponses: number;
  failedResponses: number;
  inProgress: boolean;
  currentId?: number;
}

export class ResponseAnalysisQueue {
  private batchSize: number;
  private stats: QueueStats;
  private processing: boolean;
  private retryLimit: number;
  private failedResponses: Set<number>;

  constructor(batchSize = 100, retryLimit = 3) {
    this.batchSize = batchSize;
    this.retryLimit = retryLimit;
    this.failedResponses = new Set();
    this.processing = false;
    this.stats = {
      totalResponses: 0,
      processedResponses: 0,
      failedResponses: 0,
      inProgress: false
    };
  }

  async getQueueStats(): Promise<QueueStats> {
    return this.stats;
  }

  private async fetchResponseBatch(startId: number, endId: number): Promise<Response[]> {
    const adminClient = createAdminClient();
    
    console.log(`Fetching batch from ID ${startId} to ${endId}`);
    
    const { data: responses, error } = await adminClient
      .from('responses')
      .select(`
        *,
        query:queries (
          id,
          buyer_journey_phase,
          query_text,
          company:companies (
            id,
            name,
            industry,
            product_category,
            competitors (
              competitor_name
            )
          ),
          persona:personas (
            id,
            title,
            seniority_level,
            department,
            icp:ideal_customer_profiles (
              id,
              vertical,
              company_size,
              region
            )
          )
        )
      `)
      .gte('id', startId)
      .lte('id', endId)
      .order('id')
      .limit(this.batchSize);

    if (error) {
      console.error('Error fetching responses:', error);
      throw error;
    }

    if (responses && responses.length > 0) {
      console.log(`Fetched ${responses.length} responses: IDs ${responses[0].id} to ${responses[responses.length - 1].id}`);
      
      // Add detailed competitor logging
      responses.forEach(response => {
        console.log(`Response ${response.id} competitors data:`, {
          rawCompetitors: response.query?.company?.competitors,
          companyName: response.query?.company?.name
        });
      });
    } else {
      console.log('No responses found in range');
    }

    return (responses || []).map(response => {
      if (!response.query) {
        return {
          id: response.id,
          query_id: response.query_id,
          response_text: response.response_text,
          answer_engine: response.answer_engine,
          url: response.url,
          created_at: response.created_at,
          citations: response.citations,
          web_search_queries: response.websearchqueries || [],
          query: {
            id: 0,
            company_id: 0,
            query_text: '',
            prompt_id: null,
            buyer_journey_phase: null,
            persona: undefined,
            company: undefined
          }
        } as Response;
      }

      const mappedResponse: Response = {
        id: response.id,
        query_id: response.query_id,
        response_text: response.response_text,
        answer_engine: response.answer_engine,
        url: response.url,
        created_at: response.created_at,
        citations: response.citations,
        web_search_queries: response.websearchqueries || [],
        query: {
          id: response.query.id,
          company_id: response.query.company?.id || 0,
          query_text: response.query.query_text,
          prompt_id: null,
          buyer_journey_phase: response.query.buyer_journey_phase || null,
          persona: response.query.persona && response.query.persona.icp ? {
            id: response.query.persona.id,
            title: response.query.persona.title,
            department: response.query.persona.department,
            icp: {
              id: response.query.persona.icp.id,
              vertical: response.query.persona.icp.vertical,
              region: response.query.persona.icp.region,
              company_size: response.query.persona.icp.company_size
            }
          } : undefined,
          company: response.query.company ? {
            id: response.query.company.id,
            name: response.query.company.name,
            industry: response.query.company.industry,
            created_at: null,
            competitors: response.query.company.competitors || [],
            ideal_customer_profiles: []
          } : undefined
        }
      };
      return mappedResponse;
    });
  }
  private async processBatch(responses: Response[], analysisBatchId: string): Promise<void> {
    const adminClient = createAdminClient();
    const analysisResults: ResponseAnalysisInsert[] = [];
    
    for (const response of responses) {
      try {
        console.log(`Processing response ${response.id}`);
        const analysis = await analyzeResponse(response);
        
        // Get company info from the response's query
        const companyId = response.query?.company?.id;
        const companyName = response.query?.company?.name;
        
        if (!companyId || !companyName) {
          console.error(`Missing company info for response ${response.id}`);
          this.failedResponses.add(response.id);
          this.stats.failedResponses++;
          continue;
        }

        analysisResults.push({
          response_id: response.id,
          citations_parsed: analysis.citations_parsed ?
          JSON.parse(JSON.stringify(analysis.citations_parsed)) : null,
          recommended: analysis.recommended,
          cited: analysis.cited,
          sentiment_score: analysis.sentiment_score,
          ranking_position: analysis.ranking_position,
          company_mentioned: analysis.company_mentioned,
          geographic_region: analysis.geographic_region,
          industry_vertical: analysis.industry_vertical,
          buyer_persona: analysis.buyer_persona,
          buying_journey_stage: analysis.buying_journey_stage,
          response_text: analysis.response_text,
          rank_list: analysis.rank_list,
          competitors_list: analysis.competitors_list,
          mentioned_companies: analysis.mentioned_companies,
          company_id: companyId,
          company_name: companyName,
          answer_engine: response.answer_engine || 'default',
          query_id: response.query_id,
          query_text: response.query?.query_text,
          prompt_id: response.query?.prompt_id || null,
          prompt_name: null,
          solution_analysis: analysis.solution_analysis ? 
          JSON.parse(JSON.stringify(analysis.solution_analysis)) : null,
          analysis_batch_id: analysisBatchId,
          created_by_batch: true
        });
  
        this.stats.processedResponses++;
        this.stats.currentId = response.id;
        console.log(`Successfully analyzed response ${response.id}`);
      } catch (error) {
        console.error(`Error processing response ${response.id}:`, error);
        this.failedResponses.add(response.id);
        this.stats.failedResponses++;
      }
    }
  

    if (analysisResults.length > 0) {
      console.log(`Upserting ${analysisResults.length} analyses for response IDs: ${analysisResults.map(a => a.response_id).join(', ')}`);
      
      // Delete existing analyses first
      const responseIds = analysisResults.map(a => a.response_id);
      const { error: deleteError } = await adminClient
        .from('response_analysis')
        .delete()
        .in('response_id', responseIds);

      if (deleteError) {
        console.error('Error deleting existing analyses:', deleteError);
        throw deleteError;
      }

      // Insert new analyses
      const { error: insertError } = await adminClient
        .from('response_analysis')
        .insert(analysisResults);

      if (insertError) {
        console.error('Error inserting analyses:', insertError);
        throw insertError;
      }

      // Add citation processing for each analysis
      for (const analysisData of analysisResults) {
        try {
          const { data: insertedAnalysis } = await adminClient
            .from('response_analysis')
            .select('*')
            .eq('response_id', analysisData.response_id!)
            .single();

          if (!insertedAnalysis) {
            console.error(`No analysis found for response ${analysisData.response_id}`);
            continue;
          }

          console.log(`Processing citations for response ${analysisData.response_id}:`, {
            hasAnalysis: !!insertedAnalysis,
            citationsParsed: analysisData.citations_parsed
          });

          await processCitationsTransaction(
            insertedAnalysis,
            typeof analysisData.citations_parsed === 'string' 
              ? JSON.parse(analysisData.citations_parsed)
              : analysisData.citations_parsed
          );

          console.log(`Successfully processed citations for response ${analysisData.response_id}`);
        } catch (citationError) {
          console.error(`Error processing citations for response ${analysisData.response_id}:`, citationError);
        }
      }

      console.log('Successfully updated analyses');
    }
  }

  async processQueue(startId: number, endId: number, companyId: number): Promise<void> {
    if (this.processing) {
      console.log('Queue is already being processed');
      return;
    }

    const adminClient = createAdminClient();
    const batchTracker = new SupabaseBatchTrackingService();

    try {
      this.processing = true;
      this.stats.inProgress = true;
      
      const analysisBatchId = await batchTracker.createBatch('response_analysis', companyId, {
        startId,
        endId,
        processingType: 'analysis'
      });

      let currentId = startId;
      while (currentId <= endId) {
        const batchEndId = Math.min(currentId + this.batchSize - 1, endId);
        const responses = await this.fetchResponseBatch(currentId, batchEndId);
        
        if (responses.length === 0) {
          console.log(`No responses found between ${currentId} and ${batchEndId}`);
          currentId = batchEndId + 1;
          continue;
        }

        await this.processBatch(responses, analysisBatchId);
        this.stats.totalResponses += responses.length;
        
        // Move to next batch
        currentId = batchEndId + 1;
        console.log(`Moving to next batch starting at ${currentId}`);
      }

      // After all batches are processed, run citation recovery
      const recoveryQueue = new CitationRecoveryQueue();
      await recoveryQueue.runRecovery(analysisBatchId);

      console.log('Completed processing all responses in range, including citation recovery');
    } catch (error) {
      console.error('Queue processing error:', error);
      throw error;
    } finally {
      this.processing = false;
      this.stats.inProgress = false;
    }
  }

  async retryFailed(): Promise<void> {
    if (this.failedResponses.size === 0) {
      console.log('No failed responses to retry');
      return;
    }

    console.log(`Retrying ${this.failedResponses.size} failed responses`);
    const failedIds = Array.from(this.failedResponses);
    this.failedResponses.clear();
    this.stats.failedResponses = 0;

    const batchTracker = new SupabaseBatchTrackingService();
    
    // Get company ID from the first response
    const adminClient = createAdminClient();
    const { data: firstResponse } = await adminClient
      .from('responses')
      .select('query:queries(company_id)')
      .eq('id', Math.min(...failedIds))
      .single();

    if (!firstResponse?.query?.company_id) {
      throw new Error('Could not find company ID for retry batch');
    }

    // Create a new analysis batch for retries
    const retryBatchId = await batchTracker.createBatch('response_analysis', firstResponse.query.company_id, {
      isRetry: true,
      originalIds: failedIds
    });

    for (let i = 0; i < failedIds.length; i += this.batchSize) {
      const batchIds = failedIds.slice(i, i + this.batchSize);
      const responses = await this.fetchResponseBatch(Math.min(...batchIds), Math.max(...batchIds));
      await this.processBatch(responses, retryBatchId);
    }
  }
} 