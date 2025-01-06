'use client'

import { createClient } from '@/app/supabase/server'
import { CompanySelector } from './company-selector'
import { useDashboardStore } from '../store'
import { useEffect, useState } from 'react'

interface Company {
  id: number
  name: string
  industry: string | null
}

export function CompanySelectorWrapper() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const selectedCompanyId = useDashboardStore(state => state.selectedCompanyId)
  const selectedCompany = companies.find(c => c.id === selectedCompanyId) || null

  useEffect(() => {
    async function fetchCompanies() {
      try {
        const supabase = await createClient()
        const { data, error } = await supabase
          .from('companies')
          .select('id, name, industry')
          .order('name')

        if (error) throw error
        setCompanies(data || [])
      } catch (error) {
        console.error('Error fetching companies:', error)
        setCompanies([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchCompanies()
  }, [])

  if (isLoading) {
    return null // Let the Suspense boundary handle loading state
  }

  return (
    <CompanySelector 
      selectedCompany={selectedCompany}
      companies={companies}
    />
  )
} 