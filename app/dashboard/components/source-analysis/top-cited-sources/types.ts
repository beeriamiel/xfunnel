import { Database } from '@/types/supabase'
import { Query, ContentAnalysis } from '../types'

type CitationRow = Database['public']['Tables']['citations']['Row']

export interface TopCitedSource {
  // Basic Info
  citation_url: string
  domain: string
  
  // Citation Stats
  citation_count: number
  average_citation_order: number
  citations: CitationRow[]
  lastCited: Date
  
  // Authority Metrics
  domain_authority: number | null
  page_authority: number | null
  spam_score: number | null
  
  // Source Classification
  source_type: 'owned' | 'ugc' | 'affiliate'
  buyer_journey_phase?: string
  
  // Company Mentions
  mentioned_companies_count?: string[]
  mentioned_companies?: string[]
  rank_list?: string
  
  // Content Analysis
  content_analysis?: ContentAnalysis
  
  // Query Context
  queries: Query[]
  
  // Additional Metadata
  verticals: string[]
  regions: string[]
}

export interface TopCitedSourcesProps {
  companyId: number | null
}

// Shared constants
export const MENTION_PHASES = ['problem_exploration', 'solution_education'] as const
export const RANKING_PHASES = ['solution_comparison', 'final_research'] as const

// Helper type for processing citations
export interface GroupedCitation {
  url: string
  citations: CitationRow[]
  total_citations: number
  citation_orders: number[]
  average_order: number
  latest_citation: CitationRow
} 