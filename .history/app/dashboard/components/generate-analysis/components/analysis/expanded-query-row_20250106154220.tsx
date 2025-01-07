'use client'

import * as React from 'react'
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { format } from 'date-fns'
import { Check, Clock, FileText } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { Query } from '../../types/analysis'

interface ExpandedQueryRowProps {
  queries: Query[]
  onGenerateResponse: () => void
}

function QueryRow({ query }: { query: Query }) {
  const hasResponse = query.responses && query.responses.length > 0
  const response = hasResponse ? query.responses![0] : null

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center justify-between px-4 py-2 hover:bg-gray-50">
            <div className="flex items-center gap-3 min-w-0">
              <FileText className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <p className="text-sm text-gray-700 truncate">
                {query.query_text}
              </p>
            </div>
            <div className="flex items-center gap-2 ml-4 flex-shrink-0">
              {hasResponse ? (
                <>
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-xs text-gray-500">
                    {format(new Date(response!.created_at!), 'MMM d')} via {response!.answer_engine}
                  </span>
                </>
              ) : (
                <>
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-xs text-gray-500">Pending</span>
                </>
              )}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[400px]">
          <p className="text-sm">{query.query_text}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

function PhaseGroup({ phase, queries }: { phase: string; queries: Query[] }) {
  const completedCount = queries.filter(q => q.responses && q.responses.length > 0).length

  return (
    <div>
      <div className="sticky top-0 bg-gray-50 px-4 py-2 border-y flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium text-gray-900">
            {phase.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </h4>
          <p className="text-xs text-gray-500">
            {completedCount}/{queries.length} completed
          </p>
        </div>
        <span className="text-xs text-gray-500">
          {format(new Date(queries[0].created_at!), 'MMM d, yyyy')}
        </span>
      </div>
      <div>
        {queries.map((query) => (
          <QueryRow key={query.id} query={query} />
        ))}
      </div>
    </div>
  )
}

export function ExpandedQueryRow({ queries, onGenerateResponse }: ExpandedQueryRowProps) {
  // Group queries by buyer journey phase
  const groupedQueries = React.useMemo(() => {
    return queries.reduce((acc, query) => {
      const phase = query.buyer_journey_phase[0]
      if (!acc[phase]) {
        acc[phase] = []
      }
      acc[phase].push(query)
      return acc
    }, {} as Record<string, Query[]>)
  }, [queries])

  const totalQueries = queries.length
  const completedQueries = queries.filter(q => q.responses && q.responses.length > 0).length

  return (
    <div className="border-t">
      <ScrollArea className="h-[400px]">
        <div className="divide-y">
          {Object.entries(groupedQueries).map(([phase, phaseQueries]) => (
            <PhaseGroup key={phase} phase={phase} queries={phaseQueries} />
          ))}
        </div>
      </ScrollArea>
      <div className="p-4 border-t bg-white flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {completedQueries} of {totalQueries} queries completed
        </p>
        <Button 
          variant="default"
          className="bg-purple-800 hover:bg-purple-700"
          onClick={onGenerateResponse}
        >
          Generate Response
        </Button>
      </div>
    </div>
  )
} 