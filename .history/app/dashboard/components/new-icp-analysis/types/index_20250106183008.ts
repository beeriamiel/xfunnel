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
  },
  regions: [
    {
      region: "Americas",
      metrics: {
        average_sentiment: 75,
        average_position: 1.8,
        company_mentioned: 72,
        recommendation_probability: 78
      },
      timeline: Array.from({ length: 12 }, (_, i) => ({
        date: new Date(2024, i, 1).toISOString(),
        metrics: {
          average_sentiment: 70 + Math.random() * 20,
          average_position: 1.2 + Math.random() * 2,
          company_mentioned: 65 + Math.random() * 20,
          recommendation_probability: 75 + Math.random() * 20
        }
      }))
    },
    {
      region: "EMEA",
      metrics: {
        average_sentiment: 68,
        average_position: 2.3,
        company_mentioned: 64,
        recommendation_probability: 71
      },
      timeline: Array.from({ length: 12 }, (_, i) => ({
        date: new Date(2024, i, 1).toISOString(),
        metrics: {
          average_sentiment: 60 + Math.random() * 20,
          average_position: 1.8 + Math.random() * 2,
          company_mentioned: 55 + Math.random() * 20,
          recommendation_probability: 65 + Math.random() * 20
        }
      }))
    },
    {
      region: "APAC",
      metrics: {
        average_sentiment: 70,
        average_position: 2.1,
        company_mentioned: 66,
        recommendation_probability: 73
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
  ],
  verticals: {
    "Americas": [
      {
        vertical: "Enterprise Software",
        metrics: {
          average_sentiment: 78,
          average_position: 1.5,
          company_mentioned: 75,
          recommendation_probability: 82
        },
        timeline: Array.from({ length: 12 }, (_, i) => ({
          date: new Date(2024, i, 1).toISOString(),
          metrics: {
            average_sentiment: 75 + Math.random() * 15,
            average_position: 1.2 + Math.random() * 1.5,
            company_mentioned: 70 + Math.random() * 15,
            recommendation_probability: 80 + Math.random() * 10
          }
        }))
      },
      {
        vertical: "Financial Services",
        metrics: {
          average_sentiment: 72,
          average_position: 2.1,
          company_mentioned: 68,
          recommendation_probability: 74
        },
        timeline: Array.from({ length: 12 }, (_, i) => ({
          date: new Date(2024, i, 1).toISOString(),
          metrics: {
            average_sentiment: 65 + Math.random() * 15,
            average_position: 1.8 + Math.random() * 1.5,
            company_mentioned: 60 + Math.random() * 15,
            recommendation_probability: 70 + Math.random() * 10
          }
        }))
      },
      {
        vertical: "Healthcare",
        metrics: {
          average_sentiment: 70,
          average_position: 2.3,
          company_mentioned: 65,
          recommendation_probability: 72
        },
        timeline: Array.from({ length: 12 }, (_, i) => ({
          date: new Date(2024, i, 1).toISOString(),
          metrics: {
            average_sentiment: 65 + Math.random() * 15,
            average_position: 2.0 + Math.random() * 1.5,
            company_mentioned: 60 + Math.random() * 15,
            recommendation_probability: 65 + Math.random() * 15
          }
        }))
      }
    ],
    "EMEA": [
      {
        vertical: "Manufacturing",
        metrics: {
          average_sentiment: 71,
          average_position: 2.0,
          company_mentioned: 67,
          recommendation_probability: 73
        },
        timeline: Array.from({ length: 12 }, (_, i) => ({
          date: new Date(2024, i, 1).toISOString(),
          metrics: {
            average_sentiment: 65 + Math.random() * 15,
            average_position: 1.7 + Math.random() * 1.5,
            company_mentioned: 62 + Math.random() * 15,
            recommendation_probability: 68 + Math.random() * 15
          }
        }))
      }
    ],
    "APAC": [
      {
        vertical: "E-commerce",
        metrics: {
          average_sentiment: 73,
          average_position: 1.9,
          company_mentioned: 69,
          recommendation_probability: 76
        },
        timeline: Array.from({ length: 12 }, (_, i) => ({
          date: new Date(2024, i, 1).toISOString(),
          metrics: {
            average_sentiment: 68 + Math.random() * 15,
            average_position: 1.6 + Math.random() * 1.5,
            company_mentioned: 64 + Math.random() * 15,
            recommendation_probability: 71 + Math.random() * 15
          }
        }))
      }
    ]
  }
} 