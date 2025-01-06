import { Suspense } from 'react'
import { DashboardWrapper } from './components/dashboard-wrapper'
import { Skeleton } from '@/components/ui/skeleton'
import { createClient } from '@/app/supabase/server'
import { ClientWrapper } from './components/client-wrapper'
import { unstable_noStore as noStore } from 'next/cache'

type SearchParams = { [key: string]: string | string[] | undefined }

type Props = {
  params: Promise<Record<string, never>>
  searchParams: Promise<SearchParams>
}

async function getCompanyData(searchParamsPromise: Promise<SearchParams>) {
  const searchParams = await searchParamsPromise
  const companyName = typeof searchParams.company === 'string' ? searchParams.company : undefined
  
  if (!companyName) {
    return { selectedCompany: null }
  }

  const supabase = await createClient()
  
  // Get company data
  const { data: company, error } = await supabase
    .from('companies')
    .select('id, name, industry')
    .eq('name', companyName)
    .single()

  console.log('Company data:', company, 'Error:', error)

  if (error || !company) {
    return { selectedCompany: null }
  }

  return { selectedCompany: company }
}

export default async function Page({ params, searchParams }: Props) {
  noStore()
  
  const searchParamsPromise = Promise.resolve(searchParams)
  const { selectedCompany } = await getCompanyData(searchParamsPromise)

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
