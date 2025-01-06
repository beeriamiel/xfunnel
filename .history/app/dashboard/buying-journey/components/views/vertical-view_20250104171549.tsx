'use client'

import { useEffect, useState } from 'react'
import { SelectionCard } from '../cards/selection-card'
import { useJourneyStore } from '../../store'
import { Persona } from '../../types'
import { fetchPersonas } from '../../service'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { InfoIcon, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

function VerticalMetricsPlaceholder() {
  return (
    <Card className="p-6 bg-muted/50">
      <div className="flex items-center gap-2 text-muted-foreground">
        <InfoIcon className="h-4 w-4" />
        <p className="text-sm">Vertical-specific metrics and trends will be available here in a future update</p>
      </div>
    </Card>
  )
}

function LoadingState() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-32 w-full" /> {/* Vertical metrics placeholder */}
      <Skeleton className="h-8 w-48" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-6 w-24" />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-8 w-24" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-8 w-24" />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

export function VerticalView() {
  const [personas, setPersonas] = useState<Persona[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { 
    selectedRegion,
    selectedVertical,
    setSelectedPersona, 
    filterType, 
    selectedBatchId, 
    selectedTimePeriod,
    setStage 
  } = useJourneyStore()

  useEffect(() => {
    async function loadPersonas() {
      if (!selectedRegion || !selectedVertical) return
      
      setIsLoading(true)
      try {
        const data = await fetchPersonas(1, selectedVertical, {
          type: filterType,
          batchId: selectedBatchId || undefined,
          timePeriod: selectedTimePeriod || undefined,
        })
        setPersonas(data)
      } catch (error) {
        console.error('Error loading personas:', error)
        return (
          <Alert variant="destructive">
            <AlertDescription>Failed to load personas. Please try again.</AlertDescription>
          </Alert>
        )
      } finally {
        setIsLoading(false)
      }
    }

    loadPersonas()
  }, [selectedRegion, selectedVertical, filterType, selectedBatchId, selectedTimePeriod])

  if (isLoading) {
    return <LoadingState />
  }

  return (
    <div className="space-y-8">
      {/* Back button */}
      <Button
        variant="ghost"
        className="gap-2"
        onClick={() => setStage('region')}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Verticals
      </Button>

      {/* Vertical metrics placeholder */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Vertical Overview</h2>
        <VerticalMetricsPlaceholder />
      </div>

      {/* Persona selection */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">Select Persona</h2>
          <p className="text-sm text-muted-foreground">
            {personas.length} {personas.length === 1 ? 'persona' : 'personas'} available
          </p>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {personas.map((persona) => (
            <SelectionCard
              key={persona.id}
              title={persona.name}
              description={persona.description}
              metrics={[
                {
                  label: 'Avg. Sentiment',
                  value: persona.metrics.sentiment,
                  change: persona.metrics.changes?.sentiment
                },
                {
                  label: 'Avg. Position',
                  value: persona.metrics.position,
                  change: persona.metrics.changes?.position
                },
                {
                  label: 'Company Mentioned',
                  value: persona.metrics.mentioned,
                  change: persona.metrics.changes?.mentioned
                },
                {
                  label: 'Feature Score',
                  value: persona.metrics.featureScore,
                  change: persona.metrics.changes?.featureScore
                }
              ]}
              onClick={() => setSelectedPersona(persona.id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
} 