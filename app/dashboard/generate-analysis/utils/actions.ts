'use server'

import { createClient } from '@/app/supabase/server'
import type { Database } from '@/types/supabase'
import type { Company } from '../types/company'
import type { 
  ICP, 
  Persona, 
  CompanyProfile, 
  Query,
  QueryState,
  QueryRowState,
  QueryAction 
} from '../types/analysis'

export async function getCompanyById(id: number): Promise<Company | null> {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      console.error('Error fetching company:', error)
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(error.message)
    }
    
    return data
  } catch (error) {
    console.error('Error in getCompanyById:', error)
    return null
  }
}

function getQueryState(queries: Query[]): QueryState {
  if (!queries.length) {
    return {
      rowState: 'no_queries',
      lastRunDate: null,
      queryCount: 0,
      availableActions: ['generate_queries']
    }
  }

  // Sort queries by date and get the most recent
  const sortedQueries = [...queries].sort((a, b) => {
    const dateA = new Date(a.created_at || 0)
    const dateB = new Date(b.created_at || 0)
    return dateB.getTime() - dateA.getTime()
  })

  const lastRunDate = sortedQueries[0].created_at ? new Date(sortedQueries[0].created_at) : null
  
  // TODO: Add logic to check for responses when that feature is added
  const hasResponses = false

  if (hasResponses) {
    return {
      rowState: 'has_responses',
      lastRunDate,
      queryCount: queries.length,
      availableActions: ['view_queries', 'view_responses']
    }
  }

  return {
    rowState: 'has_queries',
    lastRunDate,
    queryCount: queries.length,
    availableActions: ['view_queries', 'generate_response']
  }
}

export async function getCompanyProfile(companyId: number | null, accountId: string) {
  if (!companyId) return null
  
  try {
    const supabase = await createClient()
    
    // Use explicit join for products through company_id
    const { data, error } = await supabase
      .from('companies')
      .select(`
        *,
        ideal_customer_profiles (
          id,
          region,
          vertical,
          company_size,
          personas (
            id,
            title,
            department,
            seniority_level,
            queries (
              id,
              query_text,
              buyer_journey_phase,
              created_at
            )
          )
        ),
        competitors (
          id,
          competitor_name
        ),
        products!products_company_id_fkey (
          id,
          name,
          company_id,
          account_id,
          created_at
        )
      `)
      .eq('id', companyId)
      .eq('account_id', accountId)
      .single()

    if (error) {
      console.log('Query attempted:', {
        companyId,
        accountId,
        error
      })
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(error.message)
    }
    
    return data
  } catch (error) {
    console.error('Error in getCompanyProfile:', error)
    return null
  }
} 