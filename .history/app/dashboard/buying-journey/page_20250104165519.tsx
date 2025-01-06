'use client'

import { Suspense } from 'react'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { JourneyProgressBar } from './components/journey-progress/progress-bar'
import { CompanyView } from './components/views/company-view'
import { RegionView } from './components/views/region-view'
import { VerticalView } from './components/views/vertical-view'
import { PersonaView } from './components/views/persona-view'
import { TimeFilter } from './components/filters/time-filter'
import { useJourneyStore } from './store'

function BuyingJourneyLoading() {
  return (
    <div className="space-y-4 p-8">
      <Card className="p-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        </div>
      </Card>
    </div>
  )
}

export default function BuyingJourneyPage() {
  const { currentStage, completedStages } = useJourneyStore()

  return (
    <Suspense fallback={<BuyingJourneyLoading />}>
      <div className="flex flex-col min-h-screen">
        <JourneyProgressBar
          currentStage={currentStage}
          completedStages={completedStages}
        />
        <div className="flex-1 container mx-auto py-6">
          <div className="mb-6">
            <TimeFilter />
          </div>
          {currentStage === 'company' && <CompanyView />}
          {currentStage === 'region' && <RegionView />}
          {currentStage === 'vertical' && <VerticalView />}
          {currentStage === 'persona' && <PersonaView />}
        </div>
      </div>
    </Suspense>
  )
} 