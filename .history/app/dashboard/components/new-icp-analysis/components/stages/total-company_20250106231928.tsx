"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, Target, Building2, ThumbsUp, ChevronRight, AlertCircle, Gauge, Calendar } from "lucide-react"
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
    color: 'text-green-500'
  },
  {
    key: 'rankingPosition',
    label: 'Average Position',
    description: 'Average ranking position in solution comparison and final research stages',
    icon: Target,
    formatter: (value: number) => value.toFixed(1),
    color: 'text-purple-500'
  },
  {
    key: 'featureScore',
    label: 'Feature Score',
    description: 'Percentage of positive feature evaluations in solution analysis',
    icon: ThumbsUp,
    formatter: (value: number) => `${value.toFixed(0)}%`,
    color: 'text-orange-500'
  },
  {
    key: 'sentimentScore',
    label: 'Average Sentiment',
    description: 'Average sentiment score across all responses',
    icon: Gauge,
    formatter: (value: number) => `${value.toFixed(0)}%`,
    color: 'text-blue-500'
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
            <Card className="p-4 bg-card hover:shadow-md transition-all">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Time Period
                </div>
                <Tabs
                  value={timePeriod}
                  onValueChange={(value: string) => setTimePeriod(value as TimePeriod)}
                  className="w-full"
                >
                  <TabsList className="grid grid-cols-2 w-full">
                    <TabsTrigger value="weekly" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      <Calendar className="h-4 w-4" />
                      Weekly
                    </TabsTrigger>
                    <TabsTrigger value="monthly" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      <Calendar className="h-4 w-4" />
                      Monthly
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </Card>
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
                    hover:scale-[1.02] hover:bg-accent/5
                    ${selectedMetric === metric.key ? 'ring-2 ring-primary bg-primary/5' : ''}
                  `}
                  onClick={() => setSelectedMetric(metric.key)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`${metric.color} p-2 rounded-md bg-background/80 shadow-sm`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-bold text-xl">
                          {metric.formatter(value)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {metric.label}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className={`h-4 w-4 text-muted-foreground/50 transition-transform ${selectedMetric === metric.key ? 'rotate-90' : ''}`} />
                  </div>
                  {selectedMetric === metric.key && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 text-sm text-muted-foreground"
                    >
                      {metric.description}
                    </motion.div>
                  )}
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
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={data.timelineData}
                    margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                    <XAxis
                      dataKey="date"
                      className="text-xs text-muted-foreground"
                      tick={{ fill: 'currentColor' }}
                    />
                    <YAxis
                      domain={selectedMetric === 'rankingPosition' ? [1, 'auto'] : [0, 100]}
                      tickFormatter={
                        selectedMetric === 'rankingPosition'
                          ? (value: number) => value.toFixed(1)
                          : (value: number) => `${value}%`
                      }
                      className="text-xs text-muted-foreground"
                      tick={{ fill: 'currentColor' }}
                    />
                    <Tooltip
                      formatter={(value: number) => 
                        selectedMetric === 'rankingPosition'
                          ? value.toFixed(1)
                          : `${value.toFixed(0)}%`
                      }
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey={`metrics.${selectedMetric}`}
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
} 