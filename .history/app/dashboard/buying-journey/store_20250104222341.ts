import { create } from "zustand"

export type Stage = 'company' | 'region' | 'vertical' | 'persona' | 'query'
export type SortOption = 'batch' | 'time'
export type TimeFrame = 'week' | 'month'

export interface Metrics {
  companyMentioned: number
  averagePosition: number
  featureScore: number
  averageSentiment: number
  changeFromPrevious?: {
    companyMentioned: number
    averagePosition: number
    featureScore: number
    averageSentiment: number
  }
}

interface BuyingJourneyState {
  currentStage: Stage
  selectedRegion: string | null
  selectedVertical: string | null
  selectedPersona: string | null
  selectedQuery: string | null
  sortBy: SortOption
  timeFrame: TimeFrame
  metrics: Metrics | null
  isLoading: boolean
  setStage: (stage: Stage) => void
  setSelection: (type: Stage, id: string | null) => void
  setSortBy: (sort: SortOption) => void
  setTimeFrame: (time: TimeFrame) => void
  setMetrics: (metrics: Metrics | null) => void
  setLoading: (loading: boolean) => void
  reset: () => void
}

type SelectionKey = "selectedRegion" | "selectedVertical" | "selectedPersona" | "selectedQuery"

const initialState = {
  currentStage: "company" as Stage,
  selectedRegion: null,
  selectedVertical: null,
  selectedPersona: null,
  selectedQuery: null,
  sortBy: "batch" as SortOption,
  timeFrame: "week" as TimeFrame,
  metrics: null,
  isLoading: false,
}

export const useBuyingJourneyStore = create<BuyingJourneyState>((set) => ({
  ...initialState,
  setStage: (stage) => set({ currentStage: stage }),
  setSelection: (type, id) =>
    set((state) => {
      const updates: Partial<BuyingJourneyState> = {}
      
      // Map stage to selection key
      const selectionMap: Record<Stage, SelectionKey | null> = {
        company: "selectedRegion",
        region: "selectedVertical",
        vertical: "selectedPersona",
        persona: "selectedQuery",
        query: null,
      }
      
      const currentKey = selectionMap[type]
      if (currentKey) {
        updates[currentKey] = id
      }
      
      // Reset subsequent selections
      const stages: Stage[] = ["region", "vertical", "persona", "query"]
      const currentIndex = stages.indexOf(type)
      
      if (currentIndex !== -1) {
        stages.slice(currentIndex + 1).forEach((stage) => {
          const resetKey = selectionMap[stage]
          if (resetKey) {
            updates[resetKey] = null
          }
        })
      }
      
      return updates
    }),
  setSortBy: (sort) => set({ sortBy: sort }),
  setTimeFrame: (time) => set({ timeFrame: time }),
  setMetrics: (metrics) => set({ metrics }),
  setLoading: (loading) => set({ isLoading: loading }),
  reset: () => set(initialState),
})) 