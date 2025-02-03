'use server'

import { createClient } from '@/app/supabase/server'

export async function getPersonalSettingsData(accountId: string) {
  const supabase = await createClient()

  // Get account data
  const { data: accountData, error: accountError } = await supabase
    .from('accounts')
    .select(`
      name,
      plan_type,
      monthly_credits_available,
      monthly_credits_used,
      credits_renewal_date
    `)
    .eq('id', accountId)
    .single()

  if (accountError) {
    console.error('Error fetching account data:', accountError)
    throw accountError
  }

  // Get user data
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('No authenticated user')
  }

  const { data: userData, error: userError } = await supabase
    .from('account_users')
    .select('user_name')
    .eq('account_id', accountId)
    .eq('user_id', user.id)
    .single()

  if (userError) {
    console.error('Error fetching user data:', userError)
    throw userError
  }

  // Get company data
  const { data: companyData, error: companyError } = await supabase
    .from('companies')
    .select(`
      id,
      name,
      ideal_customer_profiles:ideal_customer_profiles(
        id,
        personas:personas(id)
      )
    `)
    .eq('account_id', accountId)
    .single()

  if (companyError) {
    console.error('Error fetching company data:', companyError)
    throw companyError
  }

  // Get response stats and coverage in a single query
  const { data: responseData, error: responseError } = await supabase
    .from('response_analysis')
    .select('created_at, geographic_region')
    .eq('account_id', accountId)
    .eq('company_id', companyData.id)

  if (responseError) {
    console.error('Error fetching response data:', responseError)
    throw responseError
  }

  // Calculate stats with default values for empty data
  const uniqueRegions = new Set(responseData?.filter(d => d.geographic_region).map(d => d.geographic_region) || [])
  const icpCount = companyData.ideal_customer_profiles?.length || 0
  const personaCount = companyData.ideal_customer_profiles?.reduce((acc, icp) => acc + (icp.personas?.length || 0), 0) || 0
  const totalResponses = responseData?.length || 0

  // Calculate responses this month with proper type checking and default to 0
  const responsesThisMonth = responseData?.filter(r => {
    if (!r.created_at) return false
    const createdAt = new Date(r.created_at)
    const monthAgo = new Date()
    monthAgo.setMonth(monthAgo.getMonth() - 1)
    return createdAt >= monthAgo
  }).length || 0

  // Get last activity date with proper type checking, default to null
  const lastActivity = responseData?.length ? 
    responseData
      .filter(r => r.created_at)
      .sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime())[0]?.created_at || null
    : null

  return {
    accountData,
    userData,
    companyData: {
      name: companyData.name
    },
    analysisCoverage: {
      icp_count: icpCount,
      persona_count: personaCount,
      region_count: uniqueRegions.size
    },
    responseStats: {
      total_responses: totalResponses,
      responses_this_month: responsesThisMonth,
      last_activity: lastActivity
    }
  }
} 