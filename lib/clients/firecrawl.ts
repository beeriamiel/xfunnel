interface FirecrawlResponse {
  success: boolean;
  data: {
    content?: string;
    markdown?: string;
    provider: string;
    metadata: {
      title?: string;
      description?: string;
      language?: string;
      sourceURL: string;
    }
  };
}

interface FirecrawlError {
  error: string;
  code: string;
  statusCode?: number;
}

export class FirecrawlClient {
  private apiKey: string;
  private baseUrl: string;
  private maxRetries: number;
  private retryDelay: number;

  constructor() {
    const apiKey = process.env.FIRECRAWL_API_KEY;
    if (!apiKey) {
      throw new Error('FIRECRAWL_API_KEY is not set in environment variables');
    }

    this.apiKey = apiKey;
    this.baseUrl = 'https://api.firecrawl.dev/v1';
    this.maxRetries = 2;
    this.retryDelay = 1000; // 1 second
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async fetchWithRetry(url: string, retryCount = 0): Promise<FirecrawlResponse> {
    try {
      console.log('Firecrawl request:', {
        url: url,
        attempt: retryCount + 1,
        maxRetries: this.maxRetries,
        timestamp: new Date().toISOString()
      });

      const response = await fetch(`${this.baseUrl}/scrape`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          url: url,
          formats: ['markdown'],
          timeout: 30000, // 30 seconds
          waitFor: 1000  // Wait 1s for dynamic content
        })
      });

      // Log raw response for debugging
      console.log('Firecrawl raw response:', {
        url: url,
        status: response.status,
        contentType: response.headers.get('content-type'),
        timestamp: new Date().toISOString()
      });

      const data = await response.json();
      
      // Log parsed response
      console.log('Firecrawl parsed response:', {
        url: url,
        success: data.success,
        hasData: !!data.data,
        hasMarkdown: !!data.data?.markdown,
        contentLength: data.data?.markdown?.length || 0,
        timestamp: new Date().toISOString()
      });

      if (!response.ok) {
        throw {
          error: data.error || 'Unknown error',
          code: data.code || 'UNKNOWN_ERROR',
          statusCode: response.status
        };
      }

      return data as FirecrawlResponse;
    } catch (error) {
      console.error('Firecrawl error:', {
        url: url,
        attempt: retryCount + 1,
        error: error instanceof Error ? {
          message: error.message,
          name: error.name,
          stack: error.stack
        } : error,
        timestamp: new Date().toISOString()
      });

      if (retryCount < this.maxRetries) {
        await this.sleep(this.retryDelay * Math.pow(2, retryCount));
        return this.fetchWithRetry(url, retryCount + 1);
      }

      throw error;
    }
  }

  async scrapeUrl(url: string): Promise<string | null> {
    try {
      console.log('Starting URL scrape:', { url });
      
      const response = await this.fetchWithRetry(url);
      
      if (!response.success || !response.data?.markdown) {
        console.warn('Scraping unsuccessful:', {
          url,
          success: response.success,
          hasData: !!response.data,
          hasMarkdown: !!response.data?.markdown
        });
        return null;
      }

      console.log('Successfully scraped URL:', {
        url,
        contentLength: response.data.markdown.length,
        metadata: response.data.metadata
      });

      return response.data.markdown;
    } catch (error) {
      console.error('Failed to scrape URL:', {
        url,
        error: error instanceof Error ? {
          message: error.message,
          name: error.name,
          stack: error.stack
        } : error
      });
      
      return null;
    }
  }

  // Helper method to check rate limits and API status
  async checkApiStatus(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/status`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      console.log('API status check:', {
        status: response.status,
        ok: response.ok
      });

      return response.ok;
    } catch (error) {
      console.error('API status check failed:', error);
      return false;
    }
  }

  private async handleRateLimit(response: Response): Promise<void> {
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 60000; // Default to 60s
      console.log(`Rate limited, waiting ${waitTime}ms before retry`);
      await this.sleep(waitTime);
    }
  }

  async getMetadata(url: string): Promise<Record<string, any> | null> {
    try {
      const response = await this.fetchWithRetry(url);
      
      if (!response.success || !response.data?.metadata) {
        console.warn('No metadata available from Firecrawl:', {
          url,
          success: response.success,
          hasData: !!response.data,
          hasMetadata: !!response.data?.metadata
        });
        return null;
      }

      return response.data.metadata;
    } catch (error) {
      console.error('Failed to get metadata from Firecrawl:', {
        url,
        error: error instanceof Error ? {
          message: error.message,
          name: error.name,
          stack: error.stack
        } : error
      });
      
      return null;
    }
  }
} 