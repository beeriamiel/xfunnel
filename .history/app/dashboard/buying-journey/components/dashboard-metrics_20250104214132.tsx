'use client'

import { TrendChart } from "./trend-chart"
import { MetricsDisplay } from "./metrics-display"
import { ViewSelector } from "./view-selector"
import { useBuyingJourney } from "../hooks/use-buying-journey"

export function DashboardMetrics() {
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