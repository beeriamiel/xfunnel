export interface LowHangingFruit {
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

export interface TechnicalChange {
  id: string
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  date: string
  details: string
  affectedAreas: string[]
}

export interface ContentSuggestion {
  id: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  category: 'query-answer-matrix' | 'buying-journey' | 'competitor-analysis'
  actionItems: string[]
  metrics?: {
    name: string
    value: string
    potential: string
  }[]
}

// Placeholder data - will be replaced with real data later
export const MOCK_DATA = {
  lowHangingFruits: [
    {
      id: '1',
      title: 'Add AI Favorite Metrics - HiBob Blog',
      description: 'Major improvement opportunities identified through citations, quotations, and statistics',
      sourceUrl: 'https://www.hibob.com/blog/hr-software-small-businesses/',
      impact: 'medium',
      estimatedEffort: '4-6 hours',
      potentialImpact: '132% visibility improvement',
      timestamp: new Date().toISOString(),
      actionItems: [
        'Increase citations from 9 to 20-25 high-authority sources',
        'Add 8-10 expert quotations throughout the content',
        'Expand statistics from 8 to 15-20 relevant data points',
        'Improve statistical context integration',
        'Enhance citation variety and quality'
      ],
      metrics: [
        {
          name: 'Citations',
          value: '30%',
          potential: '80%+'
        },
        {
          name: 'Quotations',
          value: '20%',
          potential: '75%+'
        },
        {
          name: 'Statistics',
          value: '70%',
          potential: '85%+'
        },
        {
          name: 'Position Score',
          value: 'Base',
          potential: '+41%'
        }
      ]
    },
    {
      id: '3',
      title: 'Optimize Affiliate Content - Outsail Review',
      description: 'Critical content improvements needed for affiliate review page with extremely low content quality scores',
      sourceUrl: 'https://www.outsail.co/post/hibob-reviews-pricing-pros-cons-user-reviews',
      impact: 'medium',
      estimatedEffort: '3-4 hours',
      potentialImpact: '85% content quality improvement',
      timestamp: new Date().toISOString(),
      actionItems: [
        'Add comprehensive product statistics and comparisons',
        'Include expert quotes and testimonials',
        'Integrate industry research citations',
        'Enhance technical accuracy and terminology',
        'Build authority through expert validation',
        'Optimize for AI readability while maintaining affiliate effectiveness'
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
        },
        {
          name: 'Citations',
          value: '0%',
          potential: '60%+'
        }
      ]
    }
  ] as LowHangingFruit[],
  
  technicalChanges: [
    {
      id: '1',
      title: 'Enhanced LLMs.txt Implementation',
      description: 'Implemented and enhanced LLMs.txt with unique AI preference data integration',
      impact: 'high',
      date: new Date().toISOString(),
      details: `Our implementation goes beyond the standard LLMs.txt format by incorporating real AI interaction data. While the standard helps AI systems understand documentation, our enhancement uses actual interaction patterns to optimize content structure and presentation.

Key improvements:
• AI-Optimized Navigation: Structure based on successful interaction patterns
• Enhanced Context Windows: Optimized content chunks based on AI processing patterns
• Smart Content Prioritization: Using real interaction data to highlight key information
• Automated Updates: Content structure evolves based on ongoing AI interactions

Current metrics show:
• 45% improvement in AI content understanding
• 30% faster response generation
• 60% more accurate context retention
• 25% reduction in clarification requests`,
      affectedAreas: [
        'Documentation Structure',
        'AI Interaction Layer',
        'Content Organization',
        'Response Generation',
        'Context Management'
      ]
    }
  ] as TechnicalChange[],
  
  contentSuggestions: [
    {
      id: '1',
      title: 'Query Gap Analysis & Content Strategy',
      description: 'Strategic implementation plan for 147 identified query gaps across buyer journey stages, based on analysis of thousands of region and persona-specific queries',
      priority: 'high',
      category: 'query-answer-matrix',
      actionItems: [
        'Month 1: Implement Problem Exploration (35) & Solution Education (40) content',
        'Month 2: Develop Solution Comparison (30) & Evaluation (25) content',
        'Month 3: Create User Research (17) content & refine implementation',
        'Create AI-optimized answer templates for each journey stage',
        'Implement semantic markup for enhanced AI understanding',
        'Set up tracking for query coverage and response accuracy'
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
        },
        {
          name: 'Implementation',
          value: '0%',
          potential: '3 months'
        },
        {
          name: 'Response Accuracy',
          value: 'Limited',
          potential: '90%+ accuracy'
        }
      ]
    },
    {
      id: '2',
      title: 'HR Manager Journey Gaps & AI Review Sources',
      description: 'Critical gaps identified in HR Manager buying journey, with focus on AI review sources and competitive education',
      priority: 'high',
      category: 'buying-journey',
      actionItems: [
        'Problem Exploration: Create indirect competitor comparison framework',
        'Solution Education: Develop HR process transformation content',
        'User Feedback: Optimize content for Perplexity, Claude, and GPT review sources',
        'Implement review authenticity validation system',
        'Build comprehensive HR Manager educational journey',
        'Create competitive intelligence framework'
      ],
      metrics: [
        {
          name: 'Problem Stage',
          value: '40% coverage',
          potential: '90% journey completion'
        },
        {
          name: 'Solution Stage',
          value: 'Critical gaps',
          potential: '85% content coverage'
        },
        {
          name: 'AI Reviews',
          value: '3 platforms',
          potential: '100% source optimization'
        },
        {
          name: 'Journey Completion',
          value: '35% complete',
          potential: '95% completion rate'
        }
      ]
    },
    {
      id: '3',
      title: 'AI-Driven Content Strategy Blueprint',
      description: 'Strategic content creation plan based on analysis of millions of AI content preference data points, delivering two best-in-class articles monthly',
      priority: 'high',
      category: 'competitor-analysis',
      actionItems: [
        'Analyze millions of AI interaction patterns and preferences',
        'Identify top-performing content structures and formats',
        'Create content templates based on successful AI citations',
        'Implement bi-monthly premium content creation schedule',
        'Monitor and analyze AI response patterns',
        'Continuously refine content strategy based on AI preferences'
      ],
      metrics: [
        {
          name: 'AI Data Points',
          value: '2M+ analyzed',
          potential: '100% coverage'
        },
        {
          name: 'Content Output',
          value: '0 articles',
          potential: '24 annually'
        },
        {
          name: 'AI Citation Rate',
          value: 'Baseline',
          potential: '300% increase'
        },
        {
          name: 'Content Quality',
          value: 'Current',
          potential: '95% AI preference match'
        }
      ]
    }
  ] as ContentSuggestion[]
} 