'use client'

import { useEffect, useMemo } from 'react'
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import type { Query, QueryState, QueryAction } from '../../types/analysis'
import { useQueryStore } from '../../store/query-store'

interface QueryRowProps {
  query: Query
  isExpanded: boolean
  onToggle: () => void
}

function ActionButton({ 
  action, 
  onClick, 
  disabled,
  queryCount 
}: { 
  action: QueryAction
  onClick: () => void 
  disabled?: boolean
  queryCount?: number
}) {
  switch (action) {
    case 'generate_queries':
      return (
        <Button 
          variant="default" 
          className="bg-purple-800 hover:bg-purple-700"
          onClick={onClick}
          disabled={disabled}
        >
          <Plus className="mr-2 h-4 w-4" />
          Generate Queries (Free)
        </Button>
      )
    case 'view_queries':
      return (
        <Button 
          variant="outline" 
          className="border-purple-800 text-purple-800 hover:bg-purple-50"
          onClick={onClick}
          disabled={disabled}
        >
          View Queries {queryCount ? `(${queryCount})` : ''}
        </Button>
      )
    default:
      return null
  }
}

export function QueryRow({ query, isExpanded, onToggle }: QueryRowProps) {
  // Add null check for query
  if (!query?.id) {
    return null;
  }

  // Memoize the default state
  const defaultState = useMemo(() => ({
    availableActions: ['generate_queries', 'view_queries'] as QueryAction[],
    status: 'idle' as const,
    isLoading: false,
    error: null
  }), [])

  // Get query state from store
  const queryState = useQueryStore(
    useMemo(
      () => (state) => state.queries[query.id] || defaultState,
      [query.id, defaultState]
    )
  )

  // Initialize query state if it doesn't exist
  useEffect(() => {
    const store = useQueryStore.getState()
    if (query.id && !store.queries[query.id]) {
      store.initializeQuery(query.id)
    }
  }, [query.id])

  return (
    <div className="flex items-center justify-end gap-2">
      {queryState?.availableActions?.map((action) => (
        <ActionButton 
          key={action}
          action={action}
          onClick={onToggle}
          disabled={queryState.isLoading}
          queryCount={action === 'view_queries' ? query.queries?.length : undefined}
        />
      ))}
    </div>
  )
} 