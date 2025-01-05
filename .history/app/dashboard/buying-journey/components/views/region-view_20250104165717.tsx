'use client'

import { useEffect, useState } from 'react'
import { SelectionCard } from '../cards/selection-card'
import { useJourneyStore } from '../../store'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { Vertical } from '../../types'
import { fetchVerticals } from '../../service'
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
          <Card className="p-6">
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
        </div>
      </div>
    </div>
  )
}

export function RegionView() {
  const [verticals, setVerticals] = useState<Vertical[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const {
    selectedRegion,
    setSelectedVertical,
    resetStages,
    filterType,
    selectedBatchId,
    selectedTimePeriod,
  } = useJourneyStore()

  useEffect(() => {
    async function loadVerticals() {
      if (!selectedRegion) return
      setIsLoading(true)
      try {
        const data = await fetchVerticals(1, selectedRegion, {
          type: filterType,
          batchId: selectedBatchId || undefined,
          timePeriod: selectedTimePeriod || undefined,
        })
        setVerticals(data)
      } catch (error) {
        console.error('Error loading verticals:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadVerticals()
  }, [selectedRegion, filterType, selectedBatchId, selectedTimePeriod])

  if (isLoading) {
    return <LoadingState />
  }

  return (
    <div className="space-y-8">
      {/* Region overview card */}
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={resetStages}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              {selectedRegion === 'americas' ? 'Americas' : 'EMEA'} Region
            </h2>
            <p className="text-sm text-muted-foreground">
              Select a vertical to explore more details
            </p>
          </div>
        </div>
      </Card>

      {/* Verticals grid */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Available Verticals</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {verticals.map((vertical) => (
            <SelectionCard
              key={vertical.id}
              title={vertical.name}
              metrics={[
                {
                  label: 'Avg. Sentiment',
                  value: vertical.metrics.sentiment,
                  change: vertical.metrics.changes?.sentiment
                },
                {
                  label: 'Avg. Position',
                  value: vertical.metrics.position,
                  change: vertical.metrics.changes?.position
                },
                {
                  label: 'Company Mentioned',
                  value: vertical.metrics.mentioned,
                  change: vertical.metrics.changes?.mentioned
                },
                {
                  label: 'Feature Score',
                  value: vertical.metrics.featureScore,
                  change: vertical.metrics.changes?.featureScore
                }
              ]}
              onClick={() => setSelectedVertical(vertical.id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
} 