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
  
  // Single effect to handle URL sync
  useEffect(() => {
    const companyId = searchParams.get('companyId')
    
    // If URL has company ID but store doesn't match, update store
    if (companyId) {
      const id = Number(companyId)
      if (!isNaN(id) && id > 0 && id !== selectedCompanyId) {
        setSelectedCompanyId(id)
      }
    } 
    // If no company ID in URL, redirect to dashboard
    else if (!companyId) {
      router.replace('/dashboard')
    }
  }, [searchParams, selectedCompanyId, setSelectedCompanyId, router])

  // Don't render anything while redirecting
  if (!selectedCompanyId) {
    return null
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