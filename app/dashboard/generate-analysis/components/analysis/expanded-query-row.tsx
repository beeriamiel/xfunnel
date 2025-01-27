'use client'

import * as React from 'react'
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { format } from 'date-fns'
import { FileText, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Query } from '../../types/analysis'
import { generateResponsesAction, type EngineSelection } from '@/app/company-actions'

interface ExpandedQueryRowProps {
  queries: Query[]
  companyId: number
  personaId: number
  accountId: string
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

export function ExpandedQueryRow({ queries, companyId, personaId, accountId, onGenerateResponse }: ExpandedQueryRowProps) {
  const [isGenerating, setIsGenerating] = React.useState(false)

  // Group queries by buyer journey phase
  const groupedQueries = React.useMemo(() => {
    return queries.reduce((acc, query) => {
      const phase = query.buyer_journey_phase?.[0] || 'unknown'
      if (!acc[phase]) {
        acc[phase] = []
      }
      acc[phase].push(query)
      return acc
    }, {} as Record<string, Query[]>)
  }, [queries])

  const handleGenerateResponse = async () => {
    setIsGenerating(true)
    try {
      // Enable all engines
      const engines: EngineSelection = {
        perplexity: true,
        gemini: true,
        claude: true,
        openai: true,
        google_search: true
      }

      await generateResponsesAction(
        companyId,
        [personaId],
        engines,
        'gpt-4-turbo-preview',
        accountId
      )

      toast.success('Successfully generated responses')
      onGenerateResponse()
    } catch (error) {
      console.error('Error generating responses:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to generate responses')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="border-t">
      <div className="p-4 border-b bg-muted/10">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">
            {queries.length} {queries.length === 1 ? 'Query' : 'Queries'}
          </p>
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
          onClick={handleGenerateResponse}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            'Generate Response'
          )}
        </Button>
      </CardFooter>
    </div>
  )
} 