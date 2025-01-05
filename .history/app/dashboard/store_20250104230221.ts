import { create } from 'zustand'

type View = 'engine-metrics' | 'buying-journey' | 'new-journey' | 'citation' | 'takeaways' | 'response' | 'personal' | 'faqs'

interface DashboardState {
  selectedCompanyId: number | null
  activeView: View
  setSelectedCompanyId: (id: number | null) => void
  setActiveView: (view: View) => void
}

export const useDashboardStore = create<DashboardState>((set) => ({
  selectedCompanyId: null,
  activeView: 'engine-metrics',
  setSelectedCompanyId: (id) => set({ selectedCompanyId: id }),
  setActiveView: (view) => set({ activeView: view }),
})) 