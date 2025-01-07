import { create } from 'zustand'

export interface DashboardStore {
  selectedCompanyId: number | null;
  effectiveCompanyId: number | null;
  activeView: string;
  setSelectedCompanyId: (id: number | null) => void;
  setActiveView: (view: string) => void;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  selectedCompanyId: null,
  effectiveCompanyId: null,
  activeView: 'engine',
  setSelectedCompanyId: (id) => set({ selectedCompanyId: id, effectiveCompanyId: id }),
  setActiveView: (view) => set({ activeView: view }),
})); 