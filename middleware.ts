import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  console.log('Middleware intercepting:', request.nextUrl.pathname)
  try {
    const response = NextResponse.next()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            response.cookies.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            response.cookies.set({ name, value: '', ...options })
          },
        },
      }
    )

    // Add before cookie handling
    console.log('Middleware cookies:', request.cookies.getAll())

    // Add session refresh for protected routes
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError) {
      console.error('Session error:', sessionError)
    }

    // After session refresh
    console.log('Session refresh result:', session ? 'Success' : 'No session')

    // Define public routes that don't need session checks
    const isPublicRoute = [
      '/login',
      '/register',
      '/',
      '/auth/callback'
    ].includes(request.nextUrl.pathname)

    // Skip session checks for public routes
    if (isPublicRoute) {
      return response
    }

    // Only perform session and user checks for protected routes
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError) {
      console.error('User error:', userError)
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Auth condition for protected routes
    const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard') ||
                            request.nextUrl.pathname.startsWith('/personal')

    // Redirect if not authenticated on protected routes
    if (isProtectedRoute && !user) {
      const redirectUrl = new URL('/login', request.url)
      redirectUrl.searchParams.set('redirect_to', request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Check account and company status for protected routes
    if (isProtectedRoute && user) {
      console.log('Checking account status for user:', user.id)
      try {
        // Get account relationship
        const { data: accountUser, error: accountError } = await supabase
          .from('account_users')
          .select('account_id, role')
          .eq('user_id', user.id)
          .single()

        if (accountError) throw accountError

        // Get companies for account
        const { data: companies, error: companiesError } = await supabase
          .from('companies')
          .select('id')
          .eq('account_id', accountUser.account_id)
          .limit(1)

        if (companiesError) throw companiesError

        // Set context in headers
        response.headers.set('x-session-user', JSON.stringify({
          id: user.id,
          email: user.email,
          role: user.role,
          accountId: accountUser.account_id,
          accountRole: accountUser.role,
          hasCompanies: companies && companies.length > 0
        }))
      } catch (error) {
        console.error('Error checking account status:', error)
        // Don't redirect - let the page handle the error state
        return response
      }
    }

    // Redirect if authenticated and trying to access login
    if (request.nextUrl.pathname === '/login' && user) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Set basic user info for non-protected routes
    if (user && !isProtectedRoute) {
      response.headers.set('x-session-user', JSON.stringify({
        id: user.id,
        email: user.email,
        role: user.role
      }))
    }

    console.log('User in middleware:', user?.id)

    return response
  } catch (error) {
    console.error('Middleware error:', error)
    // Only redirect to login if on a protected route
    if (request.nextUrl.pathname.startsWith('/dashboard') || 
        request.nextUrl.pathname.startsWith('/personal')) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    const err = error as { code?: string }
    if (err.code === 'PGRST116') {
      // No account found - redirect to account setup
      return NextResponse.redirect(new URL('/account-setup', request.url))
    }
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    // Exclude callback route and static assets
    '/((?!_next/static|_next/image|favicon.ico|auth/callback|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}