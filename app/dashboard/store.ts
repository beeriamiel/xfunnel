import { create } from 'zustand'

interface DashboardStore {
  activeView: 'engine' | 'journey' | 'citation' | 'takeaways'
  setActiveView: (view: 'engine' | 'journey' | 'citation' | 'takeaways') => void
  selectedCompanyId: number | null
  setSelectedCompanyId: (id: number | null) => void
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  activeView: 'engine',
  setActiveView: (view) => set({ activeView: view }),
  selectedCompanyId: null,
  setSelectedCompanyId: (id) => set({ selectedCompanyId: id })
})) 