import { redirect } from 'next/navigation'
import { GenerateAnalysis } from './index'
import { createClient } from '@/app/supabase/server'
import type { Database } from '@/types/supabase'

export default async function GenerateAnalysisPage() {
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

  const { data: companies } = await supabase
    .from('companies')
    .select('id')
    .eq('account_id', accountUser.account_id)
    .limit(1)

  if (companies && companies.length > 0) {
    redirect('/dashboard')
  }

  return <GenerateAnalysis accountId={accountUser.account_id} />
} 