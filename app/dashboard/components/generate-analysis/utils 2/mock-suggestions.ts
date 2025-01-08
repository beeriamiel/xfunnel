import { ICP, Persona, Competitor, Query } from '../types/analysis'

const MOCK_DELAY = 1500

export async function mockDelay() {
  return new Promise(resolve => setTimeout(resolve, MOCK_DELAY))
}

export async function generateCompetitorSuggestions(
  companyName: string,
  products: string[]
): Promise<Competitor[]> {
  await mockDelay()
  
  // Default competitors based on the first product
  const productName = products[0] || 'Product'
  
  return [
    {
      id: Math.random().toString(),
      name: `${productName} Pro`
    },
    {
      id: Math.random().toString(),
      name: `${productName} Enterprise`
    },
    {
      id: Math.random().toString(),
      name: `${productName} Solutions`
    }
  ]
}

export async function generateICPSuggestions(
  industry: string,
  products: string[]
): Promise<ICP[]> {
  await mockDelay()

  // Default suggestions based on common patterns
  const suggestions = [
    {
      id: '1',
      region: 'North America',
      vertical: 'Enterprise SaaS',
      company_size: '1000+',
      personas: []
    },
    {
      id: '2',
      region: 'Europe',
      vertical: 'Mid-Market Tech',
      company_size: '100-1000',
      personas: []
    },
    {
      id: '3',
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
    id: `${index + 1}`,
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

  const queries = [
    {
      id: crypto.randomUUID(),
      text: `What are the main challenges that ${persona.title}s face when implementing solutions in ${icp.vertical}?`,
      icp,
      persona,
      status: 'pending' as const
    },
    {
      id: crypto.randomUUID(),
      text: `How does the buying process typically work for ${icp.company_size} companies in ${icp.region}?`,
      icp,
      persona,
      status: 'pending' as const
    },
    {
      id: crypto.randomUUID(),
      text: `What are the key factors that ${persona.title}s in ${persona.department} consider when evaluating solutions?`,
      icp,
      persona,
      status: 'pending' as const
    },
    {
      id: crypto.randomUUID(),
      text: `How do ${persona.seniority_level} ${persona.title}s typically handle vendor selection?`,
      icp,
      persona,
      status: 'pending' as const
    },
    {
      id: crypto.randomUUID(),
      text: `What are common objections from ${persona.title}s in ${icp.vertical} during the sales process?`,
      icp,
      persona,
      status: 'pending' as const
    }
  ]

  return queries
} 