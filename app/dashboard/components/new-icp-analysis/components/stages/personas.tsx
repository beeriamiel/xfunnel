"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, Target, Building2, ThumbsUp, ChevronRight, ArrowLeft, AlertCircle, Gauge, Calendar, FileText } from "lucide-react"
import { motion } from "framer-motion"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { Button } from "@/components/ui/button"
import useSWR from 'swr'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { getAnalysisByPersona } from "../../lib/api"
import type { PersonaAnalysis } from "../../lib/api"
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

interface PersonasProps {
  companyId: number | null
  accountId: string
  selectedRegion: string
  selectedVertical: string
  onSelectPersona: (persona: string) => void
  onBack: () => void
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

const PERSONA_COLORS: Record<string, string> = {
  'DevOps Lead': 'rgb(59, 130, 246)',        // blue-500
  'Database Architect': 'rgb(168, 85, 247)',  // purple-500
  'Risk Manager': 'rgb(34, 197, 94)',        // green-500
  'Clinical Data Scientist': 'rgb(245, 158, 11)', // amber-500
  'Unknown': 'rgb(156, 163, 175)'           // gray-400
}

export function Personas({ 
  companyId, 
  accountId, 
  selectedRegion, 
  selectedVertical, 
  onSelectPersona, 
  onBack 
}: PersonasProps) {
  const [selectedMetric, setSelectedMetric] = React.useState<MetricKey>('companyMentioned')
  const timePeriod = useDashboardStore(state => state.timePeriod)
  const setTimePeriod = useDashboardStore(state => state.setTimePeriod)
  const isSuperAdmin = useDashboardStore(state => state.isSuperAdmin)

  // Fetch data using SWR
  const { data, error, isLoading } = useSWR(
    companyId && selectedRegion && selectedVertical 
      ? `persona-analysis-${companyId}-${selectedRegion}-${selectedVertical}-${timePeriod}` 
      : null,
    () => companyId && selectedRegion && selectedVertical 
      ? getAnalysisByPersona(companyId, accountId, selectedRegion, selectedVertical, timePeriod, isSuperAdmin) 
      : null
  )

  // Prepare data for the timeline chart - moved before conditional returns
  const timelineData = React.useMemo(() => {
    if (!data?.length) return []
    
    const allDates = data.flatMap(persona => 
      persona.timelineData.map(t => t.date)
    ).filter((date, index, self) => self.indexOf(date) === index)
    .sort()

    return allDates.map(date => ({
      date,
      ...data.reduce((acc, persona) => {
        const dayData = persona.timelineData.find(t => t.date === date)
        return {
          ...acc,
          [persona.persona]: dayData?.metrics[selectedMetric] ?? null
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
          Failed to load persona analysis data. Please try again later.
        </AlertDescription>
      </Alert>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-6 w-64" />
        </div>

        {/* Persona cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((index) => (
            <Card key={index} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-6 w-32" />
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

        {/* Chart skeleton */}
        <Card className="p-6">
          <Skeleton className="h-[400px] w-full" />
        </Card>
      </div>
    )
  }

  // No data state
  if (!data?.length) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No persona analysis data available for this vertical.
          </AlertDescription>
        </Alert>
      </div>
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

          {/* Persona Cards */}
          {data.map((persona, index) => (
            <motion.div
              key={persona.persona}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="p-4 hover:bg-accent/50 transition-colors">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{persona.persona}</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-foreground"
                      onClick={() => onSelectPersona(persona.persona)}
                    >
                      View Queries
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {METRICS.map((metric) => {
                      const Icon = metric.icon
                      const value = persona.metrics[metric.key]
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
                <h3 className="text-lg font-medium">Persona Performance Over Time</h3>
                <p className="text-sm text-muted-foreground">
                  Compare performance across different personas
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
                  {data.map((persona, index) => (
                    <Line
                      key={persona.persona}
                      type="monotoneX"
                      dataKey={persona.persona}
                      name={persona.persona}
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