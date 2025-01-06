'use client'

import { Suspense, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ProgressBar } from "./components/progress-bar"
import { TimeControls } from "./components/time-controls"
import { ErrorBoundaryWrapper } from "./components/error-boundary-wrapper"
import { UrlStateProvider } from "./components/url-state-provider"
import { QueryProvider } from "./components/query-provider"
import { DashboardMetrics } from "./components/dashboard-metrics"
import { useDashboardStore } from "../store"

export default function BuyingJourneyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const setSelectedCompanyId = useDashboardStore(state => state.setSelectedCompanyId)
  const selectedCompanyId = useDashboardStore(state => state.selectedCompanyId)
  
  // Set company ID from URL if provided
  useEffect(() => {
    const companyId = searchParams.get('companyId')
    if (companyId) {
      setSelectedCompanyId(Number(companyId))
    } else if (!selectedCompanyId) {
      // If no company ID in URL and none selected, redirect to dashboard
      router.push('/dashboard')
    }
  }, [searchParams, setSelectedCompanyId, selectedCompanyId, router])

  if (!selectedCompanyId) {
    return null // Don't render anything while redirecting or if no company selected
  }

  return (
    <QueryProvider>
      <UrlStateProvider>
        <ErrorBoundaryWrapper>
          <div className="flex flex-col gap-8 p-6">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-bold tracking-tight">Buying Journey Analysis</h1>
              <p className="text-muted-foreground">
                Analyze performance across regions, verticals, personas, and queries.
              </p>
            </div>

            <TimeControls />

            <Suspense fallback={<div className="h-12 bg-muted animate-pulse rounded-lg" />}>
              <ProgressBar />
            </Suspense>

            <Suspense fallback={<div className="h-[400px] bg-muted animate-pulse rounded-lg" />}>
              <DashboardMetrics />
            </Suspense>
          </div>
        </ErrorBoundaryWrapper>
      </UrlStateProvider>
    </QueryProvider>
  )
} 