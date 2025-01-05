import { Suspense } from 'react'
import { DashboardContent } from './components/dashboard-content'
import { Skeleton } from '@/components/ui/skeleton'
import { createClient } from '@/app/supabase/server'
import { unstable_noStore as noStore } from 'next/cache'

type SearchParams = { [key: string]: string | string[] | undefined }

type Props = {
  searchParams: SearchParams
}

async function getCompanyData(searchParams: SearchParams) {
  noStore()
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

  if (error || !company) {
    return { selectedCompany: null }
  }

  return { selectedCompany: company }
}

export default async function Page({ searchParams }: Props) {
  const { selectedCompany } = await getCompanyData(searchParams)

  return (
    <Suspense fallback={<Skeleton className="h-[calc(100vh-8rem)]" />}>
      <DashboardContent 
        selectedCompany={selectedCompany}
      />
    </Suspense>
  )
}
