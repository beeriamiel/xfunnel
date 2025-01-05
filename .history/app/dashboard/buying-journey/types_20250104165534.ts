export type BuyingStage =
  | 'problem-exploration'
  | 'solution-education'
  | 'solution-comparison'
  | 'solution-evaluation'
  | 'user-feedback'

export interface MetricData {
  sentiment: number
  position: number
  mentioned: number
  featureScore: number
  changes?: {
    sentiment: number
    position: number
    mentioned: number
    featureScore: number
  }
}

export interface Region {
  id: string
  name: string
  metrics: MetricData
}

export interface Vertical {
  id: string
  name: string
  metrics: MetricData
}

export interface Persona {
  id: string
  name: string
  description: string
  metrics: MetricData
}

export interface EngineResult {
  name: string
  result: {
    mentioned?: boolean
    position?: number
    featureAnalysis?: {
      yes: number
      no: number
      unknown: number
    }
  }
}

export interface Query {
  id: string
  text: string
  stage: BuyingStage
  engines: EngineResult[]
}

export interface TimeFilter {
  type: 'batch' | 'time'
  batchId?: string
  timePeriod?: {
    type: 'week' | 'month'
    value: string
  }
}

// Response Analysis from database
export interface ResponseAnalysis {
  id: number
  response_id: number | null
  citations_parsed: any | null
  recommended: boolean | null
  cited: boolean | null
  created_at: string | null
  sentiment_score: number | null
  ranking_position: number | null
  company_mentioned: boolean | null
  geographic_region: string | null
  industry_vertical: string | null
  buyer_persona: string | null
  buying_journey_stage: string | null
  response_text: string | null
  rank_list: string | null
  company_id: number
  answer_engine: string
  query_text: string | null
  query_id: number | null
  company_name: string
  prompt_id: number | null
  prompt_name: string | null
  competitors_list: string[] | null
  mentioned_companies: string[] | null
  solution_analysis: any | null
  analysis_batch_id: string | null
  created_by_batch: boolean | null
  icp_vertical: string | null
} 