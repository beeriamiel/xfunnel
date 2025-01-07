'use server'

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Company } from '../types/company'

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