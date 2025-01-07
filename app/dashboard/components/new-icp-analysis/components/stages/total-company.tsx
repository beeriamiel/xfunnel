"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, Target, Building2, ThumbsUp, ChevronRight, AlertCircle, Gauge, Calendar, FileText } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts"
import useSWR from 'swr'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { getAnalysisByCompany } from "../../lib/api"
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

type MetricKey = typeof METRICS[number]['key']

interface TotalCompanyProps {
  companyId: number | null
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

export function TotalCompany({ companyId }: TotalCompanyProps) {
  const [selectedMetric, setSelectedMetric] = React.useState<MetricKey>('companyMentioned')
  const [showGuide, setShowGuide] = React.useState(false)
  const timePeriod = useDashboardStore(state => state.timePeriod)
  const setTimePeriod = useDashboardStore(state => state.setTimePeriod)

  // Fetch data using SWR
  const { data, error, isLoading } = useSWR(
    companyId ? `company-analysis-${companyId}-${timePeriod}` : null,
    () => companyId ? getAnalysisByCompany(companyId, timePeriod) : null
  )

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowGuide(true)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  // Error state
  if (error) {
    return (
      <Alert variant="destructive" className="animate-in fade-in-50 duration-500">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load company analysis data. Please try again later.
        </AlertDescription>
      </Alert>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {METRICS.map((metric) => (
            <Card key={metric.key} className="p-6 bg-accent/5">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-5" />
              </div>
              <div className="mt-4">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-4 w-32 mt-1" />
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
  if (!data) {
    return (
      <Alert className="animate-in fade-in-50 duration-500">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No analysis data available for this company.
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
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
          </motion.div>

          {/* Metrics Cards */}
          {METRICS.map((metric, index) => {
            const Icon = metric.icon
            const value = data.metrics[metric.key]
            const colorClass = metric.key === 'companyMentioned' 
              ? getCompanyMentionedColor(value)
              : metric.key === 'rankingPosition'
              ? getRankingPositionColor(value)
              : metric.key === 'featureScore'
              ? getFeatureScoreColor(value)
              : getSentimentColor(value)

            return (
              <motion.div
                key={metric.key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card 
                  className={cn(
                    "p-4 hover:shadow-md transition-all cursor-pointer",
                    "hover:bg-accent/5 border",
                    selectedMetric === metric.key 
                      ? "border-primary/20 bg-accent/5" 
                      : "border-transparent"
                  )}
                  onClick={() => setSelectedMetric(metric.key)}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-md bg-accent/5 shadow-sm",
                      selectedMetric === metric.key && "text-primary"
                    )}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className={cn(
                        "font-bold text-xl",
                        colorClass
                      )}>
                        {metric.formatter(value)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {metric.label}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Chart Area - Right Side */}
        <Card className="lg:col-span-8 p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-medium">Performance Over Time</h3>
                <p className="text-sm text-muted-foreground">
                  Track your metrics over the selected time period
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
                  data={data.timelineData}
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
                            <div className="flex items-center gap-2">
                              <div 
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: METRICS.find(m => m.key === selectedMetric)?.color }}
                              />
                              <span className="text-sm text-muted-foreground">
                                {METRICS.find(m => m.key === selectedMetric)?.label}:
                              </span>
                              <span className="text-sm font-medium">
                                {METRICS.find(m => m.key === selectedMetric)?.formatter(payload[0].value as number)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Line
                    type="monotoneX"
                    dataKey={`metrics.${selectedMetric}`}
                    stroke={METRICS.find(m => m.key === selectedMetric)?.color}
                    strokeWidth={2}
                    dot={{ 
                      r: 3,
                      strokeWidth: 2,
                      fill: '#fff',
                      stroke: METRICS.find(m => m.key === selectedMetric)?.color,
                      opacity: 0.8
                    }}
                    activeDot={{ 
                      r: 6, 
                      strokeWidth: 2,
                      fill: METRICS.find(m => m.key === selectedMetric)?.color,
                      stroke: '#fff'
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
} 