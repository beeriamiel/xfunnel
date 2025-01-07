"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, Target, Building2, ThumbsUp } from "lucide-react"
import { motion } from "framer-motion"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts"
import { MOCK_DATA } from "../../types"

interface TotalCompanyProps {
  companyId: number
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

export function TotalCompany({ companyId }: TotalCompanyProps) {
  const [selectedMetric, setSelectedMetric] = React.useState<keyof typeof MOCK_DATA.total.metrics>('average_sentiment')
  const data = MOCK_DATA.total

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {METRICS.map((metric, index) => {
          const Icon = metric.icon
          const value = data.metrics[metric.key as keyof typeof data.metrics]

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
          <Tabs
            value={selectedMetric}
            onValueChange={(value) => setSelectedMetric(value as keyof typeof data.metrics)}
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
              data={data.timeline}
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