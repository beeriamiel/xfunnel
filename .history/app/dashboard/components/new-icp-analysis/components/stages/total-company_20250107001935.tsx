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

type MetricKey = typeof METRICS[number]['key']

interface TotalCompanyProps {
  companyId: number | null
}

const METRICS = [
  {
    key: 'companyMentioned',
    label: 'Company Mentioned',
    description: 'Percentage of responses mentioning your company in problem exploration and solution education stages',
    icon: Building2,
    formatter: (value: number) => `${value.toFixed(0)}%`,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/5',
    borderColor: 'border-purple-500/20'
  },
  {
    key: 'rankingPosition',
    label: 'Average Position',
    description: 'Average ranking position in solution comparison and final research stages',
    icon: Target,
    formatter: (value: number) => value.toFixed(1),
    color: 'text-pink-500',
    bgColor: 'bg-pink-500/5',
    borderColor: 'border-pink-500/20'
  },
  {
    key: 'featureScore',
    label: 'Feature Score',
    description: 'Percentage of positive feature evaluations in solution analysis',
    icon: ThumbsUp,
    formatter: (value: number) => `${value.toFixed(0)}%`,
    color: 'text-fuchsia-500',
    bgColor: 'bg-fuchsia-500/5',
    borderColor: 'border-fuchsia-500/20'
  },
  {
    key: 'sentimentScore',
    label: 'Average Sentiment',
    description: 'Average sentiment score across all responses',
    icon: Gauge,
    formatter: (value: number) => `${value.toFixed(0)}%`,
    color: 'text-violet-500',
    bgColor: 'bg-violet-500/5',
    borderColor: 'border-violet-500/20'
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

            return (
              <motion.div
                key={metric.key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card 
                  className={`
                    p-4 hover:shadow-md transition-all cursor-pointer
                    hover:bg-accent/5 border
                    ${selectedMetric === metric.key 
                      ? `${metric.bgColor} ${metric.borderColor} border` 
                      : 'border-transparent'
                    }
                  `}
                  onClick={() => setSelectedMetric(metric.key)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`${metric.color} p-2 rounded-md ${metric.bgColor} shadow-sm`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className={`font-bold text-xl ${selectedMetric === metric.key ? metric.color : ''}`}>
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="lg:col-span-8"
        >
          <Card className="p-6 hover:shadow-md transition-all">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-lg font-medium">Performance Over Time</h3>
                  <p className="text-sm text-muted-foreground">
                    Track your metrics over the selected time period
                  </p>
                </div>
                <Tabs
                  value={selectedMetric}
                  onValueChange={(value) => setSelectedMetric(value as MetricKey)}
                  className="w-auto"
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

              <div className="h-[350px] w-full">
                <ChartContainer
                  config={{
                    [selectedMetric]: {
                      color: `hsl(var(--primary))`,
                      label: METRICS.find(m => m.key === selectedMetric)?.label
                    }
                  }}
                  className="h-[350px] w-full"
                >
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
                      <ChartTooltip
                        content={
                          <ChartTooltipContent
                            formatter={(value: number) => 
                              selectedMetric === 'rankingPosition'
                                ? value.toFixed(1)
                                : `${value.toFixed(0)}%`
                            }
                          />
                        }
                      />
                      <Line
                        type="monotone"
                        dataKey={`metrics.${selectedMetric}`}
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
} 