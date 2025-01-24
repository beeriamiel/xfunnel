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
  setQueryState: (queryId, state) => {
    console.log('🔵 QueryStore setQueryState:', { queryId, newState: state })
    set((prev) => ({
      queries: {
        ...prev.queries,
        [queryId]: {
          ...prev.queries[queryId],
          ...state
        }
      }
    }))
  },
  initializeQuery: (queryId, initialState = {
    availableActions: ['generate_queries', 'view_queries'],
    status: 'idle',
    isLoading: false,
    error: null
  }) => {
    console.log('🔵 QueryStore initializeQuery:', { 
      queryId, 
      initialState,
      existingState: useQueryStore.getState().queries[queryId]
    })
    set((prev) => ({
      queries: {
        ...prev.queries,
        [queryId]: {
          ...initialState,
          ...prev.queries[queryId]
        }
      }
    }))
    console.log('🟢 QueryStore State After Init:', {
      queryId,
      newState: useQueryStore.getState().queries[queryId]
    })
  },
  resetQueryState: (queryId) => {
    console.log('🔵 QueryStore resetQueryState:', { queryId })
    set((prev) => {
      const { [queryId]: _, ...rest } = prev.queries
      return { queries: rest }
    })
  }
})) 