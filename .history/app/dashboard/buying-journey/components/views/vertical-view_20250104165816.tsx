'use client'

import { useEffect, useState } from 'react'
import { SelectionCard } from '../cards/selection-card'
import { useJourneyStore } from '../../store'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { Persona } from '../../types'
import { fetchPersonas } from '../../service'
import { Skeleton } from '@/components/ui/skeleton'

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
        <Skeleton className="h-6 w-36" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-4 w-48 mt-1" />
              </div>
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
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-4 w-48 mt-1" />
              </div>
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
        </div>
      </div>
    </div>
  )
}

export function VerticalView() {
  const [personas, setPersonas] = useState<Persona[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const {
    selectedVertical,
    setSelectedPersona,
    setStage,
    filterType,
    selectedBatchId,
    selectedTimePeriod,
  } = useJourneyStore()

  useEffect(() => {
    async function loadPersonas() {
      if (!selectedVertical) return
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
      } finally {
        setIsLoading(false)
      }
    }

    loadPersonas()
  }, [selectedVertical, filterType, selectedBatchId, selectedTimePeriod])

  if (isLoading) {
    return <LoadingState />
  }

  return (
    <div className="space-y-8">
      {/* Vertical overview card */}
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setStage('region')}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              {selectedVertical === 'enterprise-software'
                ? 'Enterprise Software'
                : 'Financial Services'} Vertical
            </h2>
            <p className="text-sm text-muted-foreground">
              Select a persona to explore their buying journey
            </p>
          </div>
        </div>
      </Card>

      {/* Personas grid */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Available Personas</h3>
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