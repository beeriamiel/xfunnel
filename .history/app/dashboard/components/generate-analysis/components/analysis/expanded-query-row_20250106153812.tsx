'use client'

import * as React from 'react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { format } from 'date-fns'
import { Check, Clock } from 'lucide-react'
import type { Query } from '../../types/analysis'

interface ExpandedQueryRowProps {
  queries: Query[]
  onGenerateResponse: () => void
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
    <div className="p-4 bg-gray-50/50 border-t">
      <div className="max-w-[1200px] mx-auto space-y-6">
        {Object.entries(groupedQueries).map(([phase, phaseQueries]) => (
          <div key={phase} className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-900">
                {phase.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </h4>
              <span className="text-xs text-gray-500">
                {format(new Date(phaseQueries[0].created_at!), 'MMM d, yyyy')}
              </span>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {phaseQueries.map((query) => (
                <Card key={query.id} className="p-4 bg-white">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <p className="text-sm text-gray-700 flex-grow">
                        {query.query_text}
                      </p>
                      {query.responses && query.responses.length > 0 ? (
                        <div className="flex items-center gap-1 ml-2">
                          <Check className="h-4 w-4 text-green-500" />
                          <span className="text-xs text-gray-500">
                            {format(new Date(query.responses[0].created_at!), 'MMM d')}
                          </span>
                        </div>
                      ) : (
                        <Clock className="h-4 w-4 text-gray-400 ml-2" />
                      )}
                    </div>
                    {query.responses && query.responses.length > 0 && (
                      <div className="text-xs text-gray-500">
                        via {query.responses[0].answer_engine}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}
        <div className="flex justify-end pt-2">
          <Button 
            variant="default"
            className="bg-purple-800 hover:bg-purple-700"
            onClick={onGenerateResponse}
          >
            Generate Response
          </Button>
        </div>
      </div>
    </div>
  )
} 