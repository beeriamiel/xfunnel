'use client'

import { TrendChart } from "./trend-chart"
import { MetricsDisplay } from "./metrics-display"
import { ViewSelector } from "./view-selector"
import { useBuyingJourney } from "../hooks/use-buying-journey"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

function LoadingSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid gap-4 grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-4">
            <Skeleton className="h-4 w-[100px] mb-2" />
            <Skeleton className="h-8 w-[120px] mb-2" />
            <Skeleton className="h-4 w-[80px]" />
          </Card>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-4">
          <Skeleton className="h-[200px]" />
        </Card>
        <Card className="p-4">
          <Skeleton className="h-[200px]" />
        </Card>
      </div>
    </div>
  )
}

export function DashboardMetrics() {
  const { metrics, trends, isLoading } = useBuyingJourney()

  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (!metrics) {
    return null
  }

  return (
    <div className="space-y-8">
      <MetricsDisplay metrics={metrics} />
      <ViewSelector />
      <div className="grid gap-4 md:grid-cols-2">
        <TrendChart
          title="Company Mentions Over Time"
          description="Track how often your company is mentioned across different contexts."
          dataKey="companyMentioned"
          data={trends}
        />
        <TrendChart
          title="Average Sentiment Over Time"
          description="Monitor the sentiment of discussions involving your company."
          dataKey="averageSentiment"
          color="hsl(var(--success))"
          data={trends}
        />
      </div>
    </div>
  )
} 