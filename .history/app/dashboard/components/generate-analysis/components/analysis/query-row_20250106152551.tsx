'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronRight, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Query, QueryState, QueryAction } from '../../types/analysis'
import { format } from 'date-fns'

interface QueryRowProps {
  queryState: QueryState
  onAction: (action: QueryAction) => void
  expanded?: boolean
  onToggle?: () => void
  queries?: Query[]
}

function formatDate(date: Date | null): string {
  if (!date) return 'Never'
  return format(date, 'MMM d, yyyy')
}

function ActionButton({ action, onClick }: { action: QueryAction; onClick: () => void }) {
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
    case 'generate_response':
      return (
        <Button 
          variant="default" 
          className="bg-purple-800 hover:bg-purple-700"
          onClick={onClick}
        >
          Generate Response
        </Button>
      )
    case 'view_queries':
      return (
        <Button 
          variant="outline" 
          className="border-purple-800 text-purple-800 hover:bg-purple-50"
          onClick={onClick}
        >
          View Queries
        </Button>
      )
    case 'view_responses':
      return (
        <Button 
          variant="outline" 
          className="border-purple-800 text-purple-800 hover:bg-purple-50"
          onClick={onClick}
        >
          View Responses
        </Button>
      )
    default:
      return null
  }
}

export function QueryRow({ 
  queryState, 
  onAction, 
  expanded = false,
  onToggle,
  queries = []
}: QueryRowProps) {
  const [isExpanded, setIsExpanded] = useState(expanded)

  const handleToggle = () => {
    setIsExpanded(!isExpanded)
    onToggle?.()
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {queryState.queryCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="p-0 hover:bg-transparent"
              onClick={handleToggle}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          )}
          <span className={cn(
            "text-sm",
            queryState.rowState === 'no_queries' ? 'text-muted-foreground' : 'text-foreground'
          )}>
            {formatDate(queryState.lastRunDate)}
          </span>
          {queryState.queryCount > 0 && (
            <span className="text-sm text-muted-foreground">
              ({queryState.queryCount} queries)
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {queryState.availableActions.map((action) => (
            <ActionButton 
              key={action}
              action={action}
              onClick={() => onAction(action)}
            />
          ))}
        </div>
      </div>

      {isExpanded && queryState.queryCount > 0 && (
        <div className="pl-8 space-y-2">
          {queries.map((query) => (
            <div 
              key={query.id}
              className="p-3 rounded-lg bg-purple-50 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-purple-900">
                  {query.buyer_journey_phase[0].replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(query.created_at!), 'MMM d, yyyy')}
                </span>
              </div>
              <p className="text-sm text-purple-800">
                {query.query_text}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 