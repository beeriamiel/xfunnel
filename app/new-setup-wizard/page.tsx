import { createClient } from '@/app/supabase/server'
import { redirect } from 'next/navigation'
import { WizardRoot } from './components/wizard-root'

export default async function NewSetupWizard() {
  const supabase = await createClient()
  
  // Check if user is authenticated
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (!user || userError) {
    redirect('/login')
  }

  // Get user's account
  const { data: accountUser, error: accountError } = await supabase
    .from('account_users')
    .select('account_id, role')
    .eq('user_id', user.id)
    .single()

  if (accountError || !accountUser) {
    console.error('Account check error:', accountError)
    redirect('/login?error=account_check_failed')
  }

  // Check if user already has companies (double check)
  const { data: companies, error: companiesError } = await supabase
    .from('companies')
    .select('id')
    .eq('account_id', accountUser.account_id)
    .limit(1)

  if (companiesError) {
    console.error('Companies check error:', companiesError)
    redirect('/login?error=companies_check_failed')
  }

  // If user already has companies, redirect to dashboard
  if (companies && companies.length > 0) {
    redirect('/dashboard')
  }

  return <WizardRoot accountId={accountUser.account_id} />
} 