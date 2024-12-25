import { NextResponse } from 'next/server';
import { ResponseAnalysisQueue } from "@/lib/batch-processing/queue";
import { createAdminClient } from '@/app/supabase/server'

export async function GET(request: Request) {
  try {
    // Get batch size from query params or use default
    const { searchParams } = new URL(request.url);
    const batchSize = parseInt(searchParams.get('batchSize') || '100');
    const retryLimit = parseInt(searchParams.get('retryLimit') || '3');
    const responseId = searchParams.get('responseId'); // Optional specific response ID

    // Initialize queue with specified parameters
    const queue = new ResponseAnalysisQueue(batchSize, retryLimit);
    
    // If a specific response ID is provided, only process that one
    if (responseId) {
      const startId = parseInt(responseId);
      const companyId = parseInt(searchParams.get('companyId') || '0');
      await queue.processQueue(startId, startId, companyId);
      
      // Fetch the analysis result
      const adminClient = createAdminClient();
      const { data: analysis, error: analysisError } = await adminClient
        .from('response_analysis')
        .select('*')
        .eq('response_id', startId)
        .single();

      if (analysisError) {
        throw analysisError;
      }

      return NextResponse.json({
        message: "Single response processed",
        responseId: startId,
        analysis: {
          ranking_position: analysis?.ranking_position,
          rank_list: analysis?.rank_list,
          response_text: analysis?.response_text
        }
      });
    }

    // Get responses within the specified range
    const adminClient = createAdminClient();
    const { data: responses, error } = await adminClient
      .from('responses')
      .select('id')
      .gte('id', 1424)
      .lte('id', 2733)
      .order('id');

    if (error) {
      throw error;
    }

    const totalResponses = responses?.length || 0;
    console.log(`Found ${totalResponses} responses in range 1424-2733`);

    // Start processing
    const companyId = parseInt(searchParams.get('companyId') || '0');
    await queue.processQueue(1424, 2733, companyId);
    
    // Get final stats
    const stats = await queue.getQueueStats();

    // Try to retry failed responses if any
    if (stats.failedResponses > 0) {
      await queue.retryFailed();
      // Get updated stats after retry
      const finalStats = await queue.getQueueStats();
      return NextResponse.json({
        message: "Queue processing completed with retries",
        totalResponsesInRange: totalResponses,
        initialStats: stats,
        finalStats
      });
    }

    return NextResponse.json({
      message: "Queue processing completed",
      totalResponsesInRange: totalResponses,
      stats
    });

  } catch (error) {
    console.error('Test endpoint error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Add POST endpoint to test with specific configuration
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const batchSize = body.batchSize || 100;
    const retryLimit = body.retryLimit || 3;
    const shouldRetry = body.shouldRetry || false;
    const responseId = body.responseId; // Optional specific response ID
    const companyId = body.companyId || 0;

    const queue = new ResponseAnalysisQueue(batchSize, retryLimit);
    
    // Process specific response or range
    if (responseId) {
      await queue.processQueue(responseId, responseId, companyId);
      
      // Fetch the analysis result
      const adminClient = createAdminClient();
      const { data: analysis, error: analysisError } = await adminClient
        .from('response_analysis')
        .select('*')
        .eq('response_id', responseId)
        .single();

      if (analysisError) {
        throw analysisError;
      }

      return NextResponse.json({
        message: "Single response processed",
        responseId,
        analysis: {
          ranking_position: analysis?.ranking_position,
          rank_list: analysis?.rank_list,
          response_text: analysis?.response_text
        }
      });
    }

    // Process initial queue with range
    await queue.processQueue(1424, 2733, companyId);
    const initialStats = await queue.getQueueStats();

    // Retry if requested and there are failed responses
    if (shouldRetry && initialStats.failedResponses > 0) {
      await queue.retryFailed();
    }

    // Get final stats
    const finalStats = await queue.getQueueStats();

    return NextResponse.json({
      message: "Queue processing completed",
      config: {
        batchSize,
        retryLimit,
        shouldRetry,
        range: "1424-2733"
      },
      initialStats,
      finalStats: shouldRetry ? finalStats : undefined
    });

  } catch (error) {
    console.error('Test endpoint error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 