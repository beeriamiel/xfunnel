import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/types/supabase'

export const createClient = () => {
  return createServerComponentClient<Database>({ cookies })
}

// Create a direct client for server-side operations that don't need cookies
export function createDirectClient() {
  return createServerComponentClient<Database>({
    cookies: () => new Map()
  })
}

// Admin client for server-side operations with full access
export function createAdminClient() {
  return createServerComponentClient<Database>({
    cookies: () => new Map()
  }, {
    supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    options: {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  })
}

export { createServerComponentClient } 