import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { Database } from '@/types/supabase'
import { createClient } from '@supabase/supabase-js'

const DEFAULT_FREE_CREDITS = 100

export async function GET(request: NextRequest) {
  console.log('Auth callback route hit:', request.url)
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const redirectTo = requestUrl.searchParams.get('redirect_to') || '/auth/setup'

    if (!code) {
      return NextResponse.redirect(new URL('/login?error=missing_code', requestUrl.origin))
    }

    // Create the final redirect response first
    const response = NextResponse.redirect(new URL(redirectTo, requestUrl.origin))

    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            response.cookies.set({
              name,
              value,
              ...options,
              sameSite: 'lax',
              secure: process.env.NODE_ENV === 'production',
              path: '/'
            })
          },
          remove(name: string, options: CookieOptions) {
            response.cookies.set({
              name,
              value: '',
              ...options,
              maxAge: 0,
              path: '/'
            })
          },
        },
      }
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error || !data?.session) {
      console.error('Session exchange error:', error)
      return NextResponse.redirect(new URL('/login?error=auth_failed', requestUrl.origin))
    }

    const { session } = data

    console.log('Session exchanged for user:', session.user.id)

    // Create admin client that bypasses RLS
    const adminClient = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
        db: {
          schema: 'public'
        }
      }
    )

    // Check for existing account relationship
    const { data: accountUser, error: accountError } = await supabase
      .from('account_users')
      .select('account_id, role')
      .eq('user_id', session.user.id)
      .single()

    console.log('Checking for existing account for user:', session.user.id)

    if (accountError && accountError.code !== 'PGRST116') {
      console.error('Account check error:', accountError)
      return NextResponse.redirect(new URL('/login?error=account_check_failed', requestUrl.origin))
    }

    // Create new account if user doesn't have one
    if (!accountUser) {
      console.log('No account found, creating new account for:', session.user.id)
      try {
        // Create account
        const { data: newAccount, error: createAccountError } = await adminClient
          .from('accounts')
          .insert([{ 
            name: `${session.user.email}'s Account`,
            account_type: 'company',
            plan_type: 'free',
            monthly_credits_available: DEFAULT_FREE_CREDITS,
            monthly_credits_used: 0,
            credits_renewal_date: new Date(
              new Date().setMonth(new Date().getMonth() + 1)
            ).toISOString()
          }])
          .select()
          .single()

        if (createAccountError) throw createAccountError

        console.log('Account created:', newAccount.id)

        // Link user to account as admin
        const { error: linkError } = await adminClient
          .from('account_users')
          .insert([{
            user_id: session.user.id,
            account_id: newAccount.id,
            role: 'admin'
          }])

        if (linkError) {
          throw linkError
        }

        console.log('User linked to account:', session.user.id, newAccount.id)

      } catch (error) {
        console.error('Account creation failed:', error)
        return NextResponse.redirect(new URL('/login?error=account_creation_failed', requestUrl.origin))
      }
    }

    // Return the response that already has the cookies set
    return response
  } catch (error) {
    console.error('Unexpected auth callback error:', error)
    const requestUrl = new URL(request.url)
    return NextResponse.redirect(new URL('/login?error=unexpected', requestUrl.origin))
  }
}