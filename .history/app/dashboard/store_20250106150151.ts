import { create } from 'zustand'
import type { Company } from './components/generate-analysis/types/company'

export type DashboardView = 'engine' | 'journey' | 'citation' | 'takeaways' | 'response' | 'personal' | 'faqs'

interface DashboardStore {
  // View State
  activeView: DashboardView
  setActiveView: (view: DashboardView) => void
  
  // Company State
  company: {
    data: Company | null
    isLoading: boolean
    error: string | null
  }
  setCompany: (company: Company | null) => void
  setCompanyLoading: (isLoading: boolean) => void
  setCompanyError: (error: string | null) => void
  
  // Existing state
  hasCompletedOnboarding: boolean
  setHasCompletedOnboarding: (value: boolean) => void
  companyProfile: any // Keep existing type
  setCompanyProfile: (profile: any) => void
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  // View State
  activeView: 'engine',
  setActiveView: (view) => set({ activeView: view }),
  
  // Company State
  company: {
    data: null,
    isLoading: false,
    error: null
  },
  setCompany: (company) => set((state) => ({ 
    company: { ...state.company, data: company, error: null } 
  })),
  setCompanyLoading: (isLoading) => set((state) => ({ 
    company: { ...state.company, isLoading } 
  })),
  setCompanyError: (error) => set((state) => ({ 
    company: { ...state.company, error, isLoading: false } 
  })),
  
  // Existing state
  hasCompletedOnboarding: false,
  setHasCompletedOnboarding: (value) => set({ hasCompletedOnboarding: value }),
  companyProfile: null,
  setCompanyProfile: (profile) => set({ companyProfile: profile })
})) 