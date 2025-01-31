import { createClient } from '@/app/supabase/client';

export async function updateCompanySetupCompletion(companyId: number) {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('companies')
    .update({ setup_completed_at: new Date().toISOString() })
    .eq('id', companyId);
    
  if (error) {
    console.error('Error updating company setup completion:', error);
    throw error;
  }
} 