'use client'

import { Suspense } from 'react'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

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
  return (
    <Suspense fallback={<BuyingJourneyLoading />}>
      <div className="flex flex-col min-h-screen">
        {/* Progress bar will go here */}
        <div className="flex-1 container mx-auto py-6">
          {/* View components will be rendered here */}
        </div>
      </div>
    </Suspense>
  )
} 