import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { Database } from '@/types/supabase'

export async function GET() {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient<Database>({
      cookies: () => cookieStore
    })
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      return NextResponse.json({ error: userError.message }, { status: 401 })
    }

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Test cookie operations
    const response = NextResponse.json({
      status: 'success',
      session: user ? 'exists' : 'none',
      sessionError: userError || null,
      user: user || null,
    })

    return response
  } catch (error) {
    console.error('Auth test error:', error)
    return NextResponse.json({ 
      status: 'error',
      error: String(error)
    }, { status: 500 })
  }
} 