import { Metadata } from "next"
import { Suspense } from "react"
import { ProgressBar } from "./components/progress-bar"
import { TimeControls } from "./components/time-controls"
import { ErrorBoundaryWrapper } from "./components/error-boundary-wrapper"
import { UrlStateProvider } from "./components/url-state-provider"
import { QueryProvider } from "./components/query-provider"
import { DashboardMetrics } from "./components/dashboard-metrics"

export const metadata: Metadata = {
  title: "Buying Journey Dashboard",
  description: "Analyze your company's performance across different segments and stages.",
}

export default function BuyingJourneyPage() {
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