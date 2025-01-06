'use client'

import { useEffect, useState } from 'react'
import { useJourneyStore } from '../../store'
import { useDashboardStore } from '@/app/dashboard/store'
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

export function CompanyView() {
  const [regions, setRegions] = useState<Region[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  const { selectedCompanyId } = useDashboardStore()
  const { 
    filterType, 
    selectedBatchId, 
    selectedTimePeriod,
    setStage,
    setSelectedRegion 
  } = useJourneyStore()

  useEffect(() => {
    async function loadRegions() {
      if (!selectedCompanyId) return
      
      setIsLoading(true)
      try {
        const data = await fetchRegions(selectedCompanyId, {
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
  }, [filterType, selectedBatchId, selectedTimePeriod, selectedCompanyId])

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

      {/* Regions grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">Geographic Regions</h2>
          <p className="text-sm text-muted-foreground">
            {regions.length} {regions.length === 1 ? 'region' : 'regions'} available
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {regions.length === 0 ? (
            <Card className="p-6 col-span-full">
              <div className="flex items-center gap-2 text-muted-foreground">
                <InfoIcon className="h-4 w-4" />
                <p>No regions available</p>
              </div>
            </Card>
          ) : (
            regions.map((region) => (
              <Card
                key={region.id}
                className="p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => {
                  setSelectedRegion(region.id)
                  setStage('region')
                }}
              >
                <div className="space-y-4">
                  <h3 className="font-medium">{region.name}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Sentiment</p>
                      <p className="font-medium">{region.metrics.sentiment.toFixed(1)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Position</p>
                      <p className="font-medium">{region.metrics.position.toFixed(1)}</p>
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