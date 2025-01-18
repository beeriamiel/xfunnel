import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/supabase'

// Main client for server components
export async function createClient() {
  console.log('3. Creating Supabase client')
  const cookieStore = await cookies()
  console.log('4. Cookie store:', cookieStore.getAll())

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      }
    }
  )
}

// Direct client for DB operations without auth
export async function createDirectClient() {
  const cookieStore = await cookies()
  
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignore setAll in Server Components
          }
        },
      }
    }
  )
}

// Admin client with service role
export async function createAdminClient() {
  const cookieStore = await cookies()
  
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignore setAll in Server Components
          }
        },
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

export async function createAccount(userId: string) {
  const adminClient = await createAdminClient()
  
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