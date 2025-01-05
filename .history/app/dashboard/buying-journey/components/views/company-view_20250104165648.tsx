'use client'

import { useEffect, useState } from 'react'
import { SelectionCard } from '../cards/selection-card'
import { useJourneyStore } from '../../store'
import { Region } from '../../types'
import { fetchRegions } from '../../service'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

function LoadingState() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
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
      {/* Company overview metrics will go here */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Select Region</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {regions.map((region) => (
            <SelectionCard
              key={region.id}
              title={region.name}
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