export interface AIOverviewResult {
  termId: number
  term: string
  hasAIOverview: boolean
  companyMentioned: boolean
  competitorMentions: string[]
  url?: string
  contentSnapshot?: string
}

export interface AnalysisProgress {
  completed: number
  total: number
  results: AIOverviewResult[]
}

export interface CompanyContext {
  name: string
  competitors: string[]
} 