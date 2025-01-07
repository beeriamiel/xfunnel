import { ICP, Persona, Competitor } from '../types/analysis'

const MOCK_DELAY = 1500

export async function mockDelay() {
  return new Promise(resolve => setTimeout(resolve, MOCK_DELAY))
}

export async function generateCompetitorSuggestions(
  companyName: string,
  products: string[]
): Promise<Competitor[]> {
  await mockDelay()
  
  // Mock competitors based on products
  const competitors = products.flatMap((product) => [
    {
      id: Math.random().toString(),
      name: `${product} Alternative Inc`,
      website: `www.${product.toLowerCase().replace(/\s+/g, '')}-alt.com`,
      description: `Leading provider of ${product} solutions`,
    },
    {
      id: Math.random().toString(),
      name: `${product} Pro Solutions`,
      website: `www.${product.toLowerCase().replace(/\s+/g, '')}pro.com`,
      description: `Enterprise ${product} platform`,
    }
  ])

  return competitors
}

export async function generateICPSuggestions(
  industry: string,
  products: string[]
): Promise<ICP[]> {
  await mockDelay()

  // Default suggestions based on common patterns
  const suggestions = [
    {
      id: Math.random().toString(),
      region: 'North America',
      vertical: 'Enterprise SaaS',
      company_size: '1000+',
      personas: []
    },
    {
      id: Math.random().toString(),
      region: 'Europe',
      vertical: 'Mid-Market Tech',
      company_size: '100-1000',
      personas: []
    },
    {
      id: Math.random().toString(),
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
  
  return roles.map(([title, department]) => ({
    id: Math.random().toString(),
    title,
    seniority_level: 'Senior',
    department
  }))
} 