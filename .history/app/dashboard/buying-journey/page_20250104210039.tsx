import { Metadata } from "next"
import { Suspense } from "react"
import { ProgressBar } from "./components/progress-bar"
import { MetricsDisplay } from "./components/metrics-display"
import { StageView } from "./components/stage-view"
import { TimeControls } from "./components/time-controls"

export const metadata: Metadata = {
  title: "Buying Journey Dashboard",
  description: "Analyze your company's performance across different segments and stages.",
}

const mockMetrics = {
  companyMentioned: 2350,
  averagePosition: 4.2,
  featureScore: 0.85,
  averageSentiment: 0.76,
  changeFromPrevious: {
    companyMentioned: 20.1,
    averagePosition: -5.3,
    featureScore: 15.2,
    averageSentiment: 8.7,
  },
}

export default async function BuyingJourneyPage() {
  return (
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
        <div className="space-y-8">
          <MetricsDisplay metrics={mockMetrics} />
          <StageView />
        </div>
      </Suspense>
    </div>
  )
} 