"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, Target, Building2, ThumbsUp, ChevronRight, AlertCircle, Gauge } from "lucide-react"
import { motion } from "framer-motion"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts"
import { Button } from "@/components/ui/button"
import useSWR from 'swr'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { getAnalysisByRegion } from "../../lib/api"
import type { RegionAnalysis } from "../../lib/api"
import { useDashboardStore } from "@/app/dashboard/store"

interface RegionsProps {
  companyId: number | null
  onSelectRegion: (region: string) => void
}

const METRICS = [
  {
    key: 'companyMentioned',
    label: 'Company Mentioned',
    icon: Building2,
    formatter: (value: number) => `${value.toFixed(0)}%`,
    color: 'text-green-500'
  },
  {
    key: 'rankingPosition',
    label: 'Average Position',
    icon: Target,
    formatter: (value: number) => value.toFixed(1),
    color: 'text-purple-500'
  },
  {
    key: 'featureScore',
    label: 'Feature Score',
    icon: ThumbsUp,
    formatter: (value: number) => `${value.toFixed(0)}%`,
    color: 'text-orange-500'
  },
  {
    key: 'sentimentScore',
    label: 'Average Sentiment',
    icon: Gauge,
    formatter: (value: number) => `${value.toFixed(0)}%`,
    color: 'text-blue-500'
  }
] as const

type MetricKey = typeof METRICS[number]['key']

const REGION_COLORS: Record<string, string> = {
  'Americas': 'rgb(59, 130, 246)', // blue-500
  'EMEA': 'rgb(168, 85, 247)',     // purple-500
  'APAC': 'rgb(34, 197, 94)',      // green-500
  'Unknown': 'rgb(156, 163, 175)'  // gray-400
}

export function Regions({ companyId, onSelectRegion }: RegionsProps) {
  const [selectedMetric, setSelectedMetric] = React.useState<MetricKey>('companyMentioned')
  const timePeriod = useDashboardStore(state => state.timePeriod)

  // Fetch data using SWR
  const { data, error, isLoading } = useSWR(
    companyId ? `region-analysis-${companyId}-${timePeriod}` : null,
    () => companyId ? getAnalysisByRegion(companyId, timePeriod) : null
  )

  // Prepare data for the timeline chart - moved before conditional returns
  const timelineData = React.useMemo(() => {
    if (!data?.length) return []
    
    const allDates = data.flatMap(region => 
      region.timelineData.map(t => t.date)
    ).filter((date, index, self) => self.indexOf(date) === index)
    .sort()

    return allDates.map(date => ({
      date,
      ...data.reduce((acc, region) => {
        const dayData = region.timelineData.find(t => t.date === date)
        return {
          ...acc,
          [region.region]: dayData?.metrics[selectedMetric] ?? null
        }
      }, {})
    }))
  }, [data, selectedMetric])

  // Error state
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load region analysis data. Please try again later.
        </AlertDescription>
      </Alert>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((index) => (
            <Card key={index} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-8 w-28" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                {METRICS.map((metric) => (
                  <div key={metric.key} className="space-y-2">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
        <Card className="p-6">
          <Skeleton className="h-[400px] w-full" />
        </Card>
      </div>
    )
  }

  // No data state
  if (!data?.length) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No region analysis data available for this company.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Region Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data.map((region, index) => (
          <motion.div
            key={region.region}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{region.region}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() => onSelectRegion(region.region)}
                >
                  View Verticals
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {METRICS.map((metric) => {
                  const Icon = metric.icon
                  const value = region.metrics[metric.key]

                  return (
                    <div key={metric.key} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className={metric.color}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-medium">
                          {metric.formatter(value)}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {metric.label}
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Timeline Chart */}
      <Card className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-medium">Regional Performance Over Time</h3>
          <div className="text-sm text-muted-foreground">
            Showing {timePeriod} data for the last {timePeriod === 'weekly' ? '12 weeks' : '12 months'}
          </div>
          <Tabs
            value={selectedMetric}
            onValueChange={(value) => setSelectedMetric(value as MetricKey)}
            className="w-full mt-4"
          >
            <TabsList>
              {METRICS.map((metric) => (
                <TabsTrigger key={metric.key} value={metric.key} className="flex items-center gap-2">
                  <metric.icon className="h-4 w-4" />
                  {metric.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={timelineData}
              margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                className="text-xs"
              />
              <YAxis
                domain={selectedMetric === 'rankingPosition' ? [1, 'auto'] : [0, 100]}
                tickFormatter={
                  selectedMetric === 'rankingPosition'
                    ? (value: number) => value.toFixed(1)
                    : (value: number) => `${value}%`
                }
                className="text-xs"
              />
              <Tooltip
                formatter={(value: number) => 
                  selectedMetric === 'rankingPosition'
                    ? value.toFixed(1)
                    : `${value.toFixed(0)}%`
                }
              />
              <Legend />
              {data.map((region) => (
                <Line
                  key={region.region}
                  type="monotone"
                  dataKey={region.region}
                  name={region.region}
                  stroke={REGION_COLORS[region.region] || REGION_COLORS['Unknown']}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 8 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  )
} 