// Metric types
export interface Metrics {
  average_sentiment: number
  average_position: number
  company_mentioned: number
  feature_score: number
}

// Platform specific metrics
export interface PlatformRankings {
  perplexity: number
  claude: number
  gemini: number
  searchgpt: number
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
      feature_score: 75
    },
    timeline: Array.from({ length: 12 }, (_, i) => ({
      date: new Date(2024, i, 1).toISOString(),
      metrics: {
        average_sentiment: 65 + Math.random() * 20,
        average_position: 1.5 + Math.random() * 2,
        company_mentioned: 60 + Math.random() * 20,
        feature_score: 70 + Math.random() * 20
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
        feature_score: 78
      },
      timeline: Array.from({ length: 12 }, (_, i) => ({
        date: new Date(2024, i, 1).toISOString(),
        metrics: {
          average_sentiment: 70 + Math.random() * 20,
          average_position: 1.2 + Math.random() * 2,
          company_mentioned: 65 + Math.random() * 20,
          feature_score: 75 + Math.random() * 20
        }
      }))
    },
    {
      region: "EMEA",
      metrics: {
        average_sentiment: 68,
        average_position: 2.3,
        company_mentioned: 64,
        feature_score: 71
      },
      timeline: Array.from({ length: 12 }, (_, i) => ({
        date: new Date(2024, i, 1).toISOString(),
        metrics: {
          average_sentiment: 60 + Math.random() * 20,
          average_position: 1.8 + Math.random() * 2,
          company_mentioned: 55 + Math.random() * 20,
          feature_score: 65 + Math.random() * 20
        }
      }))
    },
    {
      region: "APAC",
      metrics: {
        average_sentiment: 70,
        average_position: 2.1,
        company_mentioned: 66,
        feature_score: 73
      },
      timeline: Array.from({ length: 12 }, (_, i) => ({
        date: new Date(2024, i, 1).toISOString(),
        metrics: {
          average_sentiment: 65 + Math.random() * 20,
          average_position: 1.5 + Math.random() * 2,
          company_mentioned: 60 + Math.random() * 20,
          feature_score: 70 + Math.random() * 20
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
          feature_score: 82
        },
        timeline: Array.from({ length: 12 }, (_, i) => ({
          date: new Date(2024, i, 1).toISOString(),
          metrics: {
            average_sentiment: 75 + Math.random() * 15,
            average_position: 1.2 + Math.random() * 1.5,
            company_mentioned: 70 + Math.random() * 15,
            feature_score: 80 + Math.random() * 10
          }
        }))
      },
      {
        vertical: "Financial Services",
        metrics: {
          average_sentiment: 72,
          average_position: 2.1,
          company_mentioned: 68,
          feature_score: 74
        },
        timeline: Array.from({ length: 12 }, (_, i) => ({
          date: new Date(2024, i, 1).toISOString(),
          metrics: {
            average_sentiment: 65 + Math.random() * 15,
            average_position: 1.8 + Math.random() * 1.5,
            company_mentioned: 60 + Math.random() * 15,
            feature_score: 70 + Math.random() * 10
          }
        }))
      },
      {
        vertical: "Healthcare",
        metrics: {
          average_sentiment: 70,
          average_position: 2.3,
          company_mentioned: 65,
          feature_score: 72
        },
        timeline: Array.from({ length: 12 }, (_, i) => ({
          date: new Date(2024, i, 1).toISOString(),
          metrics: {
            average_sentiment: 65 + Math.random() * 15,
            average_position: 2.0 + Math.random() * 1.5,
            company_mentioned: 60 + Math.random() * 15,
            feature_score: 65 + Math.random() * 15
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
          feature_score: 73
        },
        timeline: Array.from({ length: 12 }, (_, i) => ({
          date: new Date(2024, i, 1).toISOString(),
          metrics: {
            average_sentiment: 65 + Math.random() * 15,
            average_position: 1.7 + Math.random() * 1.5,
            company_mentioned: 62 + Math.random() * 15,
            feature_score: 68 + Math.random() * 15
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
          feature_score: 76
        },
        timeline: Array.from({ length: 12 }, (_, i) => ({
          date: new Date(2024, i, 1).toISOString(),
          metrics: {
            average_sentiment: 68 + Math.random() * 15,
            average_position: 1.6 + Math.random() * 1.5,
            company_mentioned: 64 + Math.random() * 15,
            feature_score: 71 + Math.random() * 15
          }
        }))
      }
    ]
  },
  personas: {
    "Enterprise Software": [
      {
        persona: "DevOps Lead",
        metrics: {
          average_sentiment: 82,
          average_position: 1.3,
          company_mentioned: 78,
          feature_score: 85
        },
        timeline: Array.from({ length: 12 }, (_, i) => ({
          date: new Date(2024, i, 1).toISOString(),
          metrics: {
            average_sentiment: 75 + Math.random() * 15,
            average_position: 1.1 + Math.random() * 1.2,
            company_mentioned: 75 + Math.random() * 10,
            feature_score: 80 + Math.random() * 10
          }
        }))
      },
      {
        persona: "Database Architect",
        metrics: {
          average_sentiment: 76,
          average_position: 1.8,
          company_mentioned: 72,
          feature_score: 78
        },
        timeline: Array.from({ length: 12 }, (_, i) => ({
          date: new Date(2024, i, 1).toISOString(),
          metrics: {
            average_sentiment: 70 + Math.random() * 15,
            average_position: 1.5 + Math.random() * 1.2,
            company_mentioned: 65 + Math.random() * 15,
            feature_score: 75 + Math.random() * 10
          }
        }))
      }
    ],
    "Financial Services": [
      {
        persona: "Risk Manager",
        metrics: {
          average_sentiment: 74,
          average_position: 2.0,
          company_mentioned: 70,
          feature_score: 76
        },
        timeline: Array.from({ length: 12 }, (_, i) => ({
          date: new Date(2024, i, 1).toISOString(),
          metrics: {
            average_sentiment: 70 + Math.random() * 15,
            average_position: 1.8 + Math.random() * 1.2,
            company_mentioned: 65 + Math.random() * 15,
            feature_score: 70 + Math.random() * 15
          }
        }))
      }
    ],
    "Healthcare": [
      {
        persona: "Clinical Data Scientist",
        metrics: {
          average_sentiment: 72,
          average_position: 2.2,
          company_mentioned: 68,
          feature_score: 74
        },
        timeline: Array.from({ length: 12 }, (_, i) => ({
          date: new Date(2024, i, 1).toISOString(),
          metrics: {
            average_sentiment: 65 + Math.random() * 15,
            average_position: 1.9 + Math.random() * 1.2,
            company_mentioned: 60 + Math.random() * 15,
            feature_score: 70 + Math.random() * 15
          }
        }))
      }
    ]
  },
  queries: {
    "DevOps Lead": {
      problem_exploration: [
        {
          query: "Best practices for database schema automation",
          metrics: {
            average_sentiment: 85,
            average_position: 1.2,
            company_mentioned: 80,
            feature_score: 88
          },
          platform_rankings: {
            perplexity: 1,
            claude: 2,
            gemini: 1
          },
          timeline: Array.from({ length: 12 }, (_, i) => ({
            date: new Date(2024, i, 1).toISOString(),
            metrics: {
              average_sentiment: 80 + Math.random() * 10,
              average_position: 1.0 + Math.random() * 1,
              company_mentioned: 75 + Math.random() * 10,
              feature_score: 85 + Math.random() * 10
            }
          }))
        }
      ],
      solution_education: [
        {
          query: "Database schema version control solutions",
          metrics: {
            average_sentiment: 82,
            average_position: 1.4,
            company_mentioned: 78,
            feature_score: 85
          },
          platform_rankings: {
            perplexity: 2,
            claude: 1,
            gemini: 2
          },
          timeline: Array.from({ length: 12 }, (_, i) => ({
            date: new Date(2024, i, 1).toISOString(),
            metrics: {
              average_sentiment: 75 + Math.random() * 15,
              average_position: 1.2 + Math.random() * 1,
              company_mentioned: 70 + Math.random() * 15,
              feature_score: 80 + Math.random() * 10
            }
          }))
        }
      ],
      solution_comparison: [
        {
          query: "Compare top database schema management tools",
          metrics: {
            average_sentiment: 80,
            average_position: 1.5,
            company_mentioned: 75,
            feature_score: 82
          },
          platform_rankings: {
            perplexity: 1,
            claude: 2,
            gemini: 1
          },
          timeline: Array.from({ length: 12 }, (_, i) => ({
            date: new Date(2024, i, 1).toISOString(),
            metrics: {
              average_sentiment: 75 + Math.random() * 10,
              average_position: 1.3 + Math.random() * 1,
              company_mentioned: 70 + Math.random() * 10,
              feature_score: 75 + Math.random() * 15
            }
          }))
        }
      ],
      solution_evaluation: [
        {
          query: "Database schema automation tool features comparison",
          metrics: {
            average_sentiment: 78,
            average_position: 1.6,
            company_mentioned: 72,
            feature_score: 80
          },
          platform_rankings: {
            perplexity: 2,
            claude: 1,
            gemini: 2
          },
          timeline: Array.from({ length: 12 }, (_, i) => ({
            date: new Date(2024, i, 1).toISOString(),
            metrics: {
              average_sentiment: 70 + Math.random() * 15,
              average_position: 1.4 + Math.random() * 1,
              company_mentioned: 65 + Math.random() * 15,
              feature_score: 75 + Math.random() * 10
            }
          }))
        }
      ],
      final_research: [
        {
          query: "Database schema automation tool user reviews",
          metrics: {
            average_sentiment: 75,
            average_position: 1.8,
            company_mentioned: 70,
            feature_score: 78
          },
          platform_rankings: {
            perplexity: 1,
            claude: 2,
            gemini: 1
          },
          timeline: Array.from({ length: 12 }, (_, i) => ({
            date: new Date(2024, i, 1).toISOString(),
            metrics: {
              average_sentiment: 70 + Math.random() * 10,
              average_position: 1.5 + Math.random() * 1,
              company_mentioned: 65 + Math.random() * 10,
              feature_score: 70 + Math.random() * 15
            }
          }))
        }
      ]
    },
    "Database Architect": {
      problem_exploration: [
        {
          query: "Database scaling challenges in microservices",
          metrics: {
            average_sentiment: 78,
            average_position: 2.1,
            company_mentioned: 85,
            feature_score: 72
          },
          platform_rankings: {
            perplexity: 2,
            claude: 1,
            gemini: 3
          },
          buying_journey_stage: 'problem_exploration'
        },
        {
          query: "How to handle database performance bottlenecks",
          metrics: {
            average_sentiment: 82,
            average_position: 1.8,
            company_mentioned: 90,
            feature_score: 75
          },
          platform_rankings: {
            perplexity: 1,
            claude: 2,
            gemini: 2
          },
          buying_journey_stage: 'problem_exploration'
        }
      ],
      solution_education: [
        {
          query: "Best practices for database schema automation",
          metrics: {
            average_sentiment: 85,
            average_position: 1.5,
            company_mentioned: 95,
            feature_score: 82
          },
          platform_rankings: {
            perplexity: 1,
            claude: 1,
            gemini: 2
          },
          buying_journey_stage: 'solution_education'
        },
        {
          query: "Database version control solutions comparison",
          metrics: {
            average_sentiment: 75,
            average_position: 2.3,
            company_mentioned: 80,
            feature_score: 68
          },
          platform_rankings: {
            perplexity: 3,
            claude: 1,
            gemini: 2
          },
          buying_journey_stage: 'solution_education'
        }
      ],
      solution_comparison: [
        {
          query: "Compare database schema automation tools",
          metrics: {
            average_sentiment: 88,
            average_position: 1.2,
            company_mentioned: 100,
            feature_score: 85
          },
          platform_rankings: {
            perplexity: 1,
            claude: 1,
            gemini: 1
          },
          buying_journey_stage: 'solution_comparison'
        },
        {
          query: "Database migration tools pros and cons",
          metrics: {
            average_sentiment: 80,
            average_position: 1.9,
            company_mentioned: 85,
            feature_score: 78
          },
          platform_rankings: {
            perplexity: 2,
            claude: 1,
            gemini: 3
          },
          buying_journey_stage: 'solution_comparison'
        }
      ],
      solution_evaluation: [
        {
          query: "Database schema automation ROI analysis",
          metrics: {
            average_sentiment: 92,
            average_position: 1.1,
            company_mentioned: 100,
            feature_score: 90
          },
          platform_rankings: {
            perplexity: 1,
            claude: 1,
            gemini: 1
          },
          buying_journey_stage: 'solution_evaluation'
        },
        {
          query: "Enterprise database automation case studies",
          metrics: {
            average_sentiment: 86,
            average_position: 1.7,
            company_mentioned: 90,
            feature_score: 82
          },
          platform_rankings: {
            perplexity: 2,
            claude: 1,
            gemini: 2
          },
          buying_journey_stage: 'solution_evaluation'
        }
      ],
      final_research: [
        {
          query: "Database schema automation implementation guide",
          metrics: {
            average_sentiment: 90,
            average_position: 1.3,
            company_mentioned: 95,
            feature_score: 88
          },
          platform_rankings: {
            perplexity: 1,
            claude: 1,
            gemini: 2
          },
          buying_journey_stage: 'final_research'
        },
        {
          query: "Database automation security best practices",
          metrics: {
            average_sentiment: 85,
            average_position: 1.8,
            company_mentioned: 90,
            feature_score: 80
          },
          platform_rankings: {
            perplexity: 2,
            claude: 1,
            gemini: 2
          },
          buying_journey_stage: 'final_research'
        }
      ]
    }
  }
} as const; 