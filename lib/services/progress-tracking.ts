import { createAdminClient } from '@/app/supabase/server'

export async function updateGenerationProgress(
  companyId: number,
  status: 'generating_icps' | 'generating_questions' | 'complete' | 'failed',
  progress: number,
  errorMessage?: string
) {
  const adminClient = createAdminClient();

  const { error } = await adminClient
    .from('generation_progress')
    .upsert({
      company_id: companyId,
      status,
      progress,
      error_message: errorMessage,
      updated_at: new Date().toISOString()
    });

  if (error) {
    console.error('Failed to update progress:', error);
  }
}

export async function getGenerationProgress(companyId: number) {
  const adminClient = createAdminClient();

  const { data, error } = await adminClient
    .from('generation_progress')
    .select('*')
    .eq('company_id', companyId)
    .order('updated_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error('Failed to get progress:', error);
    return null;
  }

  return data;
} 