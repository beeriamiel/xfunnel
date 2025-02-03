import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Company } from './generate-analysis/types/company'

export type DashboardView = 'engine' | 'citation' | 'takeaways' | 'response' | 'personal' | 'faqs' | 'icp' | 'journey' | 'new-journey' | 'ai-overviews'
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
  id: number
  name: string
  company_id: number
  account_id: string
  created_at: string | null
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

interface DashboardStore {
  activeView: DashboardView
  setActiveView: (view: DashboardView) => void
  selectedCompanyId: number | null
  setSelectedCompanyId: (id: number | null) => void
  selectedProductId: string | null
  setSelectedProductId: (id: string | null) => void
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
  isSuperAdmin: boolean
  setIsSuperAdmin: (isSuperAdmin: boolean) => void
}

export const useDashboardStore = create(
  persist<DashboardStore>(
    (set) => ({
      activeView: 'engine',
      setActiveView: (view) => set({ activeView: view }),
      selectedCompanyId: null,
      setSelectedCompanyId: (id) => set({ selectedCompanyId: id }),
      selectedProductId: null,
      setSelectedProductId: (id) => set({ selectedProductId: id }),
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
      isSuperAdmin: false,
      setIsSuperAdmin: (isSuperAdmin) => set({ isSuperAdmin })
    }),
    {
      name: 'dashboard-store',
    }
  )
) 