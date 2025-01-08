'use client'

import * as React from 'react'
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import type { Query, QueryState, QueryAction } from '../../types/analysis'

interface QueryRowProps {
  queryState: QueryState
  onAction: (action: QueryAction) => void
  queries?: Query[]
}

function ActionButton({ action, onClick, queryCount }: { 
  action: QueryAction
  onClick: () => void 
  queryCount?: number
}) {
  switch (action) {
    case 'generate_queries':
      return (
        <Button 
          variant="default" 
          className="bg-purple-800 hover:bg-purple-700"
          onClick={onClick}
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
        >
          View Queries {queryCount ? `(${queryCount})` : ''}
        </Button>
      )
    default:
      return null
  }
}

export function QueryRow({ 
  queryState, 
  onAction,
  queries = []
}: QueryRowProps) {
  return (
    <div className="flex items-center justify-end gap-2">
      {queryState.availableActions.map((action) => (
        <ActionButton 
          key={action}
          action={action}
          onClick={() => onAction(action)}
          queryCount={action === 'view_queries' ? queryState.queryCount : undefined}
        />
      ))}
    </div>
  )
} 