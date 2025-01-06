import { create } from "zustand"
import { Stage, SortOption, TimeFrame, Metrics } from "./types"

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

type SelectionKey = `selected${Capitalize<Stage>}`

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
      const key = `selected${type.charAt(0).toUpperCase() + type.slice(1)}` as SelectionKey
      const updates = { [key]: id } as Partial<BuyingJourneyState>
      
      // Reset subsequent selections
      const stages: Stage[] = ["region", "vertical", "persona", "query"]
      const currentIndex = stages.indexOf(type)
      
      if (currentIndex !== -1) {
        stages.slice(currentIndex + 1).forEach((stage) => {
          const resetKey = `selected${stage.charAt(0).toUpperCase() + stage.slice(1)}` as SelectionKey
          updates[resetKey] = null
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