import { Buffer } from 'buffer';
import { randomUUID } from 'crypto';

interface MozSiteQuery {
  query: string;
  scope: 'domain' | 'subdomain' | 'url';
}

interface MozSiteMetrics {
  page: string;
  subdomain: string;
  root_domain: string;
  title: string;
  last_crawled: string;
  http_code: number;
  page_authority: number;
  domain_authority: number;
  spam_score: number;
  root_domains_to_root_domain: number;
  external_pages_to_root_domain: number;
}

export interface MozResponse {
  result?: {
    results_by_site?: Array<{
      site_query: {
        query: string;
      };
      site_metrics?: {
        domain_authority: number;
        page_authority: number;
        spam_score: number;
        root_domains_to_root_domain: number;
        external_pages_to_root_domain: number;
        last_crawled: string;
      };
    }>;
  };
  errors_by_site?: Array<{
    site_query: {
      query: string;
    };
    error: {
      message: string;
    };
  }>;
}

// New interfaces for keyword suggestions
interface MozKeywordSuggestionRequest {
  serp_query: {
    keyword: string;
    locale: 'en-US' | 'en-CA' | 'en-GB' | 'en-AU';
    device: 'desktop';
    engine: 'google';
    vicinity?: string;
  };
  options?: {
    strategy?: 'default';
  };
  page?: {
    n?: number;
    limit?: number;
  };
}

interface MozKeywordSuggestionResponse {
  serp_query: {
    keyword: string;
    locale: string;
    device: string;
    engine: string;
  };
  page: {
    n: number;
    limit: number;
  };
  options: {
    strategy: string;
  };
  suggestions: Array<{
    keyword: string;
    relevance: number;
  }>;
}

// Add new interfaces for keyword metrics
interface MozKeywordMetricsResponse {
  serp_query: {
    keyword: string;
    locale: string;
    device: string;
    engine: string;
    vicinity?: string;
  };
  keyword_metrics: {
    volume?: number;
    difficulty?: number;
    organic_ctr?: number;
    priority?: number;
  };
}

export async function fetchMozMetrics(urls: string[]): Promise<MozResponse> {
  const startTime = Date.now();
  const requestId = randomUUID();

  console.log('Starting Moz API request:', {
    requestId,
    urlCount: urls.length,
    timestamp: new Date().toISOString(),
    firstUrl: urls[0],
    lastUrl: urls[urls.length - 1]
  });

  const mozToken = process.env.MOZ_API_KEY;
  if (!mozToken) {
    console.error('Moz API configuration error:', {
      requestId,
      error: 'MOZ_API_KEY is not set',
      timestamp: new Date().toISOString()
    });
    throw new Error('MOZ_API_KEY is not set');
  }

  const site_queries: MozSiteQuery[] = urls.map(url => ({
    query: url,
    scope: 'url'
  }));

  try {
    console.log('Sending Moz API request:', {
      requestId,
      timestamp: new Date().toISOString(),
      queryCount: site_queries.length,
      method: 'data.site.metrics.fetch.multiple',
      requestBody: JSON.stringify({
        jsonrpc: '2.0',
        id: requestId,
        method: 'data.site.metrics.fetch.multiple',
        params: {
          data: {
            site_queries
          }
        }
      })
    });

    const requestStartTime = Date.now();
    const response = await fetch('https://api.moz.com/jsonrpc', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-moz-token': mozToken
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: requestId,
        method: 'data.site.metrics.fetch.multiple',
        params: {
          data: {
            site_queries
          }
        }
      })
    });

    const requestDuration = Date.now() - requestStartTime;
    
    // Log raw response for debugging
    const rawResponseText = await response.text();
    console.log('Raw Moz API response:', {
      requestId,
      timestamp: new Date().toISOString(),
      status: response.status,
      statusText: response.statusText,
      rawResponse: rawResponseText
    });

    // Parse response after logging
    const data = JSON.parse(rawResponseText);

    console.log('Moz API response received:', {
      requestId,
      timestamp: new Date().toISOString(),
      status: response.status,
      statusText: response.statusText,
      duration: requestDuration,
      headers: {
        contentType: response.headers.get('content-type'),
        contentLength: response.headers.get('content-length')
      }
    });

    if (!response.ok) {
      console.error('Moz API error response:', {
        requestId,
        timestamp: new Date().toISOString(),
        status: response.status,
        statusText: response.statusText,
        duration: requestDuration
      });
      throw new Error(`Moz API error: ${response.statusText}`);
    }

    const totalDuration = Date.now() - startTime;

    // Log success metrics
    console.log('Moz API request completed:', {
      requestId,
      timestamp: new Date().toISOString(),
      totalDuration,
      requestDuration,
      parseTime: totalDuration - requestDuration,
      resultsCount: data.result?.results_by_site?.length || 0,
      errorsCount: data.errors_by_site?.length || 0,
      successRate: data.result?.results_by_site ? 
        (data.result.results_by_site.length / urls.length) * 100 : 0
    });

    // Log any errors in detail
    if (data.errors_by_site?.length > 0) {
      console.warn('Moz API partial errors:', {
        requestId,
        timestamp: new Date().toISOString(),
        errorCount: data.errors_by_site.length,
        errors: data.errors_by_site.map((e: NonNullable<MozResponse['errors_by_site']>[number]) => ({
          url: e.site_query.query,
          error: e.error.message
        }))
      });
    }

    return data as MozResponse;
  } catch (error) {
    const totalDuration = Date.now() - startTime;
    console.error('Moz API request failed:', {
      requestId,
      timestamp: new Date().toISOString(),
      duration: totalDuration,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : error,
      urlCount: urls.length
    });
    throw error;
  }
}

// New function for keyword suggestions
export async function fetchKeywordSuggestions(
  keyword: string,
  options?: {
    limit?: number;
    locale?: 'en-US' | 'en-CA' | 'en-GB' | 'en-AU';
  }
): Promise<MozKeywordSuggestionResponse> {
  const startTime = Date.now();
  const requestId = randomUUID();

  console.log('Starting Moz Keyword API request:', {
    requestId,
    keyword,
    options,
    timestamp: new Date().toISOString()
  });

  const mozToken = process.env.MOZ_API_KEY;
  if (!mozToken) {
    console.error('Moz API configuration error:', {
      requestId,
      error: 'MOZ_API_KEY is not set',
      timestamp: new Date().toISOString()
    });
    throw new Error('MOZ_API_KEY is not set');
  }

  try {
    const request: MozKeywordSuggestionRequest = {
      serp_query: {
        keyword,
        locale: options?.locale || 'en-US',
        device: 'desktop',
        engine: 'google'
      },
      page: {
        limit: options?.limit || 50
      }
    };

    console.log('Sending Moz Keyword API request:', {
      requestId,
      timestamp: new Date().toISOString(),
      method: 'data.keyword.suggestions.list',
      requestBody: JSON.stringify({
        jsonrpc: '2.0',
        id: requestId,
        method: 'data.keyword.suggestions.list',
        params: {
          data: request
        }
      })
    });

    const requestStartTime = Date.now();
    const response = await fetch('https://api.moz.com/jsonrpc', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-moz-token': mozToken
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: requestId,
        method: 'data.keyword.suggestions.list',
        params: {
          data: request
        }
      })
    });

    const requestDuration = Date.now() - requestStartTime;
    
    // Log raw response for debugging
    const rawResponseText = await response.text();
    console.log('Raw Moz Keyword API response:', {
      requestId,
      timestamp: new Date().toISOString(),
      status: response.status,
      statusText: response.statusText,
      rawResponse: rawResponseText
    });

    // Parse response after logging
    const data = JSON.parse(rawResponseText);

    if (!response.ok) {
      console.error('Moz Keyword API error response:', {
        requestId,
        timestamp: new Date().toISOString(),
        status: response.status,
        statusText: response.statusText,
        duration: requestDuration
      });
      throw new Error(`Moz API error: ${response.statusText}`);
    }

    // Extract result from JSON-RPC response
    if (!data.result) {
      console.error('Moz API response missing result:', {
        requestId,
        timestamp: new Date().toISOString(),
        response: data
      });
      throw new Error('Moz API response missing result');
    }

    const totalDuration = Date.now() - startTime;

    // Log success metrics
    console.log('Moz Keyword API request completed:', {
      requestId,
      timestamp: new Date().toISOString(),
      totalDuration,
      requestDuration,
      parseTime: totalDuration - requestDuration,
      suggestionsCount: data.result.suggestions?.length || 0
    });

    return data.result as MozKeywordSuggestionResponse;
  } catch (error) {
    const totalDuration = Date.now() - startTime;
    console.error('Moz Keyword API request failed:', {
      requestId,
      timestamp: new Date().toISOString(),
      duration: totalDuration,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : error,
      keyword
    });
    throw error;
  }
}

export async function fetchKeywordMetrics(
  keyword: string,
  options?: {
    locale?: 'en-US' | 'en-CA' | 'en-GB' | 'en-AU';
  }
): Promise<MozKeywordMetricsResponse> {
  const startTime = Date.now();
  const requestId = randomUUID();

  console.log('Starting Moz Keyword Metrics API request:', {
    requestId,
    keyword,
    options,
    timestamp: new Date().toISOString()
  });

  const mozToken = process.env.MOZ_API_KEY;
  if (!mozToken) {
    console.error('Moz API configuration error:', {
      requestId,
      error: 'MOZ_API_KEY is not set',
      timestamp: new Date().toISOString()
    });
    throw new Error('MOZ_API_KEY is not set');
  }

  try {
    const request = {
      serp_query: {
        keyword,
        locale: options?.locale || 'en-US',
        device: 'desktop',
        engine: 'google'
      }
    };

    console.log('Sending Moz Keyword Metrics API request:', {
      requestId,
      timestamp: new Date().toISOString(),
      method: 'data.keyword.metrics.fetch',
      requestBody: JSON.stringify({
        jsonrpc: '2.0',
        id: requestId,
        method: 'data.keyword.metrics.fetch',
        params: {
          data: request
        }
      })
    });

    const requestStartTime = Date.now();
    const response = await fetch('https://api.moz.com/jsonrpc', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-moz-token': mozToken
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: requestId,
        method: 'data.keyword.metrics.fetch',
        params: {
          data: request
        }
      })
    });

    const requestDuration = Date.now() - requestStartTime;
    
    // Log raw response for debugging
    const rawResponseText = await response.text();
    console.log('Raw Moz Keyword Metrics API response:', {
      requestId,
      timestamp: new Date().toISOString(),
      status: response.status,
      statusText: response.statusText,
      rawResponse: rawResponseText
    });

    // Parse response after logging
    const data = JSON.parse(rawResponseText);

    if (!response.ok) {
      console.error('Moz Keyword Metrics API error response:', {
        requestId,
        timestamp: new Date().toISOString(),
        status: response.status,
        statusText: response.statusText,
        duration: requestDuration
      });
      throw new Error(`Moz API error: ${response.statusText}`);
    }

    // Extract result from JSON-RPC response
    if (!data.result) {
      console.error('Moz API response missing result:', {
        requestId,
        timestamp: new Date().toISOString(),
        response: data
      });
      throw new Error('Moz API response missing result');
    }

    const totalDuration = Date.now() - startTime;

    // Log success metrics
    console.log('Moz Keyword Metrics API request completed:', {
      requestId,
      timestamp: new Date().toISOString(),
      totalDuration,
      requestDuration,
      parseTime: totalDuration - requestDuration,
      metrics: data.result.keyword_metrics
    });

    return data.result as MozKeywordMetricsResponse;
  } catch (error) {
    const totalDuration = Date.now() - startTime;
    console.error('Moz Keyword Metrics API request failed:', {
      requestId,
      timestamp: new Date().toISOString(),
      duration: totalDuration,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : error,
      keyword
    });
    throw error;
  }
} 