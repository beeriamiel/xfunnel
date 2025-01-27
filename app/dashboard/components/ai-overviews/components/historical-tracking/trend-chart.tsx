'use client'

import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { HistoricalDataPoint } from "../../types"

interface TrendChartProps {
  data: HistoricalDataPoint[]
  onMetricChange: (metric: string) => void
  selectedMetric: string
}

const METRICS = [
  { value: 'aiOverviewCount', label: 'AI Overview Presence' },
  { value: 'companyMentionsCount', label: 'Company Mentions' },
  { value: 'competitorMentionsCount', label: 'Competitor Mentions' },
  { value: 'totalKeywords', label: 'Total Keywords' }
]

export function TrendChart({ data, onMetricChange, selectedMetric }: TrendChartProps) {
  const formattedData = data.map(point => ({
    ...point,
    date: point.date.toLocaleDateString(),
  }))

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Trends Over Time</h3>
        <Select value={selectedMetric} onValueChange={onMetricChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {METRICS.map(metric => (
              <SelectItem key={metric.value} value={metric.value}>
                {metric.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formattedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey={selectedMetric}
              stroke="#2563eb"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
} 