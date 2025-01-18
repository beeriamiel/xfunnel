import { createClient } from '@/app/supabase/server'
import type { Database } from '@/types/supabase'

export async function getAccountContext() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { accountId: null, accountRole: null, hasCompanies: false }
  }

  const { data: account } = await supabase
    .from('accounts')
    .select('id, role, companies(*)')
    .eq('user_id', user.id)
    .single()

  return {
    accountId: account?.id || null,
    accountRole: account?.role || null,
    hasCompanies: account?.companies?.length > 0 || false
  }
} 