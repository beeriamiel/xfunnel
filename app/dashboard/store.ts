import { create } from 'zustand'

interface DashboardStore {
  activeView: 'engine' | 'journey'
  selectedCompanyId: number | null
  setActiveView: (view: 'engine' | 'journey') => void
  setSelectedCompanyId: (id: number | null) => void
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  activeView: 'engine',
  selectedCompanyId: null,
  setActiveView: (view) => set({ activeView: view }),
  setSelectedCompanyId: (id) => set({ selectedCompanyId: id }),
})) 