'use server'

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Company } from '../types/company'
import type { ICP, Persona, CompanyProfile } from '../types/analysis'

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
    
    // Fetch ICPs with their personas
    const { data: icps, error: icpsError } = await supabase
      .from('icps')
      .select(`
        id,
        vertical,
        company_size,
        region,
        personas (
          id,
          title,
          seniority_level,
          department
        )
      `)
      .eq('company_id', companyId)

    if (icpsError) {
      console.error('Error fetching ICPs:', icpsError)
      throw new Error(icpsError.message)
    }

    // Fetch all personas for this company
    const { data: personas, error: personasError } = await supabase
      .from('personas')
      .select('*')
      .eq('company_id', companyId)

    if (personasError) {
      console.error('Error fetching personas:', personasError)
      throw new Error(personasError.message)
    }

    if (!icps?.length && !personas?.length) {
      return null
    }

    return {
      icps: icps || [],
      personas: personas || [],
      products: [],
      competitors: []
    }
  } catch (error) {
    console.error('Error in getCompanyProfile:', error)
    throw error
  }
} 