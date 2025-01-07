import { create } from 'zustand'
import type { Company } from './components/generate-analysis/types/company'

export type DashboardView = 'engine' | 'journey' | 'citation' | 'takeaways' | 'response' | 'personal' | 'faqs'

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
  hasCompletedOnboarding: boolean
  setHasCompletedOnboarding: (value: boolean) => void
  companyProfile: CompanyProfile | null
  setCompanyProfile: (profile: CompanyProfile | null) => void
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  activeView: 'engine',
  setActiveView: (view) => set({ activeView: view }),
  selectedCompanyId: null,
  setSelectedCompanyId: (id) => set({ selectedCompanyId: id }),
  hasCompletedOnboarding: false,
  setHasCompletedOnboarding: (value) => set({ hasCompletedOnboarding: value }),
  companyProfile: null,
  setCompanyProfile: (profile) => set({ companyProfile: profile })
})) 