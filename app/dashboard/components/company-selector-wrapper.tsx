import { createClient } from '@/app/supabase/server'
import { CompanySelector } from './company-selector'
import { ClientWrapper } from './client-wrapper'

interface Company {
  id: number
  name: string
  industry: string | null
}

interface CompanySelectorWrapperProps {
  selectedCompany: Company | null
}

export async function CompanySelectorWrapper({ selectedCompany }: CompanySelectorWrapperProps) {
  try {
    const supabase = await createClient()
    
    const { data: companies, error } = await supabase
      .from('companies')
      .select('id, name, industry')
      .order('name')

    if (error) {
      console.error('Error fetching companies:', error)
      throw error
    }

    return (
      <ClientWrapper>
        <CompanySelector 
          selectedCompany={selectedCompany} 
          companies={companies || []} 
        />
      </ClientWrapper>
    )
  } catch (error) {
    console.error('Error in CompanySelectorWrapper:', error)
    // Return empty state instead of null
    return (
      <ClientWrapper>
        <CompanySelector 
          selectedCompany={null} 
          companies={[]} 
        />
      </ClientWrapper>
    )
  }
} 