import { create } from 'zustand'

interface DashboardStore {
  activeView: 'engine' | 'journey' | 'new-journey' | 'citation' | 'takeaways' | 'response' | 'personal' | 'faqs'
  setActiveView: (view: 'engine' | 'journey' | 'new-journey' | 'citation' | 'takeaways' | 'response' | 'personal' | 'faqs') => void
  selectedCompanyId: number | null
  setSelectedCompanyId: (id: number | null) => void
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  activeView: 'engine',
  setActiveView: (view) => set({ activeView: view }),
  selectedCompanyId: null,
  setSelectedCompanyId: (id) => set({ selectedCompanyId: id })
})) 