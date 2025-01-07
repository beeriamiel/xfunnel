'use server'

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Company } from '../types/company'
import type { ICP, Persona, CompanyProfile, Query } from '../types/analysis'

export async function getCompanyById(id: number): Promise<Company | null> {
  try {
    const supabase = createServerComponentClient({ cookies })
    
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      console.error('Error fetching company:', error)
      throw new Error(error.message)
    }
    
    return data
  } catch (error) {
    console.error('Error in getCompanyById:', error)
    throw error
  }
}

export async function getCompanyProfile(companyId: number): Promise<CompanyProfile | null> {
  try {
    const supabase = createServerComponentClient({ cookies })
    
    // Fetch ICPs with their personas and queries in a single query
    const { data: icps, error: icpsError } = await supabase
      .from('ideal_customer_profiles')
      .select(`
        id,
        vertical,
        company_size,
        region,
        created_at,
        icp_batch_id,
        created_by_batch,
        company_id,
        personas (
          id,
          title,
          seniority_level,
          department,
          created_at,
          icp_id,
          queries (
            id,
            query_text,
            buyer_journey_phase,
            created_at,
            prompt_id,
            query_batch_id,
            created_by_batch,
            persona_id,
            company_id,
            user_id
          )
        )
      `)
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })

    if (icpsError) {
      console.error('Error fetching ICPs:', icpsError)
      throw new Error(icpsError.message)
    }

    // If no ICPs found, return null to indicate setup needed
    if (!icps?.length) {
      return null
    }

    // Process and organize the data
    const processedICPs = icps.map(icp => ({
      ...icp,
      personas: (icp.personas || []).map(persona => ({
        ...persona,
        queries: (persona.queries || [])
          .sort((a, b) => {
            // Sort by created_at (newest first)
            const dateA = new Date(a.created_at || 0)
            const dateB = new Date(b.created_at || 0)
            return dateB.getTime() - dateA.getTime()
          })
      }))
    }))

    // Extract all personas with their queries
    const allPersonas = processedICPs.reduce<Persona[]>((acc, icp) => {
      return acc.concat(icp.personas || [])
    }, [])

    return {
      icps: processedICPs,
      personas: allPersonas,
      products: [],
      competitors: []
    }
  } catch (error) {
    console.error('Error in getCompanyProfile:', error)
    throw error
  }
} 