"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, Target, Building2, ThumbsUp, ChevronRight, AlertCircle, Gauge, Calendar, FileText } from "lucide-react"
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
import { useDashboardStore, type TimePeriod } from "@/app/dashboard/store"
import { cn } from "@/lib/utils"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import {
  getCompanyMentionedColor,
  getRankingPositionColor,
  getFeatureScoreColor,
  getSentimentColor
} from "../../lib/colors"
import { formatRegionName } from "../../lib/format"

interface RegionsProps {
  companyId: number | null;
  accountId: string;
  onSelectRegion: (region: string) => void;
}

const METRICS = [
  {
    key: 'companyMentioned',
    label: 'Company Mentioned',
    icon: Building2,
    formatter: (value: number) => `${value.toFixed(0)}%`,
    color: 'rgb(79, 70, 229)' // indigo-600 for SearchGPT
  },
  {
    key: 'rankingPosition',
    label: 'Average Position',
    icon: Target,
    formatter: (value: number) => value.toFixed(1),
    color: 'rgb(147, 51, 234)' // purple-600 for Perplexity
  },
  {
    key: 'featureScore',
    label: 'Feature Score',
    icon: ThumbsUp,
    formatter: (value: number) => `${value.toFixed(0)}%`,
    color: 'rgb(219, 39, 119)' // pink-600 for Gemini
  },
  {
    key: 'sentimentScore',
    label: 'Average Sentiment',
    icon: Brain,
    formatter: (value: number) => `${value.toFixed(0)}%`,
    color: 'rgb(37, 99, 235)' // blue-600 for Claude
  }
] as const

type MetricKey = typeof METRICS[number]['key']

const REGION_COLORS: Record<string, string> = {
  'Americas': 'rgb(59, 130, 246)', // blue-500
  'EMEA': 'rgb(168, 85, 247)',     // purple-500
  'APAC': 'rgb(34, 197, 94)',      // green-500
  'Unknown': 'rgb(156, 163, 175)'  // gray-400
}

export function Regions({ companyId, accountId, onSelectRegion }: RegionsProps) {
  const [selectedMetric, setSelectedMetric] = React.useState<MetricKey>('companyMentioned')
  const timePeriod = useDashboardStore(state => state.timePeriod)
  const setTimePeriod = useDashboardStore(state => state.setTimePeriod)

  // Fetch data using SWR
  const { data, error, isLoading } = useSWR(
    companyId ? `region-analysis-${companyId}-${timePeriod}` : null,
    () => companyId ? getAnalysisByRegion(companyId, accountId, timePeriod) : null
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
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side Column */}
        <div className="lg:col-span-4 space-y-4">
          {/* Time Period Section */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground">Time Period</span>
            <div className="bg-muted/10 p-1 rounded-lg flex items-center">
              <button
                onClick={() => setTimePeriod('weekly')}
                className={cn(
                  "px-3 h-7 rounded-md transition-all duration-200",
                  "text-sm font-medium",
                  "flex items-center gap-1.5",
                  timePeriod === 'weekly'
                    ? "bg-background text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/5"
                )}
              >
                <FileText className="h-4 w-4" />
                By Week
              </button>
              <button
                onClick={() => setTimePeriod('monthly')}
                className={cn(
                  "px-3 h-7 rounded-md transition-all duration-200",
                  "text-sm font-medium",
                  "flex items-center gap-1.5",
                  timePeriod === 'monthly'
                    ? "bg-background text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/5"
                )}
              >
                <Calendar className="h-4 w-4" />
                By Month
              </button>
            </div>
          </div>

          {/* Region Cards */}
          {data.map((region, index) => (
            <motion.div
              key={region.region}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="p-4 hover:bg-accent/50 transition-colors">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{formatRegionName(region.region)}</h3>
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
                      const colorClass = metric.key === 'companyMentioned' 
                        ? getCompanyMentionedColor(value)
                        : metric.key === 'rankingPosition'
                        ? getRankingPositionColor(value)
                        : metric.key === 'featureScore'
                        ? getFeatureScoreColor(value)
                        : getSentimentColor(value)

                      return (
                        <div key={metric.key} className="space-y-1">
                          <div className="flex items-center gap-2">
                            <div className={`${metric.color} p-1.5 rounded-md bg-background/80`}>
                              <Icon className="h-3.5 w-3.5" />
                            </div>
                            <span className={cn("font-medium", colorClass)}>
                              {metric.formatter(value)}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground pl-7">
                            {metric.label}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Chart Area - Right Side */}
        <Card className="lg:col-span-8 p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-medium">Regional Performance Over Time</h3>
                <p className="text-sm text-muted-foreground">
                  Compare performance across different regions
                </p>
              </div>
              <div className="flex items-center gap-2">
                {METRICS.map((metric) => (
                  <button
                    key={metric.key}
                    onClick={() => setSelectedMetric(metric.key)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                      selectedMetric === metric.key
                        ? "bg-accent text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    )}
                  >
                    <metric.icon className="h-4 w-4" />
                    {metric.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={timelineData}
                  margin={{ top: 20, right: 20, left: 40, bottom: 20 }}
                >
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    stroke="hsl(var(--muted))" 
                    horizontal={true}
                    vertical={false}
                    opacity={0.1}
                  />
                  <XAxis
                    dataKey="date"
                    stroke="hsl(var(--muted-foreground))"
                    axisLine={false}
                    tickLine={false}
                    dy={10}
                    tick={{ 
                      fill: "hsl(var(--muted-foreground))",
                      fontSize: 12 
                    }}
                    padding={{ left: 20, right: 20 }}
                  />
                  <YAxis
                    domain={selectedMetric === 'rankingPosition' ? [1, 'auto'] : [0, 100]}
                    tickFormatter={
                      selectedMetric === 'rankingPosition'
                        ? (value: number) => value.toFixed(1)
                        : (value: number) => `${value}%`
                    }
                    stroke="hsl(var(--muted-foreground))"
                    axisLine={false}
                    tickLine={false}
                    dx={-10}
                    tick={{ 
                      fill: "hsl(var(--muted-foreground))",
                      fontSize: 12 
                    }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      return (
                        <div className="rounded-lg border bg-white px-3 py-2 shadow-md">
                          <div className="flex flex-col gap-1">
                            <p className="text-sm font-medium text-foreground">
                              {payload[0].payload.date}
                            </p>
                            {payload.map((entry: any) => (
                              <div key={entry.dataKey} className="flex items-center gap-2">
                                <div 
                                  className="h-2 w-2 rounded-full"
                                  style={{ backgroundColor: entry.color }}
                                />
                                <span className="text-sm text-muted-foreground">
                                  {entry.name}:
                                </span>
                                <span className="text-sm font-medium">
                                  {METRICS.find(m => m.key === selectedMetric)?.formatter(entry.value)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }}
                  />
                  {data.map((region, index) => (
                    <Line
                      key={region.region}
                      type="monotoneX"
                      dataKey={region.region}
                      name={region.region}
                      stroke={`hsl(var(--chart-${(index % 5) + 1}))`}
                      strokeWidth={2}
                      dot={{ 
                        r: 3,
                        strokeWidth: 2,
                        fill: '#fff',
                        stroke: `hsl(var(--chart-${(index % 5) + 1}))`,
                        opacity: 0.8
                      }}
                      activeDot={{ 
                        r: 6, 
                        strokeWidth: 2,
                        fill: `hsl(var(--chart-${(index % 5) + 1}))`,
                        stroke: '#fff'
                      }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
} 