'use client'

import { useEffect, useState } from 'react'
import { useJourneyStore } from '../../store'
import { Query } from '../../types'
import { fetchQueries } from '../../service'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { InfoIcon, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

function PersonaMetricsPlaceholder() {
  return (
    <Card className="p-6 bg-muted/50">
      <div className="flex items-center gap-2 text-muted-foreground">
        <InfoIcon className="h-4 w-4" />
        <p className="text-sm">Persona-specific metrics and trends will be available here in a future update</p>
      </div>
    </Card>
  )
}

function LoadingState() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-32 w-full" /> {/* Persona metrics placeholder */}
      <Skeleton className="h-8 w-48" />
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" /> {/* Tabs */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4">
              <div className="space-y-4">
                <Skeleton className="h-6 w-3/4" />
                <div className="grid grid-cols-5 gap-4">
                  {[1, 2, 3, 4, 5].map((j) => (
                    <Skeleton key={j} className="h-24" />
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

const stages = [
  { id: 'problem-exploration', label: 'Problem Exploration' },
  { id: 'solution-education', label: 'Solution Education' },
  { id: 'solution-comparison', label: 'Solution Comparison' },
  { id: 'solution-evaluation', label: 'Solution Evaluation' },
  { id: 'user-feedback', label: 'User Feedback' }
] as const

export function PersonaView() {
  const [queries, setQueries] = useState<Query[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeStage, setActiveStage] = useState<typeof stages[number]['id']>('problem-exploration')
  
  const { 
    selectedRegion,
    selectedVertical,
    selectedPersona,
    filterType, 
    selectedBatchId, 
    selectedTimePeriod,
    setStage 
  } = useJourneyStore()

  useEffect(() => {
    async function loadQueries() {
      if (!selectedRegion || !selectedVertical || !selectedPersona) return
      
      setIsLoading(true)
      try {
        const data = await fetchQueries(1, selectedPersona, {
          type: filterType,
          batchId: selectedBatchId || undefined,
          timePeriod: selectedTimePeriod || undefined,
        })
        setQueries(data)
      } catch (error) {
        console.error('Error loading queries:', error)
        return (
          <Alert variant="destructive">
            <AlertDescription>Failed to load queries. Please try again.</AlertDescription>
          </Alert>
        )
      } finally {
        setIsLoading(false)
      }
    }

    loadQueries()
  }, [selectedRegion, selectedVertical, selectedPersona, filterType, selectedBatchId, selectedTimePeriod])

  if (isLoading) {
    return <LoadingState />
  }

  const stageQueries = queries.filter(q => q.stage === activeStage)

  return (
    <div className="space-y-8">
      {/* Back button */}
      <Button
        variant="ghost"
        className="gap-2"
        onClick={() => setStage('vertical')}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Personas
      </Button>

      {/* Persona metrics placeholder */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Persona Overview</h2>
        <PersonaMetricsPlaceholder />
      </div>

      {/* Journey stages tabs */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">Buying Journey Stages</h2>
          <p className="text-sm text-muted-foreground">
            {queries.length} {queries.length === 1 ? 'query' : 'queries'} total
          </p>
        </div>

        <Tabs value={activeStage} onValueChange={(value) => setActiveStage(value as typeof activeStage)}>
          <TabsList className="w-full justify-start">
            {stages.map((stage) => (
              <TabsTrigger 
                key={stage.id} 
                value={stage.id}
                className="flex-1"
              >
                <span className="truncate">{stage.label}</span>
                <span className="ml-2 text-xs">
                  ({queries.filter(q => q.stage === stage.id).length})
                </span>
              </TabsTrigger>
            ))}
          </TabsList>

          {stages.map((stage) => (
            <TabsContent key={stage.id} value={stage.id} className="space-y-4">
              {stageQueries.length === 0 ? (
                <Card className="p-6">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <InfoIcon className="h-4 w-4" />
                    <p>No queries available for this stage</p>
                  </div>
                </Card>
              ) : (
                stageQueries.map((query) => (
                  <Card key={query.id} className="p-4">
                    <div className="space-y-4">
                      <p className="text-sm">{query.text}</p>
                      <div className="grid grid-cols-5 gap-4">
                        {query.engines.map((engine) => (
                          <Card key={engine.name} className="p-3">
                            <div className="space-y-2">
                              <p className="text-sm font-medium">{engine.name}</p>
                              {/* Engine result content based on stage */}
                              {stage.id === 'problem-exploration' || stage.id === 'solution-education' ? (
                                <div className="text-sm">
                                  {engine.result.mentioned ? 'Mentioned' : 'Not mentioned'}
                                </div>
                              ) : stage.id === 'solution-comparison' || stage.id === 'user-feedback' ? (
                                <div className="text-sm">
                                  {engine.result.position ? `Rank: ${engine.result.position}` : 'Not ranked'}
                                </div>
                              ) : stage.id === 'solution-evaluation' ? (
                                <div className="text-sm space-y-1">
                                  <div>Yes: {engine.result.featureAnalysis?.yes || 0}%</div>
                                  <div>No: {engine.result.featureAnalysis?.no || 0}%</div>
                                  <div>Unknown: {engine.result.featureAnalysis?.unknown || 0}%</div>
                                </div>
                              ) : null}
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  )
} 