import { NextResponse } from 'next/server';
import { testProcessSingleResponse } from '@/lib/batch-processing/processor';

export async function POST(request: Request) {
  try {
    const { responseText } = await request.json();
    
    if (!responseText) {
      return NextResponse.json({ 
        success: false, 
        error: 'Response text is required' 
      }, { status: 400 });
    }

    console.log('Testing response analysis with text:', responseText.substring(0, 100) + '...');
    const result = await testProcessSingleResponse(responseText);
    
    if (!result) {
      throw new Error('Failed to process test response');
    }

    return NextResponse.json({ 
      success: true, 
      data: result
    });
  } catch (error) {
    console.error('Test API error:', error);
    return NextResponse.json({ 
      success: false, 
      error: String(error) 
    }, { status: 500 });
  }
} 