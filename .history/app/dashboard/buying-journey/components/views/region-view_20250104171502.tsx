'use client'

import { useEffect, useState } from 'react'
import { SelectionCard } from '../cards/selection-card'
import { useJourneyStore } from '../../store'
import { Vertical } from '../../types'
import { fetchVerticals } from '../../service'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { InfoIcon, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

function RegionMetricsPlaceholder() {
  return (
    <Card className="p-6 bg-muted/50">
      <div className="flex items-center gap-2 text-muted-foreground">
        <InfoIcon className="h-4 w-4" />
        <p className="text-sm">Region-specific metrics and trends will be available here in a future update</p>
      </div>
    </Card>
  )
}

function LoadingState() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-32 w-full" /> {/* Region metrics placeholder */}
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

export function RegionView() {
  const [verticals, setVerticals] = useState<Vertical[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { 
    selectedRegion,
    setSelectedVertical, 
    filterType, 
    selectedBatchId, 
    selectedTimePeriod,
    resetStages 
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
        return (
          <Alert variant="destructive">
            <AlertDescription>Failed to load verticals. Please try again.</AlertDescription>
          </Alert>
        )
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
      {/* Back button */}
      <Button
        variant="ghost"
        className="gap-2"
        onClick={() => resetStages()}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Regions
      </Button>

      {/* Region metrics placeholder */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Region Overview</h2>
        <RegionMetricsPlaceholder />
      </div>

      {/* Vertical selection */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">Select Vertical</h2>
          <p className="text-sm text-muted-foreground">
            {verticals.length} {verticals.length === 1 ? 'vertical' : 'verticals'} available
          </p>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {verticals.map((vertical) => (
            <SelectionCard
              key={vertical.id}
              title={vertical.name}
              description="Industry vertical analysis"
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