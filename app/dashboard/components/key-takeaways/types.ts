export interface LowHangingFruit {
  id: string
  title: string
  description: string
  impact: 'low' | 'medium' | 'high'
  estimatedEffort: string
  potentialImpact: string
  timestamp: string
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
  impact: 'positive' | 'negative' | 'neutral'
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
      title: 'Add Statistics to HR Software Blog',
      description: 'Enhance credibility of hibob.com blog post with relevant statistics and quotations',
      impact: 'high',
      estimatedEffort: '2 hours',
      potentialImpact: '30% engagement increase',
      timestamp: new Date().toISOString(),
      actionItems: [
        'Add industry statistics about HR software adoption',
        'Include customer success metrics',
        'Insert expert quotations',
        'Add comparison data'
      ],
      metrics: [
        {
          name: 'Current Engagement',
          value: '2.5 min avg.',
          potential: '4 min avg.'
        },
        {
          name: 'Conversion Rate',
          value: '2.1%',
          potential: '3.5%'
        }
      ]
    },
    {
      id: '2',
      title: 'Optimize Meta Descriptions',
      description: 'Add missing meta descriptions to key landing pages',
      impact: 'medium',
      estimatedEffort: '1 hour',
      potentialImpact: '15% SEO improvement',
      timestamp: new Date().toISOString(),
      actionItems: [
        'Write compelling meta descriptions',
        'Include target keywords',
        'Keep within 155 characters',
        'Focus on value proposition'
      ],
      metrics: [
        {
          name: 'CTR',
          value: '1.8%',
          potential: '2.5%'
        }
      ]
    }
  ] as LowHangingFruit[],
  
  technicalChanges: [
    {
      id: '1',
      title: 'LLM Model Update',
      description: 'Updated to latest version with improved context handling',
      impact: 'positive',
      date: new Date().toISOString(),
      details: 'The new model version shows 20% better context retention',
      affectedAreas: ['Query Processing', 'Response Generation']
    }
  ] as TechnicalChange[],
  
  contentSuggestions: [
    {
      id: '1',
      title: 'Query-Answer Matrix Attention Required',
      description: 'Multiple queries identified requiring immediate attention and optimization',
      priority: 'high',
      category: 'query-answer-matrix',
      actionItems: [
        'Review and optimize 150+ identified queries',
        'Update response templates for common queries',
        'Implement automated query tracking system'
      ],
      metrics: [
        {
          name: 'Queries Needing Review',
          value: '150+',
          potential: '30% improvement in response accuracy'
        },
        {
          name: 'Response Time',
          value: '2.5s',
          potential: 'Potential 40% reduction'
        }
      ]
    },
    {
      id: '2',
      title: 'Buying Journey Gap Analysis',
      description: 'Critical gaps identified in the consideration phase of buying journey',
      priority: 'high',
      category: 'buying-journey',
      actionItems: [
        'Enhance product comparison content',
        'Develop targeted decision-making tools',
        'Create detailed use-case scenarios'
      ],
      metrics: [
        {
          name: 'Conversion Drop',
          value: '25%',
          potential: '35% potential increase in conversion'
        },
        {
          name: 'User Engagement',
          value: 'Low',
          potential: '45% potential improvement'
        }
      ]
    },
    {
      id: '3',
      title: 'Competitor Strategy Implementation',
      description: 'Analysis of successful competitor content strategies ready for implementation',
      priority: 'medium',
      category: 'competitor-analysis',
      actionItems: [
        'Implement video tutorials based on competitor success',
        'Enhance technical documentation structure',
        'Add interactive product demos'
      ],
      metrics: [
        {
          name: 'Content Gap',
          value: '3 key areas',
          potential: '40% engagement increase potential'
        },
        {
          name: 'Market Share',
          value: '15%',
          potential: '10% potential growth'
        }
      ]
    }
  ] as ContentSuggestion[]
} 