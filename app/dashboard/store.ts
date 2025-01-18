import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Company } from './generate-analysis/types/company'
import { type Step } from './generate-analysis/types/setup'

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

export interface CompanyProfile {
  id: number
  name: string
  industry: string | null
  main_products: string[] | null
  product_category: string | null
  markets_operating_in: string[] | null
  annual_revenue: string | null
  number_of_employees: number | null
  account_id: string | null
  created_at: string | null
  ideal_customer_profiles: ICP[]
  icps: ICP[]
  personas: Persona[]
  products: Product[]
  competitors: Competitor[]
}

interface OnboardingState {
  hasProducts: boolean;
  hasCompetitors: boolean;
  hasICPs: boolean;
  hasPersonas: boolean;
}

interface DashboardStore {
  activeView: DashboardView
  setActiveView: (view: DashboardView) => void
  selectedCompanyId: number | null
  setSelectedCompanyId: (id: number) => void
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
  setHasCompanies: (hasCompanies: boolean) => void
  onboardingState: {
    hasProducts: boolean
    hasCompetitors: boolean
    hasICPs: boolean
    hasPersonas: boolean
  }
  setOnboardingState: (state: OnboardingState) => void
  currentOnboardingStep: Step | null
  setCurrentOnboardingStep: (step: Step | null) => void
  currentStep: Step | null
  setCurrentStep: (step: Step | null) => void
  isOnboarding: boolean
  currentWizardStep: Step
  completedSteps: Step[]
  setWizardStep: (step: Step) => void
  completeStep: (step: Step, nextStep: Step) => void
  startOnboarding: () => void
  completeOnboarding: () => void
}

export const useDashboardStore = create(
  persist<DashboardStore>(
    (set) => ({
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
      setCompanies: (companies) => set({ 
        companies,
        hasCompanies: companies.length > 0 
      }),
      addCompany: (company) => set((state) => ({ 
        companies: [...state.companies, company],
        hasCompanies: true
      })),
      hasCompanies: false,
      setHasCompanies: (hasCompanies) => set({ hasCompanies }),
      onboardingState: {
        hasProducts: false,
        hasCompetitors: false,
        hasICPs: false,
        hasPersonas: false
      },
      setOnboardingState: (state) => set({ onboardingState: state }),
      currentOnboardingStep: null,
      setCurrentOnboardingStep: (step) => set({ currentOnboardingStep: step }),
      currentStep: null,
      setCurrentStep: (step) => set({ currentStep: step }),
      isOnboarding: false,
      currentWizardStep: 'initial',
      completedSteps: [],
      setWizardStep: (step) => set({ currentWizardStep: step }),
      completeStep: (step, nextStep) => set((state) => ({ 
        completedSteps: [...state.completedSteps, step],
        currentWizardStep: nextStep
      })),
      startOnboarding: () => set({ 
        isOnboarding: true, 
        currentWizardStep: 'initial',
        completedSteps: []
      }),
      completeOnboarding: () => set({ isOnboarding: false })
    }),
    {
      name: 'dashboard-store',
    }
  )
) 