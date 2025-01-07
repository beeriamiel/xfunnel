"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, Target, Building2, ThumbsUp, ChevronRight, ArrowLeft } from "lucide-react"
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
import { MOCK_DATA } from "../../types"
import { Button } from "@/components/ui/button"

interface VerticalsProps {
  companyId: number | null
  selectedRegion: string
  onSelectVertical: (vertical: string) => void
  onBack: () => void
}

const METRICS = [
  {
    key: 'average_sentiment',
    label: 'Average Sentiment',
    icon: Brain,
    formatter: (value: number) => `${value.toFixed(0)}%`,
    color: 'text-blue-500'
  },
  {
    key: 'average_position',
    label: 'Average Position',
    icon: Target,
    formatter: (value: number) => value.toFixed(1),
    color: 'text-purple-500'
  },
  {
    key: 'company_mentioned',
    label: 'Company Mentioned',
    icon: Building2,
    formatter: (value: number) => `${value.toFixed(0)}%`,
    color: 'text-green-500'
  },
  {
    key: 'recommendation_probability',
    label: 'Recommendation Rate',
    icon: ThumbsUp,
    formatter: (value: number) => `${value.toFixed(0)}%`,
    color: 'text-orange-500'
  }
] as const

const VERTICAL_COLORS = {
  'Enterprise Software': 'rgb(59, 130, 246)',  // blue-500
  'Financial Services': 'rgb(168, 85, 247)',   // purple-500
  'Healthcare': 'rgb(34, 197, 94)',           // green-500
  'Manufacturing': 'rgb(245, 158, 11)',       // amber-500
  'E-commerce': 'rgb(236, 72, 153)'          // pink-500
}

export function Verticals({ companyId, selectedRegion, onSelectVertical, onBack }: VerticalsProps) {
  const [selectedMetric, setSelectedMetric] = React.useState<keyof typeof MOCK_DATA.total.metrics>('average_sentiment')
  const data = MOCK_DATA.verticals[selectedRegion as keyof typeof MOCK_DATA.verticals] || []

  // Prepare data for the timeline chart
  const timelineData = React.useMemo(() => {
    if (!data.length) return []
    
    const dates = data[0].timeline.map(t => t.date)
    return dates.map((date, index) => ({
      date,
      ...data.reduce((acc, vertical) => ({
        ...acc,
        [vertical.vertical]: vertical.timeline[index].metrics[selectedMetric]
      }), {})
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
          Back to Regions
        </Button>
        <div className="text-lg font-medium">{selectedRegion} Verticals</div>
      </div>

      {/* Vertical Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((vertical, index) => (
          <motion.div
            key={vertical.vertical}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{vertical.vertical}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() => onSelectVertical(vertical.vertical)}
                >
                  View Personas
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {METRICS.map((metric) => {
                  const Icon = metric.icon
                  const value = vertical.metrics[metric.key as keyof typeof vertical.metrics]

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
          <h3 className="text-lg font-medium">Vertical Performance Over Time</h3>
          <Tabs
            value={selectedMetric}
            onValueChange={(value) => setSelectedMetric(value as keyof typeof MOCK_DATA.total.metrics)}
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
                domain={selectedMetric === 'average_position' ? [1, 'auto'] : [0, 100]}
                tickFormatter={
                  selectedMetric === 'average_position'
                    ? (value: number) => value.toFixed(1)
                    : (value: number) => `${value}%`
                }
                className="text-xs"
              />
              <Tooltip
                formatter={(value: number) => 
                  selectedMetric === 'average_position'
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
              {data.map((vertical) => (
                <Line
                  key={vertical.vertical}
                  type="monotone"
                  dataKey={vertical.vertical}
                  name={vertical.vertical}
                  stroke={VERTICAL_COLORS[vertical.vertical as keyof typeof VERTICAL_COLORS]}
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