'use server'

import { createClient } from '@/app/supabase/server'
import type { Step } from '../store'

export async function checkOnboardingStatus(companyId: number) {
  const supabase = await createClient()

  // Get all company data in one query for efficiency
  const { data: company } = await supabase
    .from('companies')
    .select(`
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

  // Check products
  if (!company.main_products?.length) {
    return 'product' as Step
  }

  // Check competitors
  if (!company.competitors?.[0]?.count) {
    return 'competitors' as Step
  }

  // Check ICPs
  if (!company.ideal_customer_profiles?.length) {
    return 'icps' as Step
  }

  // Check personas - at least one ICP should have personas
  const hasPersonas = company.ideal_customer_profiles.some(
    icp => icp.personas?.length > 0
  )
  if (!hasPersonas) {
    return 'personas' as Step
  }

  return null // All steps completed
} 