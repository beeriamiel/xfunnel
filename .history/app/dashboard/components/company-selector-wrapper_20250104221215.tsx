'use client'

import { CompanySelector } from './company-selector'
import { useDashboardStore } from '../store'
import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

interface Company {
  id: number
  name: string
  industry: string | null
}

interface CompanySelectorWrapperProps {
  companies: Company[]
}

export function CompanySelectorWrapper({ companies }: CompanySelectorWrapperProps) {
  const selectedCompanyId = useDashboardStore(state => state.selectedCompanyId)
  const setSelectedCompanyId = useDashboardStore(state => state.setSelectedCompanyId)
  const searchParams = useSearchParams()
  
  // Set company ID from URL if provided
  useEffect(() => {
    const companyId = searchParams.get('companyId')
    if (companyId) {
      setSelectedCompanyId(Number(companyId))
    } else if (companies.length > 0 && !selectedCompanyId) {
      // If no company selected and we have companies, select the first one
      setSelectedCompanyId(companies[0].id)
    }
  }, [searchParams, setSelectedCompanyId, companies, selectedCompanyId])

  const selectedCompany = companies.find(c => c.id === selectedCompanyId) || null

  return (
    <CompanySelector 
      selectedCompany={selectedCompany}
      companies={companies}
    />
  )
} 