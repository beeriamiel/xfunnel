import { createClient } from '@/app/supabase/server'
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
    
    // First try a simpler query
    const { data, error } = await supabase
      .from('prompts')
      .select('*');

    // Log everything for debugging
    console.log('Query attempt:', {
      data,
      error,
      connectionDetails: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      }
    });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ 
        error: error.message,
        details: error,
        status: 500 
      });
    }

    return NextResponse.json({ 
      success: true, 
      data,
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      tableSchema: {
        name: 'prompts',
        columns: ['id', 'name', 'prompt_text', 'is_active', 'created_at', 'updated_at']
      }
    });
  } catch (error) {
    console.error('Connection error:', error);
    return NextResponse.json({ 
      error: 'Failed to connect to database',
      details: error
    }, { status: 500 });
  }
} 