import { createAdminClient } from "@/app/supabase/server";
import { Database } from "@/types/supabase";
import { processCitationsTransaction } from './citation-processor';

interface CitationsParsed {
  urls: string[];
  context: string[];
  relevance: number[];
  source_types: string[];
}

function isCitationsParsed(value: unknown): value is CitationsParsed {
  if (!value || typeof value !== 'object') return false;
  
  const candidate = value as Partial<CitationsParsed>;
  return (
    Array.isArray(candidate.urls) &&
    Array.isArray(candidate.context) &&
    Array.isArray(candidate.relevance) &&
    Array.isArray(candidate.source_types)
  );
}

export class CitationRecoveryQueue {
  async findMissingCitations(batchId: string): Promise<number[]> {
    const adminClient = await createAdminClient();
    
    try {
      // Get all response_analysis_ids from this batch
      const { data: batchResponses, error: batchError } = await adminClient
        .from('response_analysis')
        .select('id')
        .eq('analysis_batch_id', batchId);

      if (batchError) throw batchError;
      if (!batchResponses?.length) return [];

      const responseIds = batchResponses.map(r => r.id);

      // Find which ones don't have citations
      const { data: citations, error: citationError } = await adminClient
        .from('citations')
        .select('response_analysis_id')
        .in('response_analysis_id', responseIds);

      if (citationError) throw citationError;

      const citationResponseIds = new Set(citations?.map(c => c.response_analysis_id));
      
      // Return IDs that exist in response_analysis but not in citations
      return responseIds.filter(id => !citationResponseIds.has(id));
    } catch (error) {
      console.error('Error finding missing citations:', error);
      throw error;
    }
  }

  async processRecoveryQueue(missingIds: number[]): Promise<void> {
    const adminClient = await createAdminClient();
    
    try {
      console.log(`Starting recovery processing for ${missingIds.length} responses`);

      for (const responseId of missingIds) {
        try {
          // Get the full response analysis record
          const { data: responseAnalysis, error } = await adminClient
            .from('response_analysis')
            .select('*')
            .eq('id', responseId)
            .single();

          if (error) throw error;
          if (!responseAnalysis) {
            console.error(`No response analysis found for ID ${responseId}`);
            continue;
          }

          // Validate citations_parsed structure
          if (!responseAnalysis.citations_parsed || !isCitationsParsed(responseAnalysis.citations_parsed)) {
            console.error(`Invalid citations_parsed structure for response ${responseId}`, responseAnalysis.citations_parsed);
            continue;
          }

          // Process citations for this response
          await processCitationsTransaction(
            responseAnalysis,
            responseAnalysis.citations_parsed  // Pass the object directly, no parsing needed
          );

          console.log(`Successfully recovered citations for response ${responseId}`);
        } catch (error) {
          console.error(`Error processing recovery for response ${responseId}:`, error);
          // Continue with next response even if one fails
        }
      }

      console.log('Recovery queue processing completed');
    } catch (error) {
      console.error('Error processing recovery queue:', error);
      throw error;
    }
  }

  async runRecovery(batchId: string): Promise<void> {
    try {
      console.log(`Starting citation recovery for batch ${batchId}`);
      
      // Find missing citations
      const missingIds = await this.findMissingCitations(batchId);
      
      if (missingIds.length === 0) {
        console.log('No missing citations found for this batch');
        return;
      }

      console.log(`Found ${missingIds.length} responses missing citations`);
      
      // Process the recovery queue
      await this.processRecoveryQueue(missingIds);
      
      console.log(`Completed citation recovery for batch ${batchId}`);
    } catch (error) {
      console.error('Error running citation recovery:', error);
      throw error;
    }
  }
}