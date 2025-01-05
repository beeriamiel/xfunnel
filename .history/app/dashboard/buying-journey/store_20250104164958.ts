import { create } from 'zustand'
import { JourneyStage } from './components/journey-progress/progress-bar'

interface JourneyState {
  // Navigation
  currentStage: JourneyStage
  completedStages: JourneyStage[]
  
  // Selected values
  selectedRegion: string | null
  selectedVertical: string | null
  selectedPersona: string | null
  
  // Time filtering
  filterType: 'batch' | 'time'
  selectedBatchId: string | null
  selectedTimePeriod: {
    type: 'week' | 'month'
    value: string
  } | null

  // Actions
  setStage: (stage: JourneyStage) => void
  completeStage: (stage: JourneyStage) => void
  resetStages: () => void
  
  setSelectedRegion: (region: string | null) => void
  setSelectedVertical: (vertical: string | null) => void
  setSelectedPersona: (persona: string | null) => void
  
  setFilterType: (type: 'batch' | 'time') => void
  setSelectedBatchId: (id: string | null) => void
  setSelectedTimePeriod: (period: { type: 'week' | 'month'; value: string } | null) => void
}

export const useJourneyStore = create<JourneyState>((set) => ({
  // Initial state
  currentStage: 'company',
  completedStages: [],
  
  selectedRegion: null,
  selectedVertical: null,
  selectedPersona: null,
  
  filterType: 'batch',
  selectedBatchId: null,
  selectedTimePeriod: null,

  // Actions
  setStage: (stage) => set({ currentStage: stage }),
  
  completeStage: (stage) =>
    set((state) => ({
      completedStages: [...new Set([...state.completedStages, stage])]
    })),
    
  resetStages: () =>
    set({
      currentStage: 'company',
      completedStages: [],
      selectedRegion: null,
      selectedVertical: null,
      selectedPersona: null
    }),
    
  setSelectedRegion: (region) =>
    set({
      selectedRegion: region,
      currentStage: 'vertical',
      completedStages: ['company', 'region']
    }),
    
  setSelectedVertical: (vertical) =>
    set({
      selectedVertical: vertical,
      currentStage: 'persona',
      completedStages: ['company', 'region', 'vertical']
    }),
    
  setSelectedPersona: (persona) =>
    set({
      selectedPersona: persona,
      currentStage: 'queries',
      completedStages: ['company', 'region', 'vertical', 'persona']
    }),
    
  setFilterType: (type) => set({ filterType: type }),
  setSelectedBatchId: (id) => set({ selectedBatchId: id }),
  setSelectedTimePeriod: (period) => set({ selectedTimePeriod: period })
})) 