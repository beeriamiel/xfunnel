export interface AIOverviewsProps {
  companyId: number
  accountId: string
}

export interface KeywordManagementProps {
  companyId: number
  accountId: string
  isSuperAdmin: boolean
}

export interface AIOAnalysisProps {
  companyId: number
  accountId: string
  isSuperAdmin: boolean
}

export interface HistoricalTrackingProps {
  companyId: number
  accountId: string
  isSuperAdmin: boolean
}

export interface Keyword {
  id: string
  term: string
  status: 'pending' | 'approved' | 'rejected'
  source: 'moz' | 'user' | 'ai'
  created_at: string
  company_id: number
  account_id: string
  estimated_volume: number | null
  estimated_relevance: number | null
  estimated_difficulty: number | null
}

export interface SERPResult {
  id: string
  keyword: string
  hasAIOverview: boolean
  companyMentioned: boolean
  competitorMentions: CompetitorMention[]
  lastChecked: Date
  status: 'pending' | 'running' | 'complete' | 'error'
  error?: string
  url?: string
  position?: number
}

export interface CompetitorMention {
  competitorName: string
  mentioned: boolean
}

export interface AnalysisStatus {
  status: 'idle' | 'loading' | 'running' | 'complete' | 'error'
  progress?: number
  error?: string
}

export interface BatchAnalysisProgress {
  total: number
  completed: number
  running: number
  failed: number
}

export interface HistoricalDataPoint {
  date: Date
  aiOverviewCount: number
  companyMentionsCount: number
  competitorMentionsCount: number
  totalKeywords: number
}

export interface KeywordHistory {
  keyword: string
  history: Array<{
    date: Date
    hasAIOverview: boolean
    companyMentioned: boolean
    competitorMentions: string[]
  }>
  estimatedVolume: number | null
  estimatedRelevance: number | null
  estimatedDifficulty: number | null
}

export interface TimeRange {
  start: Date
  end: Date
}

export interface AIMetrics {
  // Placeholder for future metrics
  id: string
  name: string
  value: number
}

export interface Term {
  id: number
  term: string
  source: string
  status: string
  created_at: string
  updated_at: string
  company_id: number
  account_id: string
}

export interface TermAnalysis {
  termId: number
  term: string
  hasAIOverview: boolean
  companyMentioned: boolean
  competitorMentions: string[]
  url?: string
  contentSnapshot?: string | null
}

export interface HistoricalData {
  term_id: number
  term: string
  has_ai_overview: boolean
  company_mentioned: boolean
  competitor_mentions: string[]
  url: string | null
  content_snapshot: string | null
  checked_at: string
}

export interface TermsResponse {
  data: Term[]
  error: Error | null
}

export interface AnalysisResponse {
  data: TermAnalysis | null
  error: Error | null
}

export interface HistoricalResponse {
  data: HistoricalData[]
  error: Error | null
} 