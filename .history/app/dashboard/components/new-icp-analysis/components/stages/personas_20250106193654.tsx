"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, Target, Building2, ThumbsUp, ChevronRight, ArrowLeft, AlertCircle } from "lucide-react"
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
import { getAnalysisByPersona } from "../../lib/api"
import type { PersonaAnalysis } from "../../lib/api"

interface PersonasProps {
  companyId: number | null
  selectedRegion: string
  selectedVertical: string
  onSelectPersona: (persona: string) => void
  onBack: () => void
}

const METRICS = [
  {
    key: 'sentimentScore',
    label: 'Average Sentiment',
    icon: Brain,
    formatter: (value: number) => `${value.toFixed(0)}%`,
    color: 'text-blue-500'
  },
  {
    key: 'rankingPosition',
    label: 'Average Position',
    icon: Target,
    formatter: (value: number) => value.toFixed(1),
    color: 'text-purple-500'
  },
  {
    key: 'companyMentioned',
    label: 'Company Mentioned',
    icon: Building2,
    formatter: (value: number) => `${value.toFixed(0)}%`,
    color: 'text-green-500'
  },
  {
    key: 'recommendationRate',
    label: 'Recommendation Rate',
    icon: ThumbsUp,
    formatter: (value: number) => `${value.toFixed(0)}%`,
    color: 'text-orange-500'
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
  selectedRegion, 
  selectedVertical, 
  onSelectPersona, 
  onBack 
}: PersonasProps) {
  const [selectedMetric, setSelectedMetric] = React.useState<MetricKey>('sentimentScore')

  // Fetch data using SWR
  const { data, error, isLoading } = useSWR(
    companyId && selectedRegion && selectedVertical 
      ? `persona-analysis-${companyId}-${selectedRegion}-${selectedVertical}` 
      : null,
    () => companyId && selectedRegion && selectedVertical 
      ? getAnalysisByPersona(companyId, selectedRegion, selectedVertical) 
      : null
  )

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
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Verticals
          </Button>
          <div className="text-lg font-medium">
            {selectedRegion} • {selectedVertical} • Personas
          </div>
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

  // Prepare data for the timeline chart
  const timelineData = React.useMemo(() => {
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

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Verticals
        </Button>
        <div className="text-lg font-medium">
          {selectedRegion} • {selectedVertical} • Personas
        </div>
      </div>

      {/* Persona Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((persona, index) => (
          <motion.div
            key={persona.persona}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{persona.persona}</h3>
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
          <h3 className="text-lg font-medium">Persona Performance Over Time</h3>
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
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short' })}
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
                labelFormatter={(label: string) => 
                  new Date(label).toLocaleDateString('en-US', { 
                    month: 'long',
                    year: 'numeric'
                  })
                }
              />
              <Legend />
              {data.map((persona) => (
                <Line
                  key={persona.persona}
                  type="monotone"
                  dataKey={persona.persona}
                  name={persona.persona}
                  stroke={PERSONA_COLORS[persona.persona] || PERSONA_COLORS.Unknown}
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