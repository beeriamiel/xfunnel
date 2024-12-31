import { createAdminClient } from '@/app/supabase/server';
import { BatchMetadata, BatchStatus, BatchTrackingService, BatchType } from '../types/batch';
import { randomUUID } from 'crypto';

export class SupabaseBatchTrackingService implements BatchTrackingService {
  private supabase = createAdminClient();

  async createBatch(
    type: BatchType,
    companyId: number,
    metadata?: Record<string, any>
  ): Promise<string> {
    const batchId = randomUUID();
    
    const { error } = await this.supabase
      .from('batch_metadata')
      .insert({
        batch_id: batchId,
        batch_type: String(type),
        company_id: companyId,
        status: 'pending',
        metadata
      });

    if (error) {
      console.error('Error creating batch:', error);
      throw error;
    }

    return batchId;
  }

  async updateBatchStatus(
    batchId: string,
    status: BatchStatus,
    errorMessage?: string
  ): Promise<void> {
    const updateData: Partial<BatchMetadata> = {
      status,
      ...(errorMessage && { error_message: errorMessage })
    };

    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString();
    }

    const { error } = await this.supabase
      .from('batch_metadata')
      .update(updateData)
      .eq('batch_id', batchId);

    if (error) {
      console.error('Error updating batch status:', error);
      throw error;
    }
  }

  async completeBatch(batchId: string): Promise<void> {
    await this.updateBatchStatus(batchId, 'completed');
  }

  async getBatchInfo(batchId: string): Promise<BatchMetadata> {
    const { data, error } = await this.supabase
      .from('batch_metadata')
      .select('*')
      .eq('batch_id', batchId)
      .single();

    if (error) {
      console.error('Error getting batch info:', error);
      throw error;
    }

    return data as BatchMetadata;
  }

  async getCompanyBatches(
    companyId: number,
    type?: BatchType
  ): Promise<BatchMetadata[]> {
    let query = this.supabase
      .from('batch_metadata')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (type) {
      query = query.eq('batch_type', type);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error getting company batches:', error);
      throw error;
    }

    return data as BatchMetadata[];
  }

  async updateBatchMetadata(
    batchId: string,
    metadata: Record<string, any>
  ): Promise<void> {
    const { error } = await this.supabase
      .from('batch_metadata')
      .update({ metadata })
      .eq('batch_id', batchId);

    if (error) {
      console.error('Error updating batch metadata:', error);
      throw error;
    }
  }
} 