import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/supabase'

export async function createClient() {
  const cookieStore = cookies()
  
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value || ''
        },
        set(name, value, options) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name, options) {
          cookieStore.set({ name, value: '', ...options })
        }
      }
    }
  )
}

export function createDirectClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: () => '',
        set: () => {},
        remove: () => {},
      },
    }
  )
}

export function createAdminClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get: () => '',
        set: () => {},
        remove: () => {},
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

export async function createAccount(userId: string) {
  const adminClient = createAdminClient()
  
  // First create the account
  const { data: account, error: accountError } = await adminClient
    .from('accounts')
    .insert([{ 
      name: 'New Account',
      account_type: 'company',
      plan_type: 'free',
      created_at: new Date().toISOString()
    }])
    .select()
    .single()

  if (accountError) {
    console.error('Error creating account:', accountError)
    throw accountError
  }

  // Then link the user to the account
  const { error: linkError } = await adminClient
    .from('account_users')
    .insert([{
      user_id: userId,
      account_id: account.id,
      role: 'admin'
    }])

  if (linkError) {
    console.error('Error linking user to account:', linkError)
    throw linkError
  }

  return account
}