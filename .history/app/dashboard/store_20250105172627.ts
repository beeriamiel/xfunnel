import { create } from 'zustand'

export interface DashboardStore {
  selectedCompanyId: number | null;
  effectiveCompanyId: number | null;
  activeView: string;
  setSelectedCompanyId: (id: number | null) => void;
  setActiveView: (view: string) => void;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  activeView: 'engine',
  setActiveView: (view) => set({ activeView: view }),
  selectedCompanyId: null,
  setSelectedCompanyId: (id) => set({ selectedCompanyId: id })
})) 