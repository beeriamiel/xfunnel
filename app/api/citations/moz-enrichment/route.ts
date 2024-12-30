import { NextResponse } from 'next/server';
import { MozEnrichmentQueue } from '@/lib/batch-processing/moz-queue';

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const batchSize = parseInt(searchParams.get('batchSize') || '50');
    const retryLimit = parseInt(searchParams.get('retryLimit') || '3');
    const companyId = parseInt(searchParams.get('companyId') || '0');

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }

    // Initialize queue with specified parameters
    const queue = new MozEnrichmentQueue(batchSize, retryLimit);
    
    // Start processing
    await queue.processQueue(companyId);
    
    // Get final stats
    const stats = await queue.getQueueStats();

    // Try to retry failed citations if any
    if (stats.failedCitations > 0) {
      await queue.retryFailed();
      // Get updated stats after retry
      const finalStats = await queue.getQueueStats();
      return NextResponse.json({
        message: "Moz enrichment completed with retries",
        initialStats: stats,
        finalStats
      });
    }

    return NextResponse.json({
      message: "Moz enrichment completed",
      stats
    });

  } catch (error) {
    console.error('Moz enrichment error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Add GET endpoint to check enrichment status
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = parseInt(searchParams.get('companyId') || '0');

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }

    const queue = new MozEnrichmentQueue();
    const stats = await queue.getQueueStats();

    return NextResponse.json({
      message: "Current Moz enrichment status",
      stats
    });

  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 