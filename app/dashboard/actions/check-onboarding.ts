'use server'

import { createClient } from '@/app/supabase/server'
import type { Step } from '../generate-analysis/types/setup'

interface CompanyData {
  setup_completed_at: string | null
  main_products: string[] | null
  competitors: { count: number }[] | null
  ideal_customer_profiles: {
    id: number
    personas: { count: number }[] | null
  }[] | null
}

export async function checkOnboardingStatus(companyId: number) {
  const supabase = await createClient()

  // Get all company data in one query for efficiency
  const { data: company } = await supabase
    .from('companies')
    .select(`
      setup_completed_at,
      main_products,
      competitors(count),
      ideal_customer_profiles(
        id,
        personas(count)
      )
    `)
    .eq('id', companyId)
    .single()

  if (!company) {
    throw new Error('Company not found')
  }

  const typedCompany = company as CompanyData

  // If setup is completed, don't force any steps
  if (typedCompany.setup_completed_at) {
    return null
  }

  // Check products
  if (!typedCompany.main_products?.length) {
    return 'product' as Step
  }

  // Check competitors
  if (!typedCompany.competitors?.[0]?.count) {
    return 'competitors' as Step
  }

  // Check ICPs
  if (!typedCompany.ideal_customer_profiles?.length) {
    return 'icps' as Step
  }

  // Check personas - at least one ICP should have personas
  const hasPersonas = typedCompany.ideal_customer_profiles.some(
    icp => icp.personas?.length > 0
  )
  if (!hasPersonas) {
    return 'personas' as Step
  }

  return null // All steps completed
} 