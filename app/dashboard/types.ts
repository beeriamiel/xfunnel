import { Database } from '@/types/supabase';

type Tables = Database['public']['Tables'];
type ResponseAnalysisRow = Tables['response_analysis']['Row'];
type ResponseRow = Tables['responses']['Row'];
type QueryRow = Tables['queries']['Row'];

export interface DatabaseResponseAnalysis {
  buying_journey_stage: string;
  sentiment_score: number | null;
  ranking_position: number | null;
  recommended: boolean;
  company_mentioned: boolean;
  responses: {
    answer_engine: string;
    queries: {
      user_id: string;
    };
  };
}

export interface ResponseWithQuery {
  answer_engine: string;
  queries: {
    user_id: string;
  };
}

export interface EngineAnalysis {
  buying_journey_stage: string;
  sentiment_score: number | null;
  ranking_position: number | null;
  responses: {
    answer_engine: string;
    queries: {
      user_id: string;
    };
  };
}

export interface AIEngineRanking {
  name: string;
  color?: string;
  visibility: number;
  percentageRanked: number;
  recommendationProbability: number;
  avgRankingPosition: number;
  citationAppearance: number;
  avgCitationPosition: number;
  totalMentions?: number;
  avgSentiment?: number;
  rankingPosition?: number;
  demographics?: {
    topICPs: Array<{ name: string; score: number }>;
    topVerticals: Array<{ name: string; score: number }>;
  };
  topSources?: any[];
}

export interface AIEngineTimeSeriesEntry {
  date: string;
  engines: Array<{
    name: string;
    avgSentiment: number;
    avgPosition: number;
    visibilityRate: number;
    recommendationProb: number;
  }>;
}

export interface BuyingJourneyMetrics {
  stage: JourneyStage
  metrics: {
    sentimentScore: number
    rankingPosition: number
    recommendationRate: number
    mentionRate: number
    totalResponses: number
  }
}

export interface EnginePerformance {
  engine: string
  stage: JourneyStage
  metrics: {
    avgSentiment: number
    avgPosition: number
  }
} 

export const JOURNEY_STAGES = [
  'Problem Exploration',
  'Solution Education',
  'Solution Comparison',
  'Solution Evaluation',
  'Final Research'
] as const;

export type JourneyStage = (typeof JOURNEY_STAGES)[number];

export interface Citation {
  id: string
  title: string
  url: string
  date: string
  source: {
    name: string
    type: 'Documentation' | 'Blog' | 'GitHub' | 'Guide' | 'Tutorial'
    lastUpdated: string
    section?: string
  }
  metrics: {
    totalQueryReferences: number
    queryBreakdown: {
      awareness: number
      consideration: number
      decision: number
    }
    engineReferences: Array<{
      platform: string
      references: number
      percentage: number
    }>
  }
  sentiment: number
  competitorMentions: Array<{
    company: string
    coMentionCount: number
    context: 'Alternative' | 'Comparison' | 'Integration' | 'Migration'
    sentiment: 'Positive' | 'Neutral' | 'Negative'
  }>
  attention: {
    type: 'Opportunity' | 'Risk' | 'Monitor'
    message: string
  } | null
  quote: string
}

export interface TopCitation {
  citation: Citation
  impactScore: number
  recentMentions: number
}

export interface SentimentTrend {
  date: string
  avgSentiment: number
  totalMentions: number
}

export interface CompetitorMetrics {
  competitor: string
  metrics: {
    avgSentiment: number
    totalMentions: number
    rankingPosition: number
    visibilityProbability: number
    recommendationProbability: number
    citationAppearances: number
    overallScore: number
  }
  trend: 'up' | 'down' | 'same'
  demographics: {
    topICPs: Array<{ name: string; score: number }>
    topVerticals: Array<{ name: string; score: number }>
    topRegions: Array<{ name: string; score: number }>
  }
  topSources: Array<{
    name: string
    url: string
    platforms: string[]
    citationRate: number
    sourceType: 'Documentation' | 'Blog' | 'Forum' | 'News'
    relevance: number
  }>
}

export interface RegionalData extends Omit<FunnelNode, 'details'> {
  region: string;
  score: number;
  color: string;
  topQueries: string[];
  growth: string;
  marketPenetration: string;
  details: {
    influence: number;
    [key: string]: any;
  };
}

export interface MapData {
  country: string
  value: number
}

export interface AIEngine {
  engine: string
  visibility: number
  percentageRanked: number
  recommendationProbability: number
  avgRankingPosition: number
  citationAppearance: number
  avgCitationPosition: number
  color: string
}

export interface EngineTimeSeriesData {
  date: string;
  perplexity: number;
  claude: number;
  gemini: number;
  searchGPT: number;
  aio: number;
}

export interface ChartData {
  sentiment: EngineTimeSeriesData[];
  position: EngineTimeSeriesData[];
  mentioned: EngineTimeSeriesData[];
  recommendation: EngineTimeSeriesData[];
}

export interface ChartDataPoint {
  date: string
  Perplexity: number
  Claude: number
  Gemini: number
  SearchGPT: number
  AIO: number
}

export interface SentimentTooltipPayload {
  value: number
  name: string
}

export type TrendDirection = 'up' | 'down' | 'stable'

export interface FunnelMetric {
  label: string;
  value: number;
  trend?: TrendDirection;
}

export interface FunnelNode {
  id: string;
  name: string;
  title: string;
  metrics: FunnelMetric[];
  icon?: React.ReactNode;
  details: {
    influence: number;
    [key: string]: any;
  };
}

export interface QueryPerformance {
  id: string;
  query: string;
  category: string;
  impact: 'High' | 'Medium' | 'Low';
  userIntent: string;
  buyingJourney: JourneyStage;
  platforms: Array<{
    name: string;
    position: number | '-';
    cited: boolean;
  }>;
  averagePosition: number;
}

export type JourneyLevel = 'region' | 'vertical' | 'persona' | 'queries' | 'queryDetails'

export interface BreadcrumbItem {
  id: string
  name: string
  level: JourneyLevel
}

export interface Competitor {
  name: string
  share: number
}

export interface Persona {
  id: string
  title: string
  icon: React.ReactNode
  metrics: FunnelMetric[]
  details: {
    influence: number
  }
}

export interface ResponseAnalysis {
  buying_journey_stage: string
  sentiment_score: number | null
  ranking_position: number | null
  recommended: boolean
  company_mentioned: boolean
  responses: {
    answer_engine: string
    queries: {
      user_id: string
    }
  }
}

export interface CompetitorMetric {
  competitor: string;
  metrics: {
    avgSentiment: number;
    totalMentions: number;
    rankingPosition: number;
    visibilityProbability: number;
    recommendationProbability: number;
    citationAppearances: number;
    overallScore: number;
  };
  demographics: {
    topICPs: Array<{ name: string; score: number }>;
    topVerticals: Array<{ name: string; score: number }>;
    topRegions: Array<{ name: string; score: number }>;
  };
  topSources: Array<{
    name: string;
    url: string;
    platforms: string[];
    citationRate: number;
    sourceType: 'Documentation' | 'Blog' | 'Forum' | 'News';
    relevance: number;
  }>;
}

export interface AIEngine {
  engine: string
  color: string
  visibility: number
  percentageRanked: number
  recommendationProbability: number
  avgRankingPosition: number
  citationAppearance: number
}

export interface AIEngineTimeSeriesData {
  date: string
  engine: string
  avgSentiment: number
  avgPosition: number
  visibilityRate: number
  recommendationProb: number
}

export interface BuyingJourneyMetric {
  stage: string
  metrics: {
    sentimentScore: number
    rankingPosition: number
    recommendationRate: number
    mentionRate: number
    totalResponses: number
  }
} 

export interface RealTimeMetrics {
  // Basic metrics
  totalCitations: number;
  avgSentiment: number;
  avgPosition: number;

  // Map and regional data
  mapData: MapData[];
  regionalData: RegionalData[];
  regions: RegionalData[];

  // Citations and trends
  topCitations: TopCitation[];
  sentimentTrends: SentimentTrend[];
  citationAnalysis: CitationAnalysis[];

  // AI Engine related
  aiEngines: AIEngine[];
  aiEngineRankings: AIEngine[];
  aiEngineTimeSeries: AIEngineTimeSeriesData[];

  // Journey and funnel
  buyingJourneyMetrics: BuyingJourneyMetric[];
  funnelData: FunnelNode[];

  // Segmentation
  verticals: FunnelNode[];
  personas: FunnelNode[];

  // Competition
  competitorMetrics: CompetitorMetric[];

  // Query analysis
  queryPerformance: QueryPerformance[];

  // ICP analysis
  icpAnalysis: ICPAnalysis[];
} 

export type DateRange = 'day' | 'week' | 'month' | 'year'

export interface DashboardFilters {
  dateRange?: 'day' | 'week' | 'month' | 'year';
  region?: string;
  vertical?: string;
  persona?: string;
  journeyStage?: JourneyStage;
  competitors?: string[];
  engines?: string[];
  journeyStages?: JourneyStage[];
}

export interface CitationAnalysis {
  id: string;
  title: string;
  url: string;
  sourceType: 'Documentation' | 'Blog' | 'GitHub' | 'Guide' | 'Tutorial';
  citationCount: number;
  relevanceScore: number;
  source: {
    type: 'Documentation' | 'Blog' | 'GitHub' | 'Guide' | 'Tutorial';
    lastUpdated: string;
    section: string;
  };
  metrics: {
    totalQueryReferences: number;
    queryBreakdown: {
      awareness: number;
      consideration: number;
      decision: number;
    };
    engineReferences: Array<{
      platform: string;
      references: number;
      percentage: number;
    }>;
  };
  sentiment: number;
  competitorMentions: Array<{
    company: string;
    coMentionCount: number;
    context: 'Alternative' | 'Comparison' | 'Integration' | 'Migration';
    sentiment: 'Positive' | 'Neutral' | 'Negative';
  }>;
  attention: {
    type: 'Opportunity' | 'Risk' | 'Monitor';
    message: string;
  } | null;
}

export interface ICPAnalysis {
  id: string;
  name: string;
  score: number;
  trend: string;
  metrics: {
    avgSentiment: number;
    avgPosition: number;
    mentionRate: number;
    recommendationRate: number;
  };
  demographics: {
    topICPs: Array<{ name: string; score: number }>;
    topVerticals: Array<{ name: string; score: number }>;
    topRegions: Array<{ name: string; score: number }>;
  };
  topSources: Array<{
    name: string;
    url: string;
    platforms: string[];
    citationRate: number;
    sourceType: string;
    relevance: number;
  }>;
} 

export type MetricType = 'sentiment' | 'position' | 'mentioned' | 'recommendation'; 

export interface ResponseAnalysisDB {
  id: number;
  response_id: number;
  company_id: number;
  answer_engine: string;
  query_text: string;
  query_id: number;
  company_name: string;
  citations_parsed: any;
  recommended: boolean;
  cited: boolean;
  sentiment_score: number;
  ranking_position: number;
  company_mentioned: boolean;
  geographic_region: string | null;
  industry_vertical: string | null;
  buyer_persona: string | null;
  buying_journey_stage: string | null;
  response_text: string;
  rank_list: string | null;
  created_at: string;
}

export interface ResponseDB {
  id: number;
  query_id: number;
  response_text: string;
  answer_engine: string;
  url: string | null;
  created_at: string;
  citations: string[] | null;
  websearchqueries: string[] | null;
}

export interface QueryDB {
  id: number;
  company_id: number;
  query_text: string;
  buyer_journey_phase: string[];
  created_at: string;
  prompt_id: number | null;
  persona_id: number | null;
  user_id: string;
} 