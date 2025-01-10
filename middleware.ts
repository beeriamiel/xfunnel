import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next()

  try {
    const supabase = createMiddlewareClient({ 
      req: request, 
      res: response
    })

    // Refresh session if it exists
    await supabase.auth.getSession()

    // Get user without throwing errors
    const { data: { user } } = await supabase.auth.getUser()

    // Auth condition for protected routes
    const isLoginRoute = request.nextUrl.pathname === '/login'
    const isAuthCallback = request.nextUrl.pathname.startsWith('/auth/callback')
    const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard') ||
                            request.nextUrl.pathname.startsWith('/personal')

    // Skip middleware for callback route
    if (isAuthCallback) {
      return response
    }

    // Redirect if not authenticated on protected routes
    if (isProtectedRoute && !user) {
      const redirectUrl = new URL('/login', request.url)
      redirectUrl.searchParams.set('redirect_to', request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Redirect if authenticated and trying to access login
    if (isLoginRoute && user) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Only set user in headers if it exists
    if (user) {
      response.headers.set('x-session-user', JSON.stringify({
        id: user.id,
        email: user.email,
        role: user.role
      }))
    }

    return response
  } catch (error) {
    // Only redirect to login if on a protected route
    if (request.nextUrl.pathname.startsWith('/dashboard') || 
        request.nextUrl.pathname.startsWith('/personal')) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    return response
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}