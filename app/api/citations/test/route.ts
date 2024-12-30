import { NextResponse } from 'next/server';
import { processCitationsTransaction } from '@/lib/batch-processing/citation-processor';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { responseAnalysis, citationsParsed } = body;

    if (!responseAnalysis || !citationsParsed) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await processCitationsTransaction(responseAnalysis, citationsParsed);

    return NextResponse.json({
      message: 'Test completed successfully'
    });

  } catch (error) {
    console.error('Test endpoint error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 