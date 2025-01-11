import { ICP, Persona, Competitor, Query } from '../types/analysis'

const MOCK_DELAY = 1500

export async function mockDelay() {
  return new Promise(resolve => setTimeout(resolve, MOCK_DELAY))
}

export async function generateCompetitorSuggestions(
  companyName: string
): Promise<Competitor[]> {
  await mockDelay()
  
  // Generate competitors based on company name
  return [
    {
      id: Math.random().toString(),
      name: `${companyName} Alternative`
    },
    {
      id: Math.random().toString(),
      name: `${companyName} Competitor`
    },
    {
      id: Math.random().toString(),
      name: `${companyName} Rival`
    }
  ]
}

export async function generateICPSuggestions(): Promise<ICP[]> {
  await mockDelay()

  // Default suggestions based on common patterns
  const suggestions: ICP[] = [
    {
      id: 1,
      region: 'North America',
      vertical: 'Enterprise SaaS',
      company_size: '1000+',
      personas: []
    },
    {
      id: 2,
      region: 'Europe',
      vertical: 'Mid-Market Tech',
      company_size: '100-1000',
      personas: []
    },
    {
      id: 3,
      region: 'Global',
      vertical: 'Small Business',
      company_size: '1-100',
      personas: []
    }
  ]

  return suggestions
}

export async function generatePersonaSuggestions(
  icp: ICP
): Promise<Persona[]> {
  await mockDelay()

  const roleMap: Record<string, Array<[string, string]>> = {
    'SaaS': [
      ['Product Manager', 'Product'],
      ['CTO', 'Engineering'],
      ['Engineering Manager', 'Engineering']
    ],
    'E-commerce': [
      ['Marketing Director', 'Marketing'],
      ['E-commerce Manager', 'Operations'],
      ['Digital Strategist', 'Marketing']
    ],
    'Healthcare': [
      ['Medical Director', 'Clinical'],
      ['Healthcare Administrator', 'Operations'],
      ['Clinical Manager', 'Clinical']
    ],
    'Financial Services': [
      ['Financial Advisor', 'Finance'],
      ['Risk Manager', 'Operations'],
      ['Investment Analyst', 'Finance']
    ],
    'Manufacturing': [
      ['Operations Manager', 'Operations'],
      ['Plant Manager', 'Operations'],
      ['Quality Control Manager', 'Quality']
    ]
  }

  const roles = roleMap[icp.vertical] || [
    ['Decision Maker', 'Management'],
    ['Manager', 'Operations'],
    ['Director', 'Executive']
  ]
  
  return roles.map(([title, department], index) => ({
    id: index + 1,
    title,
    seniority_level: 'Senior',
    department
  }))
}

export async function generateMockQueries(
  icp: ICP,
  persona: Persona
): Promise<Query[]> {
  await mockDelay()

  const queries: Query[] = [
    {
      id: 1,
      query_text: `What are the main challenges that ${persona.title}s face when implementing solutions in ${icp.vertical}?`,
      buyer_journey_phase: ['problem_exploration'],
      created_at: new Date().toISOString(),
      prompt_id: null,
      persona_id: persona.id,
      company_id: null,
      user_id: null,
      query_batch_id: null,
      created_by_batch: null
    },
    {
      id: 2,
      query_text: `How does the buying process typically work for ${icp.company_size} companies in ${icp.region}?`,
      buyer_journey_phase: ['solution_education'],
      created_at: new Date().toISOString(),
      prompt_id: null,
      persona_id: persona.id,
      company_id: null,
      user_id: null,
      query_batch_id: null,
      created_by_batch: null
    },
    {
      id: 3,
      query_text: `What are the key factors that ${persona.title}s in ${persona.department} consider when evaluating solutions?`,
      buyer_journey_phase: ['solution_evaluation'],
      created_at: new Date().toISOString(),
      prompt_id: null,
      persona_id: persona.id,
      company_id: null,
      user_id: null,
      query_batch_id: null,
      created_by_batch: null
    }
  ]

  return queries
} 