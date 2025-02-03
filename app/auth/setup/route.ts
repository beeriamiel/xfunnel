import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { Database } from '@/types/supabase'

export async function GET(request: NextRequest) {
  try {
    // Create response to handle cookies
    const response = NextResponse.next()

    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            response.cookies.set({
              name,
              value,
              ...options,
              sameSite: 'lax',
              secure: process.env.NODE_ENV === 'production',
            })
          },
          remove(name: string, options: any) {
            response.cookies.set({
              name,
              value: '',
              ...options,
              maxAge: 0
            })
          }
        }
      }
    )

    // Check if user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.error('Auth error:', userError)
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Get user's account and check for companies
    const { data: accountUser, error: accountError } = await supabase
      .from('account_users')
      .select('account_id, role')
      .eq('user_id', user.id)
      .single()

    if (accountError) {
      console.error('Account check error:', accountError)
      return NextResponse.redirect(new URL('/login?error=account_check_failed', request.url))
    }

    // Check if user has any companies
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('id')
      .eq('account_id', accountUser.account_id)
      .limit(1)

    if (companiesError) {
      console.error('Companies check error:', companiesError)
      return NextResponse.redirect(new URL('/login?error=companies_check_failed', request.url))
    }

    // If user has no companies, redirect to setup wizard
    if (!companies || companies.length === 0) {
      return NextResponse.redirect(new URL('/new-setup-wizard', request.url))
    }

    // If user has companies, redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url))
  } catch (error) {
    console.error('Setup route error:', error)
    return NextResponse.redirect(new URL('/login?error=unexpected', request.url))
  }
} 