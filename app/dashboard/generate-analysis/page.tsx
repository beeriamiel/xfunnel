import { redirect } from 'next/navigation'
import { DashboardWrapper } from '../components/dashboard-wrapper'
import { GenerateAnalysis } from './index'
import { createClient } from '@/app/supabase/server'
import { ClientWrapper } from '../components/client-wrapper'
import { unstable_noStore as noStore } from 'next/cache'
import type { Step } from './types/setup'

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined }
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
  
  console.log('GenerateAnalysisPage:', {
    hasCompanies,
    companiesLength: companies?.length,
    companies,
    accountId: accountUser.account_id
  })

  const step = (await searchParams).step as Step

  return (
    <ClientWrapper>
      <DashboardWrapper
        selectedCompany={null}
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