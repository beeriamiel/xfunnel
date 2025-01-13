import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/supabase'

export async function getAccountContext() {
  const cookieStore = cookies()
  
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

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