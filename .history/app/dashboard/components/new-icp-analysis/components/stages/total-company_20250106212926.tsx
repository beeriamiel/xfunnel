"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, Target, Building2, ThumbsUp, ChevronRight, AlertCircle, Gauge } from "lucide-react"
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
import { useDashboardStore } from "@/app/dashboard/store"

interface TotalCompanyProps {
  companyId: number | null
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

export function TotalCompany({ companyId }: TotalCompanyProps) {
  const [selectedMetric, setSelectedMetric] = React.useState<MetricKey>('companyMentioned')
  const [showGuide, setShowGuide] = React.useState(false)
  const timePeriod = useDashboardStore(state => state.timePeriod)

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
      <Alert variant="destructive">
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
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {METRICS.map((metric) => (
            <Card key={metric.key} className="p-6">
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
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No analysis data available for this company.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Navigation Guide */}
      <AnimatePresence>
        {showGuide && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="bg-muted/50 border rounded-lg p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <span className="text-sm">
                Click on <span className="font-medium text-primary">Verticals</span> above to analyze performance by industry
              </span>
            </div>
            <ChevronRight className="h-5 w-5 text-primary animate-bounce-x" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {METRICS.map((metric, index) => {
          const Icon = metric.icon
          const value = data.metrics[metric.key]

          return (
            <motion.div
              key={metric.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div className={metric.color}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-bold">
                    {metric.formatter(value)}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {metric.label}
                  </div>
                </div>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Timeline Chart */}
      <Card className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-medium">Performance Over Time</h3>
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
              data={data.timelineData}
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
              <Line
                type="monotone"
                dataKey={`metrics.${selectedMetric}`}
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  )
} 