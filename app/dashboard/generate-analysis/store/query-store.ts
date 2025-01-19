import { create } from 'zustand'
import type { QueryAction } from '../types/analysis'

interface QueryState {
  queries: Record<string, {
    availableActions: QueryAction[]
    status: 'idle' | 'running' | 'completed' | 'failed'
    isLoading: boolean
    error: string | null
  }>
  setQueryState: (queryId: string, state: Partial<QueryState['queries'][string]>) => void
  resetQueryState: (queryId: string) => void
  initializeQuery: (queryId: string, initialState?: Partial<QueryState['queries'][string]>) => void
}

export const useQueryStore = create<QueryState>((set) => ({
  queries: {},
  setQueryState: (queryId, state) => 
    set((prev) => ({
      queries: {
        ...prev.queries,
        [queryId]: {
          ...prev.queries[queryId],
          ...state
        }
      }
    })),
  initializeQuery: (queryId, initialState = {
    availableActions: ['generate_response', 'view_responses'],
    status: 'idle',
    isLoading: false,
    error: null
  }) =>
    set((prev) => ({
      queries: {
        ...prev.queries,
        [queryId]: {
          ...initialState,
          ...prev.queries[queryId]
        }
      }
    })),
  resetQueryState: (queryId) =>
    set((prev) => {
      const { [queryId]: _, ...rest } = prev.queries
      return { queries: rest }
    })
})) 