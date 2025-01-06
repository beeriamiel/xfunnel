import { Metadata } from "next"
import { Suspense } from "react"
import { ProgressBar } from "./components/progress-bar"
import { MetricsDisplay } from "./components/metrics-display"
import { CompanyView } from "./components/views/company-view"
import { RegionView } from "./components/views/region-view"
import { VerticalView } from "./components/views/vertical-view"
import { PersonaView } from "./components/views/persona-view"
import { QueryView } from "./components/views/query-view"
import { TimeControls } from "./components/time-controls"
import { TrendChart } from "./components/trend-chart"
import { ErrorBoundaryWrapper } from "./components/error-boundary-wrapper"
import { UrlStateProvider } from "./components/url-state-provider"
import { QueryProvider } from "./components/query-provider"
import { useBuyingJourneyStore } from "./store"
import { useBuyingJourney } from "./hooks/use-buying-journey"

export const metadata: Metadata = {
  title: "Buying Journey Dashboard",
  description: "Analyze your company's performance across different segments and stages.",
}

function ViewSelector() {
  const { currentStage } = useBuyingJourneyStore()

  switch (currentStage) {
    case "company":
      return <CompanyView />
    case "region":
      return <RegionView />
    case "vertical":
      return <VerticalView />
    case "persona":
      return <PersonaView />
    case "query":
      return <QueryView />
    default:
      return null
  }
}

function DashboardContent() {
  const { metrics, trends } = useBuyingJourney()

  return (
    <div className="space-y-8">
      <MetricsDisplay metrics={metrics || {
        companyMentioned: 0,
        averagePosition: 0,
        featureScore: 0,
        averageSentiment: 0,
        changeFromPrevious: {
          companyMentioned: 0,
          averagePosition: 0,
          featureScore: 0,
          averageSentiment: 0,
        },
      }} />
      <ViewSelector />
      <div className="grid gap-4 md:grid-cols-2">
        <TrendChart
          title="Company Mentions Over Time"
          description="Track how often your company is mentioned across different contexts."
          dataKey="companyMentioned"
          data={trends || []}
        />
        <TrendChart
          title="Average Sentiment Over Time"
          description="Monitor the sentiment of discussions involving your company."
          dataKey="averageSentiment"
          color="hsl(var(--success))"
          data={trends || []}
        />
      </div>
    </div>
  )
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
              <DashboardContent />
            </Suspense>
          </div>
        </ErrorBoundaryWrapper>
      </UrlStateProvider>
    </QueryProvider>
  )
} 