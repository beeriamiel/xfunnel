'use client'

import * as React from 'react'
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { format } from 'date-fns'
import { FileText } from 'lucide-react'
import type { Query } from '../../types/analysis'

interface ExpandedQueryRowProps {
  queries: Query[]
  onGenerateResponse: () => void
}

function QueryRow({ query }: { query: Query }) {
  return (
    <div className="flex items-start gap-3 py-3 hover:bg-accent/50 rounded-md px-3 transition-colors">
      <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
      <p className="text-sm text-muted-foreground leading-normal">
        {query.query_text}
      </p>
    </div>
  )
}

function PhaseGroup({ phase, queries }: { phase: string; queries: Query[] }) {
  return (
    <Card className="mb-4 last:mb-0 shadow-none border-none bg-background/40">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">
            {phase.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </CardTitle>
          <span className="text-xs text-muted-foreground">
            {format(new Date(queries[0].created_at!), 'MMM d, yyyy')}
          </span>
        </div>
        <p className="text-xs text-muted-foreground -mt-1">
          {queries.length} queries
        </p>
      </CardHeader>
      <CardContent className="grid gap-0">
        {queries.map((query) => (
          <QueryRow key={query.id} query={query} />
        ))}
      </CardContent>
    </Card>
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
      <div className="p-4 border-b bg-muted/10">
        <div className="grid grid-cols-4 gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium">Company Mentioned</p>
            <p className="text-2xl font-bold">4%</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">Average Position</p>
            <p className="text-2xl font-bold">1.0</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">Feature Score</p>
            <p className="text-2xl font-bold">0%</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">Average Sentiment</p>
            <p className="text-2xl font-bold">0%</p>
          </div>
        </div>
      </div>
      <ScrollArea className="h-[500px]">
        <div className="p-4">
          {Object.entries(groupedQueries).map(([phase, phaseQueries]) => (
            <PhaseGroup key={phase} phase={phase} queries={phaseQueries} />
          ))}
        </div>
      </ScrollArea>
      <CardFooter className="border-t bg-background px-4 py-3">
        <Button 
          variant="default"
          className="ml-auto"
          onClick={onGenerateResponse}
        >
          Generate Response
        </Button>
      </CardFooter>
    </div>
  )
} 