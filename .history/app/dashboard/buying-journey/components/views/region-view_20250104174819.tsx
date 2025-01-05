'use client'

import { useEffect, useState } from 'react'
import { useJourneyStore } from '../../store'
import { useDashboardStore } from '@/app/dashboard/store'
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4">
            <div className="space-y-4">
              <Skeleton className="h-6 w-3/4" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
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
  
  const { selectedCompanyId } = useDashboardStore()
  const { 
    selectedRegion,
    filterType, 
    selectedBatchId, 
    selectedTimePeriod,
    setStage,
    setSelectedVertical 
  } = useJourneyStore()

  useEffect(() => {
    async function loadVerticals() {
      if (!selectedRegion || !selectedCompanyId) return
      
      setIsLoading(true)
      try {
        const data = await fetchVerticals(selectedCompanyId, selectedRegion, {
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
  }, [selectedRegion, filterType, selectedBatchId, selectedTimePeriod, selectedCompanyId])

  if (isLoading) {
    return <LoadingState />
  }

  return (
    <div className="space-y-8">
      {/* Back button */}
      <Button
        variant="ghost"
        className="gap-2"
        onClick={() => setStage('company')}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Regions
      </Button>

      {/* Region metrics placeholder */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Region Overview</h2>
        <RegionMetricsPlaceholder />
      </div>

      {/* Verticals grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">Industry Verticals</h2>
          <p className="text-sm text-muted-foreground">
            {verticals.length} {verticals.length === 1 ? 'vertical' : 'verticals'} available
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {verticals.length === 0 ? (
            <Card className="p-6 col-span-full">
              <div className="flex items-center gap-2 text-muted-foreground">
                <InfoIcon className="h-4 w-4" />
                <p>No verticals available for this region</p>
              </div>
            </Card>
          ) : (
            verticals.map((vertical) => (
              <Card
                key={vertical.id}
                className="p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => {
                  setSelectedVertical(vertical.id)
                  setStage('vertical')
                }}
              >
                <div className="space-y-4">
                  <h3 className="font-medium">{vertical.name}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Sentiment</p>
                      <p className="font-medium">{vertical.metrics.sentiment.toFixed(1)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Position</p>
                      <p className="font-medium">{vertical.metrics.position.toFixed(1)}</p>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
} 