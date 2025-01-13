import { create } from 'zustand'
import type { Company } from './components/generate-analysis/types/company'

export type DashboardView = 'engine' | 'citation' | 'takeaways' | 'response' | 'personal' | 'faqs' | 'icp' | 'journey' | 'new-journey'
export type TimePeriod = 'weekly' | 'monthly'

interface ICP {
  id: number
  vertical: string
  company_size: string
  region: string
  personas: Persona[]
}

interface Persona {
  id: number
  title: string
  seniority_level: string
  department: string
}

interface Product {
  id: string
  name: string
  description?: string
}

interface Competitor {
  id: string
  name: string
  description?: string
}

interface CompanyProfile {
  icps: ICP[]
  personas: Persona[]
  products: Product[]
  competitors: Competitor[]
}

interface DashboardStore {
  activeView: DashboardView
  setActiveView: (view: DashboardView) => void
  selectedCompanyId: number | null
  setSelectedCompanyId: (id: number | null) => void
  companyProfile: CompanyProfile | null
  setCompanyProfile: (profile: CompanyProfile | null) => void
  timePeriod: TimePeriod
  setTimePeriod: (period: TimePeriod) => void
  isDevMode: boolean
  setIsDevMode: (isDevMode: boolean) => void
  resetCompanyProfile: () => void
  companies: Company[]
  setCompanies: (companies: Company[]) => void
  addCompany: (company: Company) => void
  hasCompanies: boolean
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  activeView: 'engine',
  setActiveView: (view) => set({ activeView: view }),
  selectedCompanyId: null,
  setSelectedCompanyId: (id) => set({ selectedCompanyId: id }),
  companyProfile: null,
  setCompanyProfile: (profile) => set({ companyProfile: profile }),
  timePeriod: 'weekly',
  setTimePeriod: (period) => set({ timePeriod: period }),
  isDevMode: false,
  setIsDevMode: (isDevMode) => set({ isDevMode }),
  resetCompanyProfile: () => set({ companyProfile: null }),
  companies: [],
  setCompanies: (companies) => set({ companies }),
  addCompany: (company) => set((state) => ({
    companies: [...state.companies, company]
  })),
  hasCompanies: false
})) 