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

  const industries = [
    'SaaS',
    'E-commerce',
    'Healthcare',
    'Financial Services',
    'Manufacturing'
  ]

  return industries.map((ind) => ({
    id: Math.random().toString(),
    industry: ind,
    size: '100-1000',
    location: 'Global',
    challenges: [
      'Digital Transformation',
      'Cost Optimization',
      'Market Expansion'
    ],
    personas: []
  }))
}

export async function generatePersonaSuggestions(
  icp: ICP
): Promise<Persona[]> {
  await mockDelay()

  const roleMap: Record<string, string[]> = {
    'SaaS': ['Product Manager', 'CTO', 'Engineering Manager'],
    'E-commerce': ['Marketing Director', 'E-commerce Manager', 'Digital Strategist'],
    'Healthcare': ['Medical Director', 'Healthcare Administrator', 'Clinical Manager'],
    'Financial Services': ['Financial Advisor', 'Risk Manager', 'Investment Analyst'],
    'Manufacturing': ['Operations Manager', 'Plant Manager', 'Quality Control Manager']
  }

  const roles = roleMap[icp.industry] || ['Decision Maker', 'Manager', 'Director']
  
  return roles.map((role) => ({
    id: Math.random().toString(),
    role,
    seniority: 'Senior',
    goals: [
      'Improve Efficiency',
      'Reduce Costs',
      'Drive Innovation'
    ],
    painPoints: [
      'Limited Resources',
      'Complex Workflows',
      'Integration Challenges'
    ]
  }))
} 