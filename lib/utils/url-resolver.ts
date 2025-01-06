import { FirecrawlClient } from '../clients/firecrawl';

export async function resolveUrlWithFirecrawl(url: string): Promise<string> {
  try {
    const firecrawl = new FirecrawlClient();
    const metadata = await firecrawl.getMetadata(url);
    
    if (!metadata?.url) {
      console.log('No resolved URL in Firecrawl metadata, falling back to original:', url);
      return url;
    }

    console.log('Successfully resolved URL with Firecrawl:', {
      original: url,
      resolved: metadata.url
    });

    return metadata.url;
  } catch (error) {
    console.error('Error resolving URL with Firecrawl:', error);
    return url;
  }
}