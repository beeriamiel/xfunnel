import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { CompanySelector } from './company-selector'
import { ClientWrapper } from './client-wrapper'
import type { Database } from '@/types/supabase'
import { Skeleton } from "@/components/ui/skeleton"

interface Company {
  id: number
  name: string
  industry: string | null
}

interface CompanySelectorWrapperProps {
  selectedCompany: Company | null
}

function CompanySelectorFallback() {
  return (
    <ClientWrapper>
      <div className="flex items-center space-x-2">
        <Skeleton className="h-10 w-[180px]" />
      </div>
    </ClientWrapper>
  )
}

export async function CompanySelectorWrapper({ selectedCompany }: CompanySelectorWrapperProps) {
  try {
    const cookieStore = cookies()
    const supabase = createServerComponentClient<Database>({
      cookies: () => cookieStore
    })
    
    // RLS will automatically handle access control here
    const { data: companies, error } = await supabase
      .from('companies')
      .select('id, name, industry')
      .order('name')

    if (error) {
      console.error('Error fetching companies:', error)
      // Return empty state but don't expose error details to client
      return <CompanySelectorFallback />
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
    return <CompanySelectorFallback />
  }
} 