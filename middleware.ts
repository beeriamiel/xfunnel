import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  try {
    // Create a response early to modify cookies
    const res = NextResponse.next()
    
    // Create supabase client
    const supabase = createMiddlewareClient({ req: request, res })

    // Auth condition for protected routes
    const isLoginRoute = request.nextUrl.pathname === '/login'
    const isSignupRoute = request.nextUrl.pathname === '/signup'
    const isAuthCallback = request.nextUrl.pathname.startsWith('/auth/callback')
    const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard') ||
                            request.nextUrl.pathname.startsWith('/personal')

    // Skip middleware for auth-related routes
    if (isAuthCallback) {
      return res
    }

    // Refresh session if expired - must be awaited
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('Session error:', sessionError)
    }

    // Redirect if not authenticated
    if (isProtectedRoute && !session) {
      const redirectUrl = new URL('/login', request.url)
      redirectUrl.searchParams.set('redirect_to', request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Redirect if authenticated and trying to access login/signup
    if ((isLoginRoute || isSignupRoute) && session) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Set session user in headers if needed
    if (session?.user) {
      res.headers.set('x-session-user', JSON.stringify({
        id: session.user.id,
        email: session.user.email,
        role: session.user.role
      }))
    }

    return res
  } catch (error) {
    console.error('Middleware error:', error)
    
    // Only redirect to login if on a protected route
    if (request.nextUrl.pathname.startsWith('/dashboard') || 
        request.nextUrl.pathname.startsWith('/personal')) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
