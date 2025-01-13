import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { Database } from '@/types/supabase'

const DEFAULT_FREE_CREDITS = 100

export async function GET(request: NextRequest) {
  console.log('Auth callback route hit:', request.url)
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const redirectTo = requestUrl.searchParams.get('redirect_to')

    if (!code) {
      return NextResponse.redirect(new URL('/login?error=missing_code', requestUrl.origin))
    }

    const cookieStore = await cookies()
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value || ''
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )

    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (exchangeError || !data?.session) {
      console.error('Session exchange error:', exchangeError)
      return NextResponse.redirect(new URL('/login?error=auth_failed', requestUrl.origin))
    }

    const { session } = data

    console.log('Session exchanged for user:', session.user.id)

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
        const { data: newAccount, error: createAccountError } = await supabase
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
        const { error: linkError } = await supabase
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

    return NextResponse.redirect(
      redirectTo 
        ? new URL(redirectTo, requestUrl.origin)
        : new URL('/dashboard', requestUrl.origin)
    )
  } catch (error) {
    console.error('Unexpected auth callback error:', error)
    return NextResponse.redirect(new URL('/login?error=unexpected', request.url))
  }
}