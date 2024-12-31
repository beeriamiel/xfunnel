import { NextResponse } from 'next/server';
import { ContentScrapingQueue } from '@/lib/batch-processing/content-queue';
import { FirecrawlClient } from '@/lib/clients/firecrawl';

export async function POST(request: Request) {
  try {
    // Log environment setup
    console.log('Environment check:', {
      nodeEnv: process.env.NODE_ENV,
      firecrawlKey: process.env.FIRECRAWL_API_KEY ? 'Present' : 'Missing',
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'Not set',
      timestamp: new Date().toISOString()
    });

    // Test a single citation with a real URL
    const testCitation = {
      id: 1,
      citation_url: 'https://www.g2.com/products/walkme-digital-adoption-platform/reviews'
    };

    // Test API status first
    const firecrawl = new FirecrawlClient();
    const apiStatus = await firecrawl.checkApiStatus();
    
    if (!apiStatus) {
      throw new Error('Firecrawl API status check failed');
    }

    // Try direct scraping
    const directResult = await firecrawl.scrapeUrl(testCitation.citation_url);
    
    if (!directResult) {
      throw new Error('Direct scraping failed to return content');
    }

    // Return successful response
    return NextResponse.json({
      success: true,
      apiStatus,
      directResult: {
        success: true,
        contentLength: directResult.length,
        sample: directResult.substring(0, 100)
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    // Detailed error logging
    console.error('Test endpoint error:', {
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : error,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function GET(request: Request) {
  return NextResponse.json({ message: 'Test endpoint is working' });
} 