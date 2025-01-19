import { create } from 'zustand'
import type { QueryAction } from '../types/analysis'

interface QueryState {
  id: string;
  availableActions: QueryAction[];
  status: 'idle' | 'loading' | 'error' | 'success';
  isLoading: boolean;
  error: string | null;
}

interface QueryStore {
  queries: Record<string, QueryState>;
  initializeQuery: (id: string, state: Omit<QueryState, 'id'>) => void;
  setQueryStatus: (id: string, status: QueryState['status']) => void;
  setQueryLoading: (id: string, isLoading: boolean) => void;
  setQueryError: (id: string, error: string | null) => void;
  updateQueryActions: (id: string, actions: QueryAction[]) => void;
}

export const useQueryStore = create<QueryStore>((set) => ({
  queries: {},
  initializeQuery: (id, state) => set((store) => ({
    queries: {
      ...store.queries,
      [id]: { id, ...state }
    }
  })),
  setQueryStatus: (id, status) => set((store) => ({
    queries: {
      ...store.queries,
      [id]: { ...store.queries[id], status }
    }
  })),
  setQueryLoading: (id, isLoading) => set((store) => ({
    queries: {
      ...store.queries,
      [id]: { ...store.queries[id], isLoading }
    }
  })),
  setQueryError: (id, error) => set((store) => ({
    queries: {
      ...store.queries,
      [id]: { ...store.queries[id], error }
    }
  })),
  updateQueryActions: (id, actions) => set((store) => ({
    queries: {
      ...store.queries,
      [id]: { ...store.queries[id], availableActions: actions }
    }
  }))
})); 