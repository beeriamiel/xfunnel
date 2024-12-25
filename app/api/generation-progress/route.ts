import { createAdminClient } from '@/app/supabase/server'
import { NextResponse } from "next/server";

// Configure route behavior
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyName = searchParams.get('company');

  if (!companyName) {
    return NextResponse.json({ error: 'Company name required' }, { status: 400 });
  }

  const adminClient = createAdminClient();

  try {
    // Get company ID
    const { data: company, error: companyError } = await adminClient
      .from('companies')
      .select('id')
      .eq('name', companyName)
      .single();

    if (companyError || !company) {
      console.error('Company error:', companyError);
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // Get progress
    const { data: progress, error: progressError } = await adminClient
      .from('generation_progress')
      .select('*')
      .eq('company_id', company.id)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (progressError) {
      console.error('Progress error:', progressError);
      return NextResponse.json({ error: 'Failed to get progress' }, { status: 500 });
    }

    return NextResponse.json(progress);
  } catch (error) {
    console.error('Error in generation progress API:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 