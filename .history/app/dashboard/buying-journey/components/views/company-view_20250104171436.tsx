'use client'

import { useEffect, useState } from 'react'
import { SelectionCard } from '../cards/selection-card'
import { useJourneyStore } from '../../store'
import { Region } from '../../types'
import { fetchRegions } from '../../service'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { InfoIcon } from 'lucide-react'

function CompanyMetricsPlaceholder() {
  return (
    <Card className="p-6 bg-muted/50">
      <div className="flex items-center gap-2 text-muted-foreground">
        <InfoIcon className="h-4 w-4" />
        <p className="text-sm">Company-wide metrics and trends will be available here in a future update</p>
      </div>
    </Card>
  )
}

function LoadingState() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-32 w-full" /> {/* Company metrics placeholder */}
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

export function CompanyView() {
  const [regions, setRegions] = useState<Region[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { setSelectedRegion, filterType, selectedBatchId, selectedTimePeriod } = useJourneyStore()

  useEffect(() => {
    async function loadRegions() {
      setIsLoading(true)
      try {
        const data = await fetchRegions(1, {
          type: filterType,
          batchId: selectedBatchId || undefined,
          timePeriod: selectedTimePeriod || undefined,
        })
        setRegions(data)
      } catch (error) {
        console.error('Error loading regions:', error)
        return (
          <Alert variant="destructive">
            <AlertDescription>Failed to load regions. Please try again.</AlertDescription>
          </Alert>
        )
      } finally {
        setIsLoading(false)
      }
    }

    loadRegions()
  }, [filterType, selectedBatchId, selectedTimePeriod])

  if (isLoading) {
    return <LoadingState />
  }

  return (
    <div className="space-y-8">
      {/* Company metrics placeholder */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Company Overview</h2>
        <CompanyMetricsPlaceholder />
      </div>

      {/* Region selection */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">Select Region</h2>
          <p className="text-sm text-muted-foreground">
            {regions.length} {regions.length === 1 ? 'region' : 'regions'} available
          </p>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {regions.map((region) => (
            <SelectionCard
              key={region.id}
              title={region.name}
              description="Regional market analysis"
              metrics={[
                {
                  label: 'Avg. Sentiment',
                  value: region.metrics.sentiment,
                  change: region.metrics.changes?.sentiment
                },
                {
                  label: 'Avg. Position',
                  value: region.metrics.position,
                  change: region.metrics.changes?.position
                },
                {
                  label: 'Company Mentioned',
                  value: region.metrics.mentioned,
                  change: region.metrics.changes?.mentioned
                },
                {
                  label: 'Feature Score',
                  value: region.metrics.featureScore,
                  change: region.metrics.changes?.featureScore
                }
              ]}
              onClick={() => setSelectedRegion(region.id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
} 