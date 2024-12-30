import { SourceData, Query, ContentAnalysis } from './types';

export interface RawCitation {
  id: number;
  created_at: string | null;
  citation_url: string;
  citation_order: number;
  response_analysis_id: number;
  company_id: number;
  recommended: boolean | null;
  company_mentioned: boolean | null;
  buyer_persona: string | null;
  buyer_journey_phase: string | null;
  rank_list: string | null;
  mentioned_companies: string[] | null;
  icp_vertical: string | null;
  response_text: string | null;
  region: string | null;
  ranking_position: number | null;
  updated_at: string | null;
  domain_authority: number | null;
  source_type: string | null;
  query_text: string | null;
  content_analysis: string | null;
}

export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    // If URL parsing fails, try basic string manipulation
    const match = url.match(/(?:https?:\/\/)?(?:www\.)?([^\/]+)/);
    return match ? match[1] : url;
  }
}

export function parseContentAnalysis(contentAnalysisJson: string | null): ContentAnalysis | undefined {
  if (!contentAnalysisJson) return undefined;
  
  try {
    const parsed = JSON.parse(contentAnalysisJson);
    return {
      metrics: {
        keyword_usage: { score: parsed.metrics?.keyword_usage?.score || 0 },
        statistics: { score: parsed.metrics?.statistics?.score || 0 },
        quotations: { score: parsed.metrics?.quotations?.score || 0 },
        citations: { score: parsed.metrics?.citations?.score || 0 },
        fluency: { score: parsed.metrics?.fluency?.score || 0 },
        technical_terms: { score: parsed.metrics?.technical_terms?.score || 0 },
        authority: { score: parsed.metrics?.authority?.score || 0 },
        readability: { score: parsed.metrics?.readability?.score || 0 },
        unique_words: { score: parsed.metrics?.unique_words?.score || 0 }
      },
      summary: parsed.summary || ''
    };
  } catch (e) {
    console.warn('Failed to parse content analysis:', e);
    return undefined;
  }
}

interface GroupedCitation {
  url: string;
  domain: string;
  citations: RawCitation[];
  citationCount: number;
  latestCitation: RawCitation;
}

export function groupCitationsByUrl(citations: RawCitation[]): GroupedCitation[] {
  const groupedMap = new Map<string, GroupedCitation>();

  citations.forEach(citation => {
    const url = citation.citation_url;
    const domain = extractDomain(url);

    if (!groupedMap.has(url)) {
      groupedMap.set(url, {
        url,
        domain,
        citations: [],
        citationCount: 0,
        latestCitation: citation
      });
    }

    const group = groupedMap.get(url)!;
    group.citations.push(citation);
    group.citationCount++;

    // Update latest citation if this one is newer
    if (new Date(citation.created_at || '') > new Date(group.latestCitation.created_at || '')) {
      group.latestCitation = citation;
    }
  });

  return Array.from(groupedMap.values())
    .sort((a, b) => b.citationCount - a.citationCount);
}

export function convertToSourceData(groupedCitation: GroupedCitation): SourceData {
  const latestCitation = groupedCitation.latestCitation;
  
  // Convert all citations to Query objects
  const queries: Query[] = groupedCitation.citations
    .filter(citation => citation.query_text || citation.response_text) // Only include citations with query or response
    .map(citation => ({
      text: citation.query_text || '',
      date: new Date(citation.created_at || '').toLocaleDateString(),
      response: citation.response_text || ''
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Sort by date descending

  // Process mentioned companies to include counts
  const mentionedCompaniesCount = latestCitation.mentioned_companies?.map(company => `${company}:1`) || undefined;

  return {
    domain: groupedCitation.domain,
    citation_url: groupedCitation.url,
    citation_count: groupedCitation.citationCount,
    domain_authority: latestCitation.domain_authority || undefined,
    source_type: (latestCitation.source_type as 'owned' | 'ugc' | 'affiliate') || undefined,
    buyer_journey_phase: latestCitation.buyer_journey_phase || undefined,
    mentioned_companies_count: mentionedCompaniesCount,
    rank_list: latestCitation.rank_list || undefined,
    content_analysis: parseContentAnalysis(latestCitation.content_analysis),
    queries
  };
}

export function isValidCitation(item: unknown): item is RawCitation {
  if (!item || typeof item !== 'object') return false;
  
  const citation = item as Record<string, unknown>;
  
  return (
    typeof citation.id === 'number' &&
    typeof citation.citation_url === 'string' &&
    typeof citation.citation_order === 'number' &&
    typeof citation.response_analysis_id === 'number' &&
    typeof citation.company_id === 'number' &&
    (citation.created_at === null || typeof citation.created_at === 'string') &&
    (citation.updated_at === null || typeof citation.updated_at === 'string') &&
    (citation.recommended === null || typeof citation.recommended === 'boolean') &&
    (citation.company_mentioned === null || typeof citation.company_mentioned === 'boolean') &&
    (citation.buyer_persona === null || typeof citation.buyer_persona === 'string') &&
    (citation.buyer_journey_phase === null || typeof citation.buyer_journey_phase === 'string') &&
    (citation.rank_list === null || typeof citation.rank_list === 'string') &&
    (citation.mentioned_companies === null || Array.isArray(citation.mentioned_companies)) &&
    (citation.icp_vertical === null || typeof citation.icp_vertical === 'string') &&
    (citation.response_text === null || typeof citation.response_text === 'string') &&
    (citation.region === null || typeof citation.region === 'string') &&
    (citation.ranking_position === null || typeof citation.ranking_position === 'number') &&
    (citation.domain_authority === null || typeof citation.domain_authority === 'number') &&
    (citation.source_type === null || typeof citation.source_type === 'string') &&
    (citation.query_text === null || typeof citation.query_text === 'string') &&
    (citation.content_analysis === null || typeof citation.content_analysis === 'string')
  );
} 