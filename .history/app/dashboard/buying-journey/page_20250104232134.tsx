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
import { ViewSelector } from "./components/view-selector"

export default function BuyingJourneyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const setSelectedCompanyId = useDashboardStore(state => state.setSelectedCompanyId)
  const selectedCompanyId = useDashboardStore(state => state.selectedCompanyId)

  // Set company ID from URL
  useEffect(() => {
    const companyId = searchParams.get('companyId')
    if (companyId) {
      setSelectedCompanyId(Number(companyId))
    } else if (!selectedCompanyId) {
      // If no company ID in URL and none selected, redirect to dashboard
      router.replace('/dashboard')
    }
  }, [searchParams, setSelectedCompanyId, selectedCompanyId, router])

  return (
    <ErrorBoundaryWrapper>
      <QueryProvider>
        <UrlStateProvider>
          <div className="space-y-6">
            <ProgressBar />
            <TimeControls />
            <Suspense fallback={<div>Loading...</div>}>
              <DashboardMetrics />
              <ViewSelector />
            </Suspense>
          </div>
        </UrlStateProvider>
      </QueryProvider>
    </ErrorBoundaryWrapper>
  )
} 