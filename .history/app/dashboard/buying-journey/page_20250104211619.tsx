import { Metadata } from "next"
import { Suspense } from "react"
import { ProgressBar } from "./components/progress-bar"
import { MetricsDisplay } from "./components/metrics-display"
import { StageView } from "./components/stage-view"
import { TimeControls } from "./components/time-controls"
import { TrendChart } from "./components/trend-chart"
import { UrlStateProvider } from "./components/url-state-provider"
import { ErrorBoundaryWrapper } from "./components/error-boundary-wrapper"
import { QueryProvider } from "./components/query-provider"
import { useBuyingJourney } from "./hooks/use-buying-journey"

export const metadata: Metadata = {
  title: "Buying Journey Dashboard",
  description: "Analyze your company's performance across different segments and stages.",
}

function DashboardContent() {
  const { metrics, trends, isLoading } = useBuyingJourney()

  return (
    <div className="space-y-8">
      <MetricsDisplay metrics={metrics || {
        companyMentioned: 0,
        averagePosition: 0,
        featureScore: 0,
        averageSentiment: 0,
      }} />
      
      <div className="grid gap-6 md:grid-cols-2">
        <TrendChart
          title="Company Mentions Over Time"
          description="Total number of times your company was mentioned"
          data={trends?.mentions || []}
          dataKey="value"
          isLoading={isLoading}
        />
        <TrendChart
          title="Average Sentiment Trend"
          description="Sentiment score trends over time"
          data={trends?.sentiment || []}
          dataKey="value"
          color="hsl(var(--success))"
          isLoading={isLoading}
        />
      </div>

      <StageView />
    </div>
  )
}

export default async function BuyingJourneyPage() {
  return (
    <QueryProvider>
      <UrlStateProvider>
        <div className="flex flex-col gap-8 p-6">
          <div className="flex flex-col gap-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Buying Journey Analysis</h1>
                <p className="text-muted-foreground">
                  Analyze performance across regions, verticals, personas, and queries.
                </p>
              </div>
              <TimeControls />
            </div>
          </div>

          <Suspense fallback={<div className="h-12 bg-muted animate-pulse rounded-lg" />}>
            <ProgressBar />
          </Suspense>

          <Suspense fallback={<div className="h-[400px] bg-muted animate-pulse rounded-lg" />}>
            <ErrorBoundaryWrapper>
              <DashboardContent />
            </ErrorBoundaryWrapper>
          </Suspense>
        </div>
      </UrlStateProvider>
    </QueryProvider>
  )
} 