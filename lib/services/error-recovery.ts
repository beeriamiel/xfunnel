import { createAdminClient } from "@/app/supabase/server";
import { updateGenerationProgress } from "./progress-tracking";
import { generateQuestionsForAllPersonas } from "@/lib/actions/generate-questions-batch";
import { generateICPsAction } from "@/app/company-actions";
import { EngineSelection } from "@/app/company-actions";

type GenerationStatus = 'generating_icps' | 'generating_questions' | 'complete' | 'failed';

interface FailedGeneration {
  company_id: number;
  company_name: string;
  error_message: string;
  status: GenerationStatus;
  last_progress: number;
}

interface CompanyRow {
  company_id: number;
  error_message: string | null;
  status: GenerationStatus;
  progress: number;
  companies: {
    name: string;
  }[];
}

export async function getFailedGenerations(): Promise<FailedGeneration[]> {
  const adminClient = createAdminClient();

  const { data, error } = await adminClient
    .from('generation_progress')
    .select(`
      company_id,
      error_message,
      status,
      progress,
      companies!inner (
        name
      )
    `)
    .eq('status', 'failed')
    .returns<CompanyRow[]>();

  if (error) {
    console.error('Failed to fetch failed generations:', error);
    return [];
  }

  if (!data) return [];

  return data.map(row => ({
    company_id: row.company_id,
    company_name: row.companies[0]?.name || 'Unknown Company',
    error_message: row.error_message || '',
    status: row.status,
    last_progress: row.progress
  }));
}

export async function recoverFromError(
  companyName: string,
  engines: EngineSelection,
  systemPrompts: {
    icp: string;
    questions: string;
  },
  userPrompts: {
    icp: string;
    questions: string;
  }
): Promise<void> {
  const adminClient = createAdminClient();
  
  // Get the last status from the database
  const { data: lastBatch } = await adminClient
    .from('batch_metadata')
    .select('status')
    .eq('company_name', companyName)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  const lastStatus = lastBatch?.status || 'generating_icps';

  try {
    if (lastStatus === 'generating_icps') {
      // If it failed during ICP generation, start from the beginning
      await generateICPsAction(
        companyName,
        systemPrompts.icp,
        userPrompts.icp,
        systemPrompts.questions,
        userPrompts.questions,
        engines,
        {
          icpModel: 'gpt-4-turbo-preview',
          questionModel: 'gpt-4-turbo-preview'
        }
      );
    } else if (lastStatus === 'generating_questions') {
      // If it failed during question generation, only retry that part
      await generateQuestionsForAllPersonas(
        companyName,
        engines,
        systemPrompts.questions,
        userPrompts.questions,
        'gpt-4-turbo-preview'
      );
    }
  } catch (error) {
    console.error('Error during recovery:', error);
    throw error;
  }
} 