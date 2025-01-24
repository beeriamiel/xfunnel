import { redirect } from 'next/navigation'
import { DashboardWrapper } from '../components/dashboard-wrapper'
import { GenerateAnalysis } from './index'
import { createClient } from '@/app/supabase/server'
import { ClientWrapper } from '../components/client-wrapper'
import { unstable_noStore as noStore } from 'next/cache'
import type { Step } from './types/setup'

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

async function getCompanyData(companyId: string | undefined, accountId: string) {
  if (!companyId) {
    console.log('🔵 getCompanyData: No companyId provided')
    return { selectedCompany: null }
  }

  console.log('🟡 getCompanyData: Fetching company:', { companyId, accountId })
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
    .eq('id', parseInt(companyId))
    .eq('account_id', accountId)
    .single()

  if (error) {
    console.error('🔴 getCompanyData Error:', error)
    return { selectedCompany: null, error: error.message }
  }

  console.log('🟢 getCompanyData Success:', company)
  return { selectedCompany: company }
}

export default async function GenerateAnalysisPage({
  searchParams,
}: PageProps) {
  noStore()
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { data: accountUser } = await supabase
    .from('account_users')
    .select('account_id')
    .eq('user_id', user.id)
    .single()

  if (!accountUser) {
    redirect('/login')
  }

  // Get companies for initialCompanies prop
  const { data: companies } = await supabase
    .from('companies')
    .select('*')
    .eq('account_id', accountUser.account_id)

  const hasCompanies = companies && companies.length > 0
  
  // Process searchParams on server side - await them first
  const params = await searchParams
  const rawCompanyId = params.companyId
  const rawStep = params.step
  
  // Type guard and validation
  const companyId = typeof rawCompanyId === 'string' ? rawCompanyId : undefined
  const step = typeof rawStep === 'string' ? rawStep as Step : undefined

  console.log('🔵 GenerateAnalysisPage:', {
    hasCompanies,
    companiesLength: companies?.length,
    companies,
    accountId: accountUser.account_id,
    companyId,
    step,
    searchParams: params
  })

  // If user has no companies and isn't already in onboarding flow, redirect to initial step
  if (!hasCompanies && !step) {
    console.log('🟡 Redirecting to initial step - no companies')
    redirect('/dashboard/generate-analysis?step=initial')
  }

  // Get selected company data if companyId exists
  const { selectedCompany } = await getCompanyData(companyId, accountUser.account_id)

  // If we have a companyId but no selectedCompany, something went wrong
  if (companyId && !selectedCompany) {
    console.log('🔴 Company not found:', companyId)
    redirect('/dashboard/generate-analysis')
  }

  console.log('🟢 Rendering page:', {
    selectedCompany,
    isOnboarding: !!step,
    step
  })

  return (
    <ClientWrapper>
      <DashboardWrapper
        selectedCompany={selectedCompany}
        accountId={accountUser.account_id}
        initialCompanies={companies || []}
        isOnboarding={!!step}
        currentStep={step}
      >
        <GenerateAnalysis 
          accountId={accountUser.account_id}
          isOnboarding={!!step}
          step={step}
        />
      </DashboardWrapper>
    </ClientWrapper>
  )
} 