import { create } from 'zustand'

interface ICP {
  id: string
  vertical: string
  company_size: string
  region: string
  personas: Persona[]
}

interface Persona {
  id: string
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
  activeView: 'engine' | 'journey' | 'new-journey' | 'citation' | 'takeaways' | 'response' | 'personal' | 'faqs'
  setActiveView: (view: 'engine' | 'journey' | 'new-journey' | 'citation' | 'takeaways' | 'response' | 'personal' | 'faqs') => void
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