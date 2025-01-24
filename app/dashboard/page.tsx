import { Suspense } from 'react'
import { DashboardWrapper } from './components/dashboard-wrapper'
import { Skeleton } from '@/components/ui/skeleton'
import { ClientWrapper } from './components/client-wrapper'
import { unstable_noStore as noStore } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/app/supabase/server'
import type { Database } from '@/types/supabase'
import { GenerateAnalysis } from './generate-analysis'
import { ClientRedirect } from './components/client-redirect'

interface AccountContext {
  userId: string
  accountId: string
  accountRole: string
  hasCompanies: boolean
  companies: any[]
}

type SearchParams = { [key: string]: string | string[] | undefined }

type Props = {
  params: Promise<Record<string, never>>
  searchParams: Promise<SearchParams>
}

interface Company {
  id: number
  name: string
  industry: string | null
  created_at: string | null
  main_products: string[] | null
  product_category: string | null
  number_of_employees: number | null
  annual_revenue: string | null
  markets_operating_in: string[] | null
  account_id: string | null
}

async function getAccountContext(): Promise<AccountContext> {
  console.log('1. Getting account context')
  
  const supabase = await createClient()
  console.log('2. Created supabase client')
  
  const { data: { user }, error } = await supabase.auth.getUser()
  console.log('3. Auth getUser result:', { user: user?.id, error })
  
  if (!user) {
    console.log('4. No user found, redirecting to login')
    redirect('/login')
  }

  // Get account relationship
  const { data: accountUser, error: accountError } = await supabase
    .from('account_users')
    .select('account_id, role')
    .eq('user_id', user.id)
    .single()
  
  console.log('5. Account user lookup:', { 
    accountUser: accountUser?.account_id,
    error: accountError?.message 
  })

  if (accountError || !accountUser) {
    console.log('6. No account access, throwing error')
    throw new Error('Account access required')
  }

  // Get all companies for the account
  const { data: companies, error: companiesError } = await supabase
    .from('companies')
    .select('*')
    .eq('account_id', accountUser.account_id)
  
  console.log('7. Companies lookup:', {
    count: companies?.length,
    error: companiesError?.message
  })

  // Check for any companies
  const { data: hasCompaniesCheck, error: checkError } = await supabase
    .from('companies')
    .select('id')
    .eq('account_id', accountUser.account_id)
    .limit(1)
  
  console.log('8. Has companies check:', {
    hasCompanies: Boolean(hasCompaniesCheck?.length),
    error: checkError?.message
  })

  return {
    userId: user.id,
    accountId: accountUser.account_id,
    accountRole: accountUser.role ?? 'user',
    hasCompanies: Boolean(hasCompaniesCheck?.length),
    companies: companies || []
  }
}

async function getCompanyData(searchParamsPromise: Promise<SearchParams>, accountId: string) {
  try {
    const searchParams = await searchParamsPromise
    const companyName = typeof searchParams.company === 'string' ? searchParams.company : undefined
    
    if (!companyName) {
      return { selectedCompany: null }
    }

    const supabase = await createClient()
    
    const { data: company, error } = await supabase
      .from('companies')
      .select(`
        id, 
        name, 
        industry,
        created_at,
        main_products,
        product_category,
        number_of_employees,
        annual_revenue,
        markets_operating_in
      `)
      .eq('name', companyName)
      .single()

    if (error) {
      console.error('Error fetching company:', error)
      return { selectedCompany: null, error: error.message }
    }

    return { 
      selectedCompany: company 
    }
  } catch (error) {
    console.error('Unexpected error in getCompanyData:', error)
    return { selectedCompany: null, error: 'Failed to fetch company data' }
  }
}

export default async function Page({ params, searchParams }: Props) {
  noStore()
  
  try {
    const accountContext = await getAccountContext()
    
    // Return redirect response for no companies
    if (!accountContext.hasCompanies) {
      return (
        <ClientWrapper>
          <ClientRedirect path="/dashboard/generate-analysis" />
        </ClientWrapper>
      )
    }

    const { selectedCompany, error } = await getCompanyData(
      Promise.resolve(searchParams), 
      accountContext.accountId
    )

    return (
      <ClientWrapper>
        <DashboardWrapper 
          selectedCompany={selectedCompany}
          accountId={accountContext.accountId}
          initialCompanies={accountContext.companies}
          isOnboarding={false}
          children={null}
        />
      </ClientWrapper>
    )
  } catch (error) {
    console.error('Dashboard access error:', error)
    return (
      <ClientWrapper>
        <ClientRedirect path="/login?error=access_denied" />
      </ClientWrapper>
    )
  }
}
