import { create } from 'zustand'

interface DashboardStore {
  activeView: 'engine' | 'journey' | 'citation'
  setActiveView: (view: 'engine' | 'journey' | 'citation') => void
  selectedCompanyId: number | null
  setSelectedCompanyId: (id: number | null) => void
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  activeView: 'engine',
  setActiveView: (view) => set({ activeView: view }),
  selectedCompanyId: null,
  setSelectedCompanyId: (id) => set({ selectedCompanyId: id })
})) 