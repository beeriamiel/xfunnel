'use server'

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Helper to transform database record to frontend format
function transformDatabaseRecord(record: any) {
  // Transform status from ACTIVE/ARCHIVED to pending/approved/rejected
  const statusMap: Record<string, string> = {
    'ACTIVE': 'approved',
    'ARCHIVED': 'rejected'
  }
  
  // Transform source from uppercase to lowercase
  return {
    ...record,
    status: statusMap[record.status] || 'pending',
    source: record.source.toLowerCase()
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const companyId = searchParams.get('companyId')
  const accountId = searchParams.get('accountId')
  const isSuperAdmin = searchParams.get('isSuperAdmin') === 'true'

  console.log('GET /api/ai-overview-terms - Request params:', { companyId, accountId, isSuperAdmin })

  if (!companyId || !accountId) {
    return new NextResponse('Missing required parameters', { status: 400 })
  }

  try {
    // Create response to handle cookies
    const response = NextResponse.next()

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

    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('Session error:', sessionError)
      return new NextResponse('Authentication error', { status: 401 })
    }

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Build query with company_id filter
    let query = supabase
      .from('ai_overview_terms_test')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })

    // Add account filter for non-super admins
    if (!isSuperAdmin) {
      query = query.eq('account_id', accountId)
    }

    const { data, error } = await query

    console.log('Supabase query result:', { data, error })

    if (error) throw error

    // Transform each record to match frontend format
    const transformedData = data.map(transformDatabaseRecord)
    
    console.log('Transformed data:', transformedData)

    return NextResponse.json(transformedData)
  } catch (error) {
    console.error('Error fetching terms:', error)
    return new NextResponse('Error fetching terms', { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { term, companyId, accountId, productId } = body

    console.log('POST /api/ai-overview-terms - Request body:', { term, companyId, accountId, productId })

    if (!term || !companyId || !accountId) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    // Create response to handle cookies
    const response = NextResponse.next()

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

    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('Session error:', sessionError)
      return new NextResponse('Authentication error', { status: 401 })
    }

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { data, error } = await supabase
      .from('ai_overview_terms_test')
      .insert([
        {
          term,
          company_id: companyId,
          account_id: accountId,
          source: 'USER',
          status: 'ACTIVE',  // Insert as ACTIVE which will be transformed to 'approved'
          product_id: productId || null // Add product_id, defaulting to null if not provided
        }
      ])
      .select()
      .single()

    console.log('Supabase insert result:', { data, error })

    if (error) throw error

    // Transform the response to match frontend format
    const transformedData = transformDatabaseRecord(data)
    
    console.log('Transformed data:', transformedData)

    return NextResponse.json(transformedData)
  } catch (error) {
    console.error('Error creating term:', error)
    return new NextResponse('Error creating term', { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status } = body

    console.log('PATCH /api/ai-overview-terms - Request body:', { id, status })

    if (!id || !status) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    // Create response to handle cookies
    const response = NextResponse.next()

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

    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('Session error:', sessionError)
      return new NextResponse('Authentication error', { status: 401 })
    }

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Transform frontend status to database status
    const dbStatus = status === 'approved' ? 'ACTIVE' : 'ARCHIVED'

    const { data, error } = await supabase
      .from('ai_overview_terms_test')
      .update({ status: dbStatus })
      .eq('id', id)
      .select()
      .single()

    console.log('Supabase update result:', { data, error })

    if (error) throw error

    // Transform the response to match frontend format
    const transformedData = transformDatabaseRecord(data)
    
    console.log('Transformed data:', transformedData)

    return NextResponse.json(transformedData)
  } catch (error) {
    console.error('Error updating term:', error)
    return new NextResponse('Error updating term', { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Create response to handle cookies
    const response = NextResponse.next()

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

    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('Session error:', sessionError)
      return new NextResponse('Authentication error', { status: 401 })
    }

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await request.json()
    const { ids } = body

    console.log('Attempting to delete terms with IDs:', ids)

    if (!Array.isArray(ids) || ids.length === 0) {
      return new NextResponse('Invalid request: ids must be a non-empty array', { status: 400 })
    }

    // First delete any related records in ai_overview_tracking_test
    const { data: trackingData, error: trackingDeleteError } = await supabase
      .from('ai_overview_tracking_test')
      .delete()
      .in('term_id', ids)
      .select()

    console.log('Tracking delete result:', { trackingData, trackingDeleteError })

    if (trackingDeleteError) {
      console.error('Error deleting tracking records:', trackingDeleteError)
      throw trackingDeleteError
    }

    // Then delete the terms
    const { data: termsData, error: termsDeleteError } = await supabase
      .from('ai_overview_terms_test')
      .delete()
      .in('id', ids)
      .select()

    console.log('Terms delete result:', { termsData, termsDeleteError })

    if (termsDeleteError) {
      console.error('Error deleting terms:', termsDeleteError)
      return new NextResponse('Error deleting terms', { status: 500 })
    }

    return new NextResponse(JSON.stringify(termsData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error in DELETE handler:', error)
    return new NextResponse('Internal server error', { status: 500 })
  }
} 