import { create } from 'zustand'

interface DashboardStore {
  activeView: 'engine' | 'journey'
  setActiveView: (view: 'engine' | 'journey') => void
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  activeView: 'engine',
  setActiveView: (view) => set({ activeView: view }),
})) 