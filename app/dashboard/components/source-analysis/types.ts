export interface Query {
  text: string;
  date: string;
  response: string;
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
  mentioned_companies_count?: string[]; // Format: ["CompanyName:Count"] - Example: ["Fiserv:57", "Payrix:0"]
  rank_list?: string;
  content_analysis?: ContentAnalysis;
  queries: Query[];
};

export interface SourceCardProps {
  data: SourceData;
  type: 'mentions' | 'rankings';
}; 