// Response Analysis Types
export interface ResponseAnalysis {
  sentiment_score: number;
  ranking_position: number | null;
  company_mentioned: boolean;
  solution_analysis: any;
  buyer_persona: string;
  query_id: number;
  buying_journey_stage: string | null;
  answer_engine: string;
  rank_list: string | null;
  response_text: string | null;
  citations_parsed: { urls: string[] } | null;
  recommended?: boolean;
  mentioned_companies?: string[];
}

// Metrics Types
export interface Metrics {
  avgSentiment: number;
  avgPosition: number | null;
  companyMentioned?: number;
  featureScore?: number;
  totalQueries?: number;
}

export interface TimeMetrics {
  sentiment: number;
  position: number | null;
  mentions: number;
  features: number;
  totalResponses: number;
}

export interface MetricsData {
  current: TimeMetrics;
  previous?: TimeMetrics;
  changes?: {
    sentiment: number;
    position: number;
    mentions: number;
    features: number;
  };
}

// Analytics Types
export interface RegionAnalytics {
  geographic_region: string;
  total_queries: number;
  avg_sentiment: number;
  avg_position: number | null;
  mention_percentage: number;
  feature_score: number;
  engines: string[];
}

export interface VerticalAnalytics {
  icp_vertical: string;
  total_queries: number;
  avg_sentiment: number;
  avg_position: number | null;
  mention_percentage: number;
  feature_score: number;
}

export interface PersonaAnalytics {
  buyer_persona: string;
  total_queries: number;
  avg_sentiment: number;
  avg_position: number | null;
  mention_percentage: number;
  feature_score: number;
  queries: Query[];
}

// Query Types
export interface Query {
  id: number;
  text: string;
  buyerJourneyPhase: string;
  engineResults: {
    [engine: string]: {
      rank: number | 'n/a';
      rankList?: string | null;
      responseText?: string;
      recommended?: boolean;
      citations?: string[];
      solutionAnalysis?: SolutionAnalysis;
      companyMentioned?: boolean;
      mentioned_companies?: string[];
    }
  };
  companyMentioned: boolean;
  companyMentionRate: number;
  companyName?: string;
}

export interface SolutionAnalysis {
  has_feature: 'YES' | 'NO' | 'N/A';
}

// Navigation Types
export interface TimeSegment {
  id: string;
  type: 'BATCH' | 'WEEK' | 'MONTH';
  startDate: string;
  endDate: string;
  displayName: string;
}

// New Types for Progressive Navigation
export interface JourneyPath {
  region?: string;
  vertical?: string;
  persona?: string;
}

export interface Selection {
  type: 'region' | 'vertical' | 'persona';
  value: string;
}

export interface ViewProps {
  metrics: ViewMetrics;
  selections: JourneyPath;
  onSelect: (selection: Selection) => void;
}

export interface ViewMetrics {
  sentiment: number;
  position: number | null;
  mentions: number;
  features: number;
  totalResponses: number;
  timeComparison?: {
    sentiment: number;
    position: number;
    mentions: number;
    features: number;
  };
}

// Constants
export const PHASE_ORDER = [
  'problem_exploration',
  'solution_education',
  'solution_comparison',
  'solution_evaluation',
  'final_research'
] as const;

export const PHASE_LABELS: Record<typeof PHASE_ORDER[number], string> = {
  problem_exploration: 'Problem Exploration',
  solution_education: 'Solution Education',
  solution_comparison: 'Solution Comparison',
  solution_evaluation: 'Solution Evaluation',
  final_research: 'User Feedback'
};

export const EARLY_PHASES = ['problem_exploration', 'solution_education'];
export const POSITION_PHASES = ['solution_comparison', 'final_research'];
export const EVALUATION_PHASE = 'solution_evaluation';

// Engine Mappings
export const engineMapping: Record<string, string> = {
  perplexity: 'perplexity',
  claude: 'claude',
  gemini: 'gemini',
  openai: 'searchgpt',
  google_search: 'aio'
};

export const reverseEngineMapping: Record<string, string> = {
  perplexity: 'perplexity',
  claude: 'claude',
  gemini: 'gemini',
  searchgpt: 'openai',
  aio: 'google_search'
};

export const engineDisplayNames: Record<string, string> = {
  perplexity: 'Perplexity',
  claude: 'Claude',
  gemini: 'Gemini',
  searchgpt: 'SearchGPT',
  aio: 'AIO'
}; 