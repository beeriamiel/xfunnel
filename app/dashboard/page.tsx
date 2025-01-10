import { Suspense } from 'react'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { DashboardWrapper } from './components/dashboard-wrapper'
import { Skeleton } from '@/components/ui/skeleton'
import { ClientWrapper } from './components/client-wrapper'
import { unstable_noStore as noStore } from 'next/cache'
import type { Database } from '@/types/supabase'

type SearchParams = { [key: string]: string | string[] | undefined }

type Props = {
  params: Promise<Record<string, never>>
  searchParams: Promise<SearchParams>
}

async function getCompanyData(searchParamsPromise: Promise<SearchParams>) {
  try {
    const searchParams = await searchParamsPromise
    const companyName = typeof searchParams.company === 'string' ? searchParams.company : undefined
    
    if (!companyName) {
      return { selectedCompany: null }
    }

    const supabase = createServerComponentClient<Database>({ cookies })
    
    // Get company data with proper error handling
    const { data: company, error } = await supabase
      .from('companies')
      .select('id, name, industry')
      .eq('name', companyName)
      .single()

    if (error) {
      console.error('Error fetching company:', error)
      return { selectedCompany: null, error: error.message }
    }

    return { selectedCompany: company }
  } catch (error) {
    console.error('Unexpected error in getCompanyData:', error)
    return { selectedCompany: null, error: 'Failed to fetch company data' }
  }
}

export default async function Page({ params, searchParams }: Props) {
  noStore()
  
  const searchParamsPromise = Promise.resolve(searchParams)
  const { selectedCompany, error } = await getCompanyData(searchParamsPromise)

  // Add error handling at the page level
  if (error) {
    // You might want to handle this differently, perhaps showing an error UI
    console.error('Error in dashboard page:', error)
  }

  return (
    <ClientWrapper>
      <Suspense fallback={<Skeleton className="h-screen" />}>
        <DashboardWrapper 
          selectedCompany={selectedCompany}
        />
      </Suspense>
    </ClientWrapper>
  )
}
