import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { Database } from '@/types/supabase'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const redirectTo = requestUrl.searchParams.get('redirect_to')

    if (!code) {
      return NextResponse.redirect(new URL('/login?error=missing_code', requestUrl.origin))
    }

    // Create a Supabase client with the Route Handler helper
    const supabase = createRouteHandlerClient<Database>({ cookies })

    // Exchange the code for a session
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (exchangeError) {
      console.error('Session exchange error:', exchangeError)
      return NextResponse.redirect(new URL('/login?error=auth_failed', requestUrl.origin))
    }

    // Get the user after session exchange using getSession instead of getUser
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session?.user) {
      console.error('Session verification error:', sessionError)
      return NextResponse.redirect(new URL('/login?error=auth_failed', requestUrl.origin))
    }

    // Check if user already has an account association
    const { data: accountUser, error: accountError } = await supabase
      .from('account_users')
      .select('*')
      .eq('user_id', session.user.id)
      .single()

    if (accountError && accountError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Account check error:', accountError)
      return NextResponse.redirect(new URL('/login?error=account_check_failed', requestUrl.origin))
    }

    // If no account association exists, create one
    if (!accountUser) {
      // Create a new account
      const { data: newAccount, error: createAccountError } = await supabase
        .from('accounts')
        .insert([{ 
          name: `${session.user.email}'s Account`,
          account_type: 'company' as const,
          plan_type: 'free' as const,
          monthly_credits_available: 0,
          monthly_credits_used: 0
        }])
        .select()
        .single()

      if (createAccountError) {
        console.error('Account creation error:', createAccountError)
        return NextResponse.redirect(new URL('/login?error=account_creation_failed', requestUrl.origin))
      }

      // Associate user with account
      const { error: linkError } = await supabase
        .from('account_users')
        .insert([{
          user_id: session.user.id,
          account_id: newAccount.id,
          role: 'admin' // First user is admin
        }])

      if (linkError) {
        console.error('Account linking error:', linkError)
        return NextResponse.redirect(new URL('/login?error=account_linking_failed', requestUrl.origin))
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
