import { createClient } from '@/app/supabase/client'
import type { Database } from '@/types/supabase'

type ICP = Database['public']['Tables']['ideal_customer_profiles']['Insert']
type Persona = Database['public']['Tables']['personas']['Insert']

export async function createICP(
  icp: Pick<ICP, 'vertical' | 'company_size' | 'region' | 'product_id'>,
  companyId: number,
  accountId: string
) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('ideal_customer_profiles')
    .insert({
      ...icp,
      company_id: companyId,
      account_id: accountId,
      created_by_batch: false
    })
    .select('id')
    .single()

  if (error) {
    console.error('Error creating ICP:', error)
    throw error
  }

  return data
}

export async function createPersona(
  persona: Pick<Persona, 'title' | 'seniority_level' | 'department'>,
  icpId: number,
  accountId: string
) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('personas')
    .insert({
      ...persona,
      icp_id: icpId,
      account_id: accountId
    })
    .select('id')
    .single()

  if (error) {
    console.error('Error creating persona:', error)
    throw error
  }

  return data
} 