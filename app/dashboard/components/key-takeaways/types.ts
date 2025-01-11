// In House Types
export interface ContentOptimization {
  id: string
  title: string
  description: string
  impact: 'low' | 'medium' | 'high'
  estimatedEffort: string
  potentialImpact: string
  timestamp: string
  sourceUrl?: string
  actionItems: string[]
  metrics?: {
    name: string
    value: string
    potential: string
  }[]
}

export interface TechnicalContent {
  id: string
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  date: string
  details: string
  affectedAreas: string[]
}

export interface NewContent {
  id: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  actionItems: string[]
  metrics?: {
    name: string
    value: string
    potential: string
  }[]
}

export interface LLMOptimization {
  id: string
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  actionItems: string[]
  metrics?: {
    name: string
    value: string
    potential: string
  }[]
}

// Outside Types
export interface AffiliateContent {
  id: string
  title: string
  description: string
  type: 'optimization' | 'platform'
  priority: 'low' | 'medium' | 'high'
  sourceUrl?: string
  actionItems: string[]
  metrics?: {
    name: string
    value: string
    potential: string
  }[]
}

export interface UGCContent {
  id: string
  title: string
  description: string
  type: 'resolution' | 'topic'
  priority: 'low' | 'medium' | 'high'
  actionItems: string[]
  metrics?: {
    name: string
    value: string
    potential: string
  }[]
}

export interface KeyTakeawaysData {
  inHouse: {
    contentOptimization: ContentOptimization[]
    technicalContent: TechnicalContent[]
    newContent: NewContent[]
    llmOptimization: LLMOptimization[]
  }
  outside: {
    affiliateContent: AffiliateContent[]
    ugcContent: UGCContent[]
  }
}

// Placeholder data - will be replaced with real data later
export const MOCK_DATA: KeyTakeawaysData = {
  inHouse: {
    contentOptimization: [
      {
        id: '1',
        title: 'International Payment Gateways Content Enhancement',
        description: 'Critical content improvements needed for payment gateway comparison page',
        impact: 'high',
        estimatedEffort: '3-4 hours',
        potentialImpact: '85% content quality improvement',
        timestamp: new Date().toISOString(),
        sourceUrl: 'https://gocardless.com/en-us/guides/posts/top-international-payment-gateways/',
        actionItems: [
          'Add comprehensive payment processing statistics',
          'Include payment expert testimonials',
          'Integrate payment industry research',
          'Enhance technical accuracy of payment terms',
          'Build authority through payment expert validation'
        ],
        metrics: [
          {
            name: 'Content Quality',
            value: '10%',
            potential: '75%+'
          },
          {
            name: 'Authority',
            value: '0%',
            potential: '70%+'
          },
          {
            name: 'Technical Terms',
            value: '20%',
            potential: '80%+'
          }
        ]
      }
    ],
    technicalContent: [
      {
        id: '1',
        title: 'Payment-Specific LLMs.txt Implementation',
        description: 'Enhanced LLMs.txt with payment processing terminology and integration patterns',
        impact: 'high',
        date: new Date().toISOString(),
        details: `Our implementation optimizes payment processing documentation for AI understanding. The enhancement uses actual interaction patterns to improve content structure for payment-related queries.

Key improvements:
• Payment-Specific Navigation: Structure based on common payment integration patterns
• Enhanced Context Windows: Optimized content chunks for payment processing flows
• Smart Content Prioritization: Using real interaction data for payment documentation
• Automated Updates: Content structure evolves based on payment query patterns

Current metrics show:
• 45% improvement in payment content understanding
• 30% faster response generation for integration queries
• 60% more accurate payment context retention
• 25% reduction in technical clarification requests

Reference: https://docs.google.com/document/d/1vRsrWUEIvqB8DBzq7pPHC0swBZ7Pa6pFp_3FYW07V48/edit?usp=drive_link`,
        affectedAreas: [
          'Payment Documentation',
          'Integration Guides',
          'Content Organization',
          'Response Generation',
          'Context Management'
        ]
      }
    ],
    newContent: [
      {
        id: '1',
        title: 'Head of Payments Journey & Resources',
        description: 'Critical content development for payment decision-maker journey',
        priority: 'high',
        actionItems: [
          'Create payment gateway comparison framework',
          'Develop payment processing transformation content',
          'Build payment solution validation system',
          'Create comprehensive decision-maker journey',
          'Develop payment competitive intelligence framework'
        ],
        metrics: [
          {
            name: 'Journey Coverage',
            value: '15%',
            potential: '90%'
          },
          {
            name: 'Decision Support',
            value: '25%',
            potential: '85%'
          }
        ]
      }
    ],
    llmOptimization: [
      {
        id: '1',
        title: 'Payment Gateway Query Matrix',
        description: 'Strategic implementation plan for payment processing queries across buyer journey stages. Based on: https://docs.google.com/document/d/16xT59UmYfEL8b_oP1pq5nTZlaGkFLsYq0YgcK30BLKQ/edit?usp=drive_link',
        impact: 'high',
        actionItems: [
          'Month 1: Implement Payment Problem Exploration & Solution Education',
          'Month 2: Develop Gateway Comparison & Evaluation content',
          'Month 3: Create Integration Research content & refine implementation',
          'Create AI-optimized payment processing templates',
          'Implement semantic markup for payment terminology',
          'Set up tracking for payment query coverage'
        ],
        metrics: [
          {
            name: 'Query Coverage',
            value: '147 gaps',
            potential: '85% improvement'
          },
          {
            name: 'Journey Stages',
            value: '5 stages',
            potential: '100% coverage'
          }
        ]
      }
    ]
  },
  outside: {
    affiliateContent: [
      {
        id: '1',
        title: 'Payments Software Evolution Content',
        description: 'Major improvement opportunities identified through Stripe\'s platform evolution and market trends',
        sourceUrl: 'https://www.linkedin.com/posts/sytaylor_payments-are-becoming-software-stripe-goes-activity-7250475337493491712-g9FV/',
        type: 'optimization',
        priority: 'high',
        actionItems: [
          'Analyze software-driven payment trends',
          'Compare platform capabilities with competitors',
          'Highlight Checkout.com\'s software advantages',
          'Document payment infrastructure evolution',
          'Create payment modernization roadmap content'
        ],
        metrics: [
          {
            name: 'Technical Depth',
            value: '30%',
            potential: '80%+'
          },
          {
            name: 'Market Analysis',
            value: '20%',
            potential: '75%+'
          },
          {
            name: 'Competitive Intel',
            value: '70%',
            potential: '85%+'
          }
        ]
      }
    ],
    ugcContent: [
      {
        id: '1',
        title: 'Payment Community Engagement Strategy',
        description: 'Develop comprehensive strategy for engaging with payment community discussions and trends',
        type: 'topic',
        priority: 'high',
        actionItems: [
          'Monitor key LinkedIn discussions and trends',
          'Create engagement templates for payment topics',
          'Develop response framework for technical questions',
          'Build thought leadership content calendar',
          'Establish community expert relationships'
        ],
        metrics: [
          {
            name: 'Engagement Rate',
            value: '25%',
            potential: '75%'
          },
          {
            name: 'Response Time',
            value: '24h',
            potential: '4h'
          }
        ]
      }
    ]
  }
} 