import { Suspense } from 'react'
import { DashboardWrapper } from './components/dashboard-wrapper'
import { Skeleton } from '@/components/ui/skeleton'
import { ClientWrapper } from './components/client-wrapper'
import { unstable_noStore as noStore } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/app/supabase/server'
import type { Database } from '@/types/supabase'

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

async function getAccountContext(): Promise<AccountContext> {
  console.log('Getting account context')
  const supabase = await createClient()
  console.log('Server client created')
  
  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) throw new Error('Authentication required')

  // Get account relationship
  const { data: accountUser, error: accountError } = await supabase
    .from('account_users')
    .select('account_id, role')
    .eq('user_id', user.id)
    .single()

  if (accountError || !accountUser) {
    throw new Error('Account access required')
  }

  // Get all companies for the account
  const { data: companies } = await supabase
    .from('companies')
    .select('*')
    .eq('account_id', accountUser.account_id)

  // Keep existing company check for hasCompanies
  const { data: hasCompaniesCheck } = await supabase
    .from('companies')
    .select('id')
    .eq('account_id', accountUser.account_id)
    .limit(1)

  return {
    userId: user.id,
    accountId: accountUser.account_id,
    accountRole: accountUser.role ?? 'user',
    hasCompanies: Boolean(hasCompaniesCheck?.length),
    companies: companies || []  // Add companies to context
  }
}

async function getCompanyData(searchParamsPromise: Promise<SearchParams>, accountId: string) {
  try {
    const searchParams = await searchParamsPromise
    const companyName = typeof searchParams.company === 'string' ? searchParams.company : undefined
    
    if (!companyName) {
      return { selectedCompany: null }
    }

    const supabase = createClient()
    
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
  
  try {
    console.log('Dashboard page hit, checking account context')
    const accountContext = await getAccountContext()
    
    // Redirect new users to company creation
    if (!accountContext.hasCompanies) {
      redirect('/dashboard/generate-analysis')
    }

    const { selectedCompany, error } = await getCompanyData(
      Promise.resolve(searchParams), 
      accountContext.accountId
    )

    if (error) {
      console.error('Error in dashboard page:', error)
    }

    return (
      <ClientWrapper>
        <Suspense fallback={<Skeleton className="h-screen" />}>
          <DashboardWrapper 
            selectedCompany={selectedCompany ? {
              ...selectedCompany,
              created_at: new Date().toISOString(),
              main_products: [],
              product_category: null,
              number_of_employees: null,
              annual_revenue: null,
              markets_operating_in: []
            } : null}
            accountId={accountContext.accountId}
            initialCompanies={accountContext.companies}  // Pass companies data
          />
        </Suspense>
      </ClientWrapper>
    )
  } catch (error) {
    console.error('Dashboard access error:', error)
    redirect('/login?error=access_denied')
  }
}
