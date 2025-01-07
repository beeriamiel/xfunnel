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

  const verticals = [
    'SaaS',
    'E-commerce',
    'Healthcare',
    'Financial Services',
    'Manufacturing'
  ]

  return verticals.map((vertical) => ({
    id: Math.random().toString(),
    region: 'North America',
    vertical,
    company_size: '100-1000',
    personas: []
  }))
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