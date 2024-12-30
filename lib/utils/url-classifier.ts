export type SourceType = 'OWNED' | 'COMPETITOR' | 'UGC' | 'EARNED';

const UGC_DOMAINS = new Set([
  'reddit.com',
  'quora.com',
  'facebook.com',
  'trustpilot.com',
  'gartner.com',
  'capterra.com',
  'g2.com',
  'softwareadvice.com',
  'youtube.com',
  'twitch.tv',
  'stackexchange.com',
  'news.ycombinator.com',
  'apps.apple.com',
  'play.google.com',
  'producthunt.com',
  'medium.com',
  'slashdot.org',
  'twitter.com',
  'instagram.com',
  'getapp.com',
  'peerspot.com',
  'spiceworks.com',
  'resellerratings.com',
  'softwareworld.co',
  'financesonline.com',
  'toptenreviews.com',
  'comparecamp.com',
  'reviewtrackers.com',
  'sitejabber.com',
  'reevoo.com',
  'goodfirms.co',
  'techvalidate.com',
  'trustradius.com',
  'pcworld.com',
  'zdnet.com',
  'tiktok.com',
  'discord.com',
  'forum.xda-developers.com',
  'forums.tomshardware.com',
  'techspot.com',
  'hardforum.com',
  'forums.anandtech.com',
  'feedback.productboard.com',
  'dev.to',
  'kaggle.com',
  'stackoverflow.com',
  'community.cloudflare.com',
  'github.com',
  'linkedin.com'
]);

function extractBaseDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    const parts = urlObj.hostname.split('.');
    // Remove 'www' if present
    if (parts[0] === 'www') {
      parts.shift();
    }
    const domain = parts.join('.');
    
    console.log('Domain extraction:', {
      originalUrl: url,
      extractedDomain: domain,
      parts: parts,
      timestamp: new Date().toISOString()
    });
    
    return domain;
  } catch (error) {
    console.error('Error extracting domain:', { url, error });
    return '';
  }
}

function normalizeText(text: string): string {
  return text.toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

function fuzzyMatch(domain: string, name: string): boolean {
  const normalizedDomain = normalizeText(domain);
  const normalizedName = normalizeText(name);
  
  // Direct match
  if (normalizedDomain.includes(normalizedName)) {
    return true;
  }
  
  // Domain parts match
  const domainParts = normalizedDomain.split('.');
  const nameParts = normalizedName.split(/[\s-_]+/);
  
  return nameParts.some(part => 
    domainParts.some(domainPart => 
      domainPart.includes(part) || part.includes(domainPart)
    )
  );
}

export function normalizeCompanyName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\./g, '')         // Remove all periods first
    .replace(/[^\w\s-]/g, '')   // Then remove other special chars except spaces/hyphens
    .replace(/\s+/g, '-')       // Replace spaces with hyphens
    .replace(/-+/g, '-')        // Replace multiple hyphens with single
    .trim();
}

export function classifyUrl(
  url: string,
  companyName: string,
  mentionedCompanies: string[]
): SourceType {
  try {
    console.log('Starting URL classification:', {
      url,
      companyName,
      competitorCount: mentionedCompanies.length,
      timestamp: new Date().toISOString()
    });

    const domain = extractBaseDomain(url);
    
    // Check UGC first
    const isUgc = UGC_DOMAINS.has(domain);
    console.log('UGC check:', {
      domain,
      isInUgcList: isUgc,
      ugcDomainsSize: UGC_DOMAINS.size,
      timestamp: new Date().toISOString()
    });

    if (isUgc) {
      return 'UGC';
    }
    
    // Rest of classification with logging...
    const isOwned = fuzzyMatch(domain, companyName);
    console.log('OWNED check:', {
      domain,
      companyName,
      isOwned,
      timestamp: new Date().toISOString()
    });

    if (isOwned) {
      return 'OWNED';
    }

    // Check competitors
    for (const competitor of mentionedCompanies) {
      const isCompetitor = fuzzyMatch(domain, competitor);
      console.log('COMPETITOR check:', {
        domain,
        competitor,
        isCompetitor,
        timestamp: new Date().toISOString()
      });
      
      if (isCompetitor) {
        return 'COMPETITOR';
      }
    }

    console.log('Defaulting to EARNED:', {
      domain,
      reason: 'No matches found',
      timestamp: new Date().toISOString()
    });
    
    return 'EARNED';
  } catch (error) {
    console.error('Error classifying URL:', { url, error });
    return 'EARNED';
  }
} 