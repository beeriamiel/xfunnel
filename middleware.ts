import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Define protected and auth routes
const protectedRoutes = ['/dashboard']
const authRoutes = ['/login', '/signup']

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  try {
    // Create supabase server client
    const supabase = createServerClient(
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
            })
          },
          remove(name: string, options: CookieOptions) {
            response.cookies.set({
              name,
              value: '',
              ...options,
            })
          },
        },
      }
    )

    // Get session
    const { data: { user } } = await supabase.auth.getUser()

    // Handle protected routes
    if (protectedRoutes.some(route => request.nextUrl.pathname.startsWith(route))) {
      if (!user) {
        const redirectUrl = new URL('/login', request.url)
        redirectUrl.searchParams.set('redirect_to', request.nextUrl.pathname + request.nextUrl.search)
        return NextResponse.redirect(redirectUrl)
      }
    }

    // Handle auth routes
    if (authRoutes.some(route => request.nextUrl.pathname.startsWith(route))) {
      if (user) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }

    // Set session user in request headers
    if (user) {
      response.headers.set('x-session-user', JSON.stringify({
        id: user.id,
        email: user.email,
        role: user.role
      }))
    }

    return response
  } catch (error) {
    console.error('Middleware error:', error)
    
    // Clear session on error
    response.cookies.set({
      name: 'supabase-auth-token',
      value: '',
      maxAge: 0
    })

    // Only redirect to login if on a protected route
    if (protectedRoutes.some(route => request.nextUrl.pathname.startsWith(route))) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    return response
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
