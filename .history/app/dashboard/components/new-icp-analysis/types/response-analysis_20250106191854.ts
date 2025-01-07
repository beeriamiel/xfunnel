export interface ResponseAnalysis {
  id: number
  response_id: number | null
  citations_parsed: any | null // jsonb
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
  solution_analysis: any | null // jsonb
  analysis_batch_id: string | null
  created_by_batch: boolean | null
  icp_vertical: string | null
} 