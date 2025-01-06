'use client'

import { Suspense } from 'react'
import { DashboardContent } from './components/dashboard-content'
import { Skeleton } from '@/components/ui/skeleton'

export default function Page() {
  return (
    <Suspense fallback={<Skeleton className="h-[calc(100vh-8rem)]" />}>
      <DashboardContent />
    </Suspense>
  )
}
