'use client'

import * as React from 'react'
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { format } from 'date-fns'
import { FileText } from 'lucide-react'
import type { Query } from '../../types/analysis'

interface ExpandedQueryRowProps {
  queries: Query[]
  onGenerateResponse: () => void
}

function QueryRow({ query }: { query: Query }) {
  return (
    <div className="pl-6 pr-4 py-3 hover:bg-gray-50/50">
      <div className="flex items-start gap-3 relative">
        <FileText className="h-4 w-4 text-gray-400 absolute left-[-20px] top-[2px]" />
        <p className="text-sm text-gray-600 leading-relaxed">
          {query.query_text}
        </p>
      </div>
    </div>
  )
}

function PhaseGroup({ phase, queries }: { phase: string; queries: Query[] }) {
  return (
    <div className="mb-6 last:mb-0">
      <div className="px-6 mb-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-900">
            {phase.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </h4>
          <span className="text-xs text-gray-500">
            {format(new Date(queries[0].created_at!), 'MMM d, yyyy')}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-0.5">
          {queries.length} queries
        </p>
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

  return (
    <div className="border-t">
      <ScrollArea className="h-[600px]">
        <div className="py-4">
          {Object.entries(groupedQueries).map(([phase, phaseQueries]) => (
            <PhaseGroup key={phase} phase={phase} queries={phaseQueries} />
          ))}
        </div>
      </ScrollArea>
      <div className="px-6 py-3 border-t bg-white flex items-center justify-between">
        <Button 
          variant="default"
          className="bg-purple-800 hover:bg-purple-700 ml-auto"
          onClick={onGenerateResponse}
        >
          Generate Response
        </Button>
      </div>
    </div>
  )
} 