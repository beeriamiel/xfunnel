import { NextResponse } from 'next/server';
import { testProcessSingleResponse } from '@/lib/batch-processing/processor';

export async function POST(request: Request) {
  try {
    const { responseText } = await request.json();
    
    if (!responseText || typeof responseText !== 'string') {
      return NextResponse.json(
        { error: 'responseText is required and must be a string' },
        { status: 400 }
      );
    }

    const result = await testProcessSingleResponse(responseText);
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Test analysis error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process response',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 