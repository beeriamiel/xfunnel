import { create } from 'zustand'
import type { QueryAction } from '../types/analysis'

interface QueryState {
  queries: Record<string, {
    availableActions: QueryAction[]
    status: 'idle' | 'running' | 'completed' | 'failed'
    isLoading: boolean
    error: string | null
    queryList?: Array<{ id: string; text: string }>
  }>
  setQueryState: (queryId: string, state: Partial<QueryState['queries'][string]>) => void
  resetQueryState: (queryId: string) => void
  initializeQuery: (
    queryId: string, 
    hasExistingQueries: boolean,
    initialState?: Partial<QueryState['queries'][string]>
  ) => void
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
  initializeQuery: (queryId, hasExistingQueries, initialState = {
    status: 'idle',
    isLoading: false,
    error: null
  }) => {
    console.log('🔵 QueryStore initializeQuery:', { 
      queryId, 
      hasExistingQueries,
      initialState,
      existingState: useQueryStore.getState().queries[queryId]
    })

    // Set correct actions based on whether queries exist
    const availableActions: QueryAction[] = hasExistingQueries 
      ? ['generate_response', 'view_queries']
      : ['generate_queries', 'view_queries']

    // Ensure we preserve any existing queryList if present
    const existingState = useQueryStore.getState().queries[queryId]
    const queryList = initialState.queryList || existingState?.queryList

    set((prev) => ({
      queries: {
        ...prev.queries,
        [queryId]: {
          ...initialState,
          ...prev.queries[queryId],
          availableActions,
          queryList
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