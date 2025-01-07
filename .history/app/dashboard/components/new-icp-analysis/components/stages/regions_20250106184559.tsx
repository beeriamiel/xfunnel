"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, Target, Building2, ThumbsUp, ChevronRight } from "lucide-react"
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

interface RegionsProps {
  companyId: number | null
  onSelectRegion: (region: string) => void
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

const REGION_COLORS = {
  'Americas': 'rgb(59, 130, 246)', // blue-500
  'EMEA': 'rgb(168, 85, 247)',     // purple-500
  'APAC': 'rgb(34, 197, 94)'       // green-500
}

export function Regions({ companyId, onSelectRegion }: RegionsProps) {
  const [selectedMetric, setSelectedMetric] = React.useState<keyof typeof MOCK_DATA.total.metrics>('average_sentiment')
  const data = MOCK_DATA.regions

  // Prepare data for the timeline chart
  const timelineData = React.useMemo(() => {
    const dates = data[0].timeline.map(t => t.date)
    return dates.map((date, index) => ({
      date,
      ...data.reduce((acc, region) => ({
        ...acc,
        [region.region]: region.timeline[index].metrics[selectedMetric]
      }), {})
    }))
  }, [data, selectedMetric])

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
                  const value = region.metrics[metric.key as keyof typeof region.metrics]

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
              {data.map((region) => (
                <Line
                  key={region.region}
                  type="monotone"
                  dataKey={region.region}
                  name={region.region}
                  stroke={REGION_COLORS[region.region as keyof typeof REGION_COLORS]}
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