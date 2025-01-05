"use client"

import { ArrowDown, ArrowUp, Percent, Hash, Star, MessageSquare } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Metrics } from "../types"

interface MetricsDisplayProps {
  metrics: Metrics
  title?: string
  className?: string
}

const metricConfigs = [
  {
    key: "companyMentioned" as const,
    label: "Company Mentioned",
    icon: Hash,
    formatter: (value: number) => value.toLocaleString(),
  },
  {
    key: "averagePosition" as const,
    label: "Average Position",
    icon: Star,
    formatter: (value: number) => value.toFixed(1),
  },
  {
    key: "featureScore" as const,
    label: "Feature Score",
    icon: Percent,
    formatter: (value: number) => `${(value * 100).toFixed(1)}%`,
  },
  {
    key: "averageSentiment" as const,
    label: "Average Sentiment",
    icon: MessageSquare,
    formatter: (value: number) => value.toFixed(2),
  },
]

export function MetricsDisplay({ metrics, title, className }: MetricsDisplayProps) {
  return (
    <div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-4", className)}>
      {metricConfigs.map((config) => {
        const value = metrics[config.key]
        const change = metrics.changeFromPrevious?.[config.key]
        const Icon = config.icon

        return (
          <Card key={config.key}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {config.label}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {config.formatter(value)}
              </div>
              {change != null && (
                <p className={cn(
                  "flex items-center text-xs",
                  change > 0 ? "text-green-500" : "text-red-500"
                )}>
                  {change > 0 ? (
                    <ArrowUp className="mr-1 h-4 w-4" />
                  ) : (
                    <ArrowDown className="mr-1 h-4 w-4" />
                  )}
                  <span>
                    {Math.abs(change).toFixed(1)}% from previous
                  </span>
                </p>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
} 