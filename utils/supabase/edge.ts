import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { type NextRequest, type NextResponse } from 'next/server'

export const runtime = 'experimental-edge'

export function createEdgeClient(
  request: NextRequest,
  response: NextResponse,
  cookieOptions?: CookieOptions
) {
  console.log('🟢 Creating edge client')
  
  const client = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          const cookie = request.cookies.get(name)
          console.log('🟢 Edge cookie get:', { name, value: cookie?.value })
          return cookie?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          console.log('🟢 Edge cookie set:', { name, value, options })
          if (options?.maxAge && options.maxAge <= 0) {
            console.log('🟢 Edge deleting cookie:', name)
            response.cookies.delete(name)
          } else {
            console.log('🟢 Edge setting cookie:', { name, value, options })
            response.cookies.set({
              name,
              value,
              ...options,
              sameSite: 'lax',
              secure: process.env.NODE_ENV === 'production',
            })
          }
        },
        remove(name: string, options: CookieOptions) {
          console.log('🟢 Edge cookie remove:', { name, options })
          response.cookies.set({
            name,
            value: '',
            ...options,
            maxAge: 0,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
          })
        },
      },
      ...cookieOptions,
    }
  )

  console.log('🟢 Edge client created')
  return client
} 