export type BatchType = 
  | 'icp' 
  | 'query' 
  | 'response' 
  | 'response_analysis' 
  | 'citations_moz'
  | 'citations_content';

export type BatchStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

export interface BatchMetadata {
  batch_id: string;
  batch_type: BatchType;
  company_id: number;
  created_at?: string;
  completed_at?: string;
  status: BatchStatus;
  metadata?: Record<string, any>;
  error_message?: string;
}

export interface ICPBatchInfo {
  icp_batch_id: string;
  created_by_batch: boolean;
}

export interface QueryBatchInfo {
  query_batch_id: string;
  created_by_batch: boolean;
}

export interface ResponseBatchInfo {
  response_batch_id: string;
  created_by_batch: boolean;
}

export interface BatchTrackingService {
  createBatch(type: BatchType, companyId: number, metadata?: Record<string, any>): Promise<string>;
  updateBatchStatus(batchId: string, status: BatchStatus, errorMessage?: string): Promise<void>;
  updateBatchMetadata(batchId: string, metadata: Record<string, any>): Promise<void>;
  completeBatch(batchId: string): Promise<void>;
  getBatchInfo(batchId: string): Promise<BatchMetadata>;
  getCompanyBatches(companyId: number, type?: BatchType): Promise<BatchMetadata[]>;
}

export const SourceType = {
  OWNED: 'OWNED',
  COMPETITOR: 'COMPETITOR',
  UGC: 'UGC',
  EARNED: 'EARNED'
} as const;

export type SourceType = typeof SourceType[keyof typeof SourceType]; 