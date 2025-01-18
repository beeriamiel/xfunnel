export type BuyerJourneyPhase = 
  | 'problem_exploration'
  | 'solution_education'
  | 'solution_comparison'
  | 'solution_evaluation'
  | 'final_research'

export type AnswerEngine = 
  | 'openai'
  | 'gemini'
  | 'perplexity'
  | 'claude'
  | 'google_search'
  | 'llama'

export type QueryRowState = 
  | 'no_queries'      // No queries exist
  | 'has_queries'     // Has queries but no responses
  | 'has_responses'   // Has queries and responses

export type QueryAction = 
  | 'generate_queries'
  | 'view_queries'
  | 'generate_response'
  | 'view_responses'

export interface QueryState {
  rowState: QueryRowState
  lastRunDate: Date | null
  queryCount: number
  responseCount?: number
  availableActions: QueryAction[]
}

export interface Response {
  id: number
  query_id: number
  response_text: string
  answer_engine: AnswerEngine
  url?: string | null
  created_at: string | null
  citations?: string[]
  websearchqueries?: string[]
  response_batch_id: string
  created_by_batch?: boolean
}

export interface Query {
  id: string
  query_text: string
  buyer_journey_phase: string[] | null
  created_at: string | null
  prompt_id: number | null
  persona_id: number | null
  company_id: number | null
  user_id: string | null
  query_batch_id: string | null
  created_by_batch: boolean | null
  responses?: Response[]
  lastResponseDate?: string | null
  queries?: Array<{
    id: string
    text: string
  }>
}

export interface ICP {
  id: number
  vertical: string
  company_size: string
  region: string
  created_at?: string | null
  icp_batch_id?: string | null
  created_by_batch?: boolean | null
  company_id?: number | null
  personas: Persona[]
}

export interface Persona {
  id: number
  title: string
  seniority_level: string
  department: string
  created_at?: string | null
  icp_id?: number | null
  queries?: Query[]
  queryState?: QueryState
  lastResponseDate?: string | null
  responseCount?: number
}

export interface Product {
  id: string
  name: string
  description?: string
}

export interface Competitor {
  id: string
  name: string
  description?: string
}

export interface CompanyProfile {
  icps: ICP[]
  personas: Persona[]
  products: Product[]
  competitors: Competitor[]
}

export interface PersonaStats {
  lastBatchDate?: string
  companyMentioned?: string
  averagePosition?: string
  featureScore?: string
  averageSentiment?: string
  queryCount?: number
  responseCount?: number
} 