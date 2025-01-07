"use client"

import * as React from "react"
import { Building2, Target, ThumbsUp, Gauge } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TimePeriod } from "@/app/dashboard/store"
import { cn } from "@/lib/utils"

interface MetricsHeaderProps {
  metrics: {
    companyMentioned: number
    rankingPosition: number
    featureScore: number
    sentimentScore: number
  }
  timePeriod: TimePeriod
  onTimePeriodChange: (value: TimePeriod) => void
  className?: string
}

const METRICS = [
  {
    key: 'companyMentioned',
    label: 'Company Mentioned',
    icon: Building2,
    formatter: (value: number) => `${value.toFixed(0)}%`,
    color: 'text-purple-500'
  },
  {
    key: 'rankingPosition',
    label: 'Average Position',
    icon: Target,
    formatter: (value: number) => value.toFixed(1),
    color: 'text-pink-500'
  },
  {
    key: 'featureScore',
    label: 'Feature Score',
    icon: ThumbsUp,
    formatter: (value: number) => `${value.toFixed(0)}%`,
    color: 'text-fuchsia-500'
  },
  {
    key: 'sentimentScore',
    label: 'Average Sentiment',
    icon: Gauge,
    formatter: (value: number) => `${value.toFixed(0)}%`,
    color: 'text-violet-500'
  }
] as const

export function MetricsHeader({ metrics, timePeriod, onTimePeriodChange, className }: MetricsHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between px-4 py-2 border-b", className)}>
      <div className="flex items-center space-x-6">
        {METRICS.map((metric) => {
          const Icon = metric.icon
          const value = metrics[metric.key as keyof typeof metrics]

          return (
            <div key={metric.key} className="flex items-center space-x-2">
              <div className={cn("p-1.5 rounded-md bg-background", metric.color)}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium">
                  {metric.formatter(value)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {metric.label}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      <Tabs
        value={timePeriod}
        onValueChange={(value) => onTimePeriodChange(value as TimePeriod)}
        className="w-auto"
      >
        <TabsList className="grid w-[250px] grid-cols-3">
          <TabsTrigger value="batch">By Batch</TabsTrigger>
          <TabsTrigger value="weekly">By Week</TabsTrigger>
          <TabsTrigger value="monthly">By Month</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  )
} 