import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { generateTerms, saveGeneratedTerms } from '@/lib/services/term-generation'
import type { Database } from '@/types/supabase'

export async function POST(request: NextRequest) {
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
          set(name: string, value: string, options: CookieOptions) {
            response.cookies.set({
              name,
              value,
              ...options,
              sameSite: 'lax',
              secure: process.env.NODE_ENV === 'production',
            })
          },
          remove(name: string, options: CookieOptions) {
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
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session) {
      console.error('Session error:', sessionError)
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Get request body
    const body = await request.json()
    const { companyId, accountId } = body

    if (!companyId || !accountId) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    // Generate terms
    console.log('Generating terms for company:', companyId)
    const terms = await generateTerms(companyId, accountId, {
      limit: 20, // Generate up to 20 terms
      minConfidence: 0.7 // Only keep terms with confidence > 0.7
    })

    // Save generated terms
    console.log(`Saving ${terms.length} generated terms`)
    await saveGeneratedTerms(terms, companyId, accountId)

    return NextResponse.json({ success: true, count: terms.length })

  } catch (error) {
    console.error('Error generating terms:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 