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
      setup_completed_at,
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
  const rawCompanyId = params.company
  const rawProductId = params.product
  const rawStep = params.step
  
  console.log('🔵 URL Parameters:', {
    raw: {
      company: rawCompanyId,
      product: rawProductId,
      step: rawStep
    },
    types: {
      companyType: typeof rawCompanyId,
      productType: typeof rawProductId,
      stepType: typeof rawStep
    }
  });
  
  // Type guard and validation
  const companyId = typeof rawCompanyId === 'string' ? rawCompanyId : undefined
  const productId = typeof rawProductId === 'string' ? rawProductId : undefined
  const step = typeof rawStep === 'string' ? rawStep as Step : undefined

  console.log('🔵 Processed Parameters:', {
    processed: {
      companyId,
      productId,
      step
    },
    asNumber: {
      productId: productId ? Number(productId) : undefined,
      isValid: productId ? !isNaN(Number(productId)) : false
    }
  });

  console.log('🔵 GenerateAnalysisPage:', {
    hasCompanies,
    companiesLength: companies?.length,
    companies,
    accountId: accountUser.account_id,
    companyId,
    productId,
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

  // Never show setup if company setup is completed
  const isOnboarding = !!step && (!selectedCompany?.setup_completed_at)

  // If setup is complete but we're on a setup step, redirect to main page
  if (selectedCompany?.setup_completed_at && step) {
    console.log('🟡 Company setup already complete, redirecting to main page')
    redirect(`/dashboard/generate-analysis?company=${selectedCompany.id}`)
  }

  console.log('🟢 Rendering page:', {
    selectedCompany,
    isOnboarding,
    step,
    setup_completed_at: selectedCompany?.setup_completed_at
  })

  return (
    <ClientWrapper>
      <DashboardWrapper
        selectedCompany={selectedCompany}
        accountId={accountUser.account_id}
        initialCompanies={companies || []}
        isOnboarding={isOnboarding}
        currentStep={isOnboarding ? step : undefined}
      >
        <GenerateAnalysis 
          accountId={accountUser.account_id}
          isOnboarding={isOnboarding}
          step={isOnboarding ? step : undefined}
          initialProductId={productId}
        />
      </DashboardWrapper>
    </ClientWrapper>
  )
} 