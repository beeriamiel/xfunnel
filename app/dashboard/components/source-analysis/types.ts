import { Database } from '@/types/supabase'

export interface CitationRow {
  id: number
  citation_url: string
  citation_order: number
  response_analysis_id: number
  company_id: number
  recommended: boolean | null
  company_mentioned: boolean | null
  buyer_journey_phase: string | null
  rank_list: string | null
  mentioned_companies: string[] | null
  mentioned_companies_count: string[]
  icp_vertical: string | null
  response_text: string | null
  region: string | null
  ranking_position: number | null
  domain_authority: number | null
  source_type: CitationSourceType
  query_text: string | null
  content_analysis: string | null
  external_links_to_root_domain: number | null
  page_authority: number | null
  created_at: string | null
  updated_at: string | null
  answer_engine: string | null
}

export type CitationSourceType = 'OWNED' | 'EARNED' | 'COMPETITOR' | 'UGC'

export type AnswerEngine = 'google_search' | 'open_ai' | 'claude' | 'perplexity' | 'gemini' | null

export interface Query {
  text: string;
  date: string;
  response: string;
  answer_engine: string | null;
};

export interface ContentAnalysisMetric {
  score: number;
  details?: string;
};

export interface ContentAnalysisMetrics {
  keyword_usage: ContentAnalysisMetric;
  statistics: ContentAnalysisMetric;
  quotations: ContentAnalysisMetric;
  citations: ContentAnalysisMetric;
  fluency: ContentAnalysisMetric;
  technical_terms: ContentAnalysisMetric;
  authority: ContentAnalysisMetric;
  readability: ContentAnalysisMetric;
  unique_words: ContentAnalysisMetric;
};

export interface ContentAnalysis {
  metrics: ContentAnalysisMetrics;
  summary?: string;
};

export interface SourceData {
  domain: string;
  citation_url: string;
  citation_count: number;
  domain_authority?: number;
  source_type?: 'owned' | 'ugc' | 'affiliate';
  buyer_journey_phase?: string;
  mentioned_companies_count?: string[];
  rank_list?: string;
  content_analysis?: ContentAnalysis;
  queries: Query[];
};

export interface SourceCardProps {
  data: SourceData;
  type: 'mentions' | 'rankings';
};

export interface FilterOptions {
  buyingJourneyPhase: string | null;
  sourceType: string | null;
  answerEngine: string | null;
}

export interface ParsedContentAnalysisDetails {
  total_words: number;
  avg_sentence_length: number;
  keyword_density: number;
  technical_term_count: number;
  statistics_count: number;
  quote_count: number;
  citation_count: number;
}

export interface OverallSourceData {
  domain: string;
  citation_url: string;
  citation_count: number;
  domain_authority?: number;
  source_type?: 'owned' | 'ugc' | 'affiliate';
  buyer_journey_phases: string[];
  mentioned_companies_count: string[];
  rank_list?: string;
  content_analysis?: ContentAnalysis;
  queries: Query[];
  external_links_to_root_domain?: number;
  page_authority?: number;
  content_analysis_details?: ParsedContentAnalysisDetails;
  citation_orders: number[];
  average_citation_order: number | null;
  answer_engines: string[];
}

export interface OverallSourceCardProps {
  source: OverallSourceData;
  onClick: () => void;
}

export interface LocalFilterOptions {
  buyingJourneyPhase: string | null;
  sourceType: CitationSourceType | null;
  answerEngine: AnswerEngine | null;
} 