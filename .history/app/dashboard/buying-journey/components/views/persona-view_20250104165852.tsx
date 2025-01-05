'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useJourneyStore } from '../../store'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Query, BuyingStage } from '../../types'
import { fetchQueries } from '../../service'
import { Skeleton } from '@/components/ui/skeleton'

const stages: Array<{
  id: BuyingStage
  label: string
  description: string
}> = [
  {
    id: 'problem-exploration',
    label: 'Problem Exploration',
    description: 'Understanding the challenges and pain points'
  },
  {
    id: 'solution-education',
    label: 'Solution Education',
    description: 'Learning about potential solutions'
  },
  {
    id: 'solution-comparison',
    label: 'Solution Comparison',
    description: 'Comparing different solutions'
  },
  {
    id: 'solution-evaluation',
    label: 'Solution Evaluation',
    description: 'Evaluating specific features and capabilities'
  },
  {
    id: 'user-feedback',
    label: 'User Feedback',
    description: 'Real user experiences and opinions'
  }
]

function LoadingState() {
  return (
    <div className="space-y-8">
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-8" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="space-y-4">
          <div>
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-4 w-64 mt-1" />
          </div>
          <div className="space-y-4">
            <Card className="p-4 space-y-4">
              <Skeleton className="h-6 w-3/4" />
              <div className="space-y-2">
                <Card className="p-3">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </Card>
                <Card className="p-3">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </Card>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

function QueryCard({ query }: { query: Query }) {
  return (
    <Card className="p-4 space-y-4">
      <div>
        <h4 className="font-medium">{query.text}</h4>
      </div>
      <div className="grid gap-2">
        {query.engines.map((engine) => (
          <Card key={engine.name} className="p-3">
            <div className="flex justify-between items-center">
              <span className="font-medium">{engine.name}</span>
              <div className="text-sm">
                {engine.result.mentioned !== undefined && (
                  <span>
                    {engine.result.mentioned ? 'Mentioned' : 'Not Mentioned'}
                  </span>
                )}
                {engine.result.position !== undefined && (
                  <span>Rank: #{engine.result.position}</span>
                )}
                {engine.result.featureAnalysis && (
                  <div className="flex gap-2">
                    <span className="text-green-600">
                      Yes: {engine.result.featureAnalysis.yes}%
                    </span>
                    <span className="text-red-600">
                      No: {engine.result.featureAnalysis.no}%
                    </span>
                    <span className="text-muted-foreground">
                      Unknown: {engine.result.featureAnalysis.unknown}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Card>
  )
}

export function PersonaView() {
  const [queries, setQueries] = useState<Query[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const {
    selectedPersona,
    setStage,
    filterType,
    selectedBatchId,
    selectedTimePeriod,
  } = useJourneyStore()

  useEffect(() => {
    async function loadQueries() {
      if (!selectedPersona) return
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
      } finally {
        setIsLoading(false)
      }
    }

    loadQueries()
  }, [selectedPersona, filterType, selectedBatchId, selectedTimePeriod])

  if (isLoading) {
    return <LoadingState />
  }

  return (
    <div className="space-y-8">
      {/* Persona overview card */}
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setStage('vertical')}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              {selectedPersona === 'devops-lead' ? 'DevOps Lead' : 'Tech Lead'} Persona
            </h2>
            <p className="text-sm text-muted-foreground">
              Explore the buying journey stages
            </p>
          </div>
        </div>
      </Card>

      {/* Journey stages tabs */}
      <Tabs defaultValue="problem-exploration" className="space-y-4">
        <TabsList className="w-full justify-start">
          {stages.map((stage) => (
            <TabsTrigger key={stage.id} value={stage.id}>
              {stage.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {stages.map((stage) => (
          <TabsContent key={stage.id} value={stage.id} className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">{stage.label}</h3>
              <p className="text-sm text-muted-foreground">{stage.description}</p>
            </div>
            <div className="grid gap-4">
              {queries
                .filter((q) => q.stage === stage.id)
                .map((query) => (
                  <QueryCard key={query.id} query={query} />
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
} 