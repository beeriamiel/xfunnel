// Metric types
export interface Metrics {
  average_sentiment: number
  average_position: number
  company_mentioned: number
  recommendation_probability: number
}

// Platform specific metrics
export interface PlatformRankings {
  perplexity: number
  claude: number
  gemini: number
}

// Mock data types
export interface RegionData {
  region: string
  metrics: Metrics
}

export interface VerticalData {
  vertical: string
  metrics: Metrics
}

export interface PersonaData {
  persona: string
  metrics: Metrics
}

export interface QueryData {
  query: string
  metrics: Metrics
  platform_rankings: PlatformRankings
  buying_journey_stage: BuyingJourneyStage
}

// Buying journey stages
export type BuyingJourneyStage = 
  | 'problem_exploration'
  | 'solution_education'
  | 'solution_comparison'
  | 'solution_evaluation'
  | 'final_research'

// Mock data
export const MOCK_DATA = {
  total: {
    metrics: {
      average_sentiment: 72,
      average_position: 2.1,
      company_mentioned: 68,
      recommendation_probability: 75
    },
    timeline: Array.from({ length: 12 }, (_, i) => ({
      date: new Date(2024, i, 1).toISOString(),
      metrics: {
        average_sentiment: 65 + Math.random() * 20,
        average_position: 1.5 + Math.random() * 2,
        company_mentioned: 60 + Math.random() * 20,
        recommendation_probability: 70 + Math.random() * 20
      }
    }))
  }
} 