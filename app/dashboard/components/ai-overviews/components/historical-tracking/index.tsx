'use client'

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { addDays, subDays, subMonths } from "date-fns"
import { TrendChart } from "./trend-chart"
import { KeywordHistoryTable } from "./keyword-history-table"
import type { HistoricalDataPoint, KeywordHistory, TimeRange } from "../../types"

interface HistoricalTrackingProps {
  companyId: number
  accountId: string
}

const TIME_RANGES = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' }
] as const

export function HistoricalTracking({ companyId, accountId }: HistoricalTrackingProps) {
  const [selectedMetric, setSelectedMetric] = useState('aiOverviewCount')
  const [timeRange, setTimeRange] = useState<typeof TIME_RANGES[number]['value']>('30d')

  const getDateRange = (range: typeof timeRange): TimeRange => {
    const end = new Date()
    const start = range === '7d' ? subDays(end, 7) :
                 range === '30d' ? subDays(end, 30) :
                 subDays(end, 90)
    return { start, end }
  }

  const dateRange = getDateRange(timeRange)
  const daysDiff = Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24))

  // Mock data for demonstration
  const trendData: HistoricalDataPoint[] = Array.from({ length: daysDiff }, (_, i) => ({
    date: addDays(dateRange.start, i),
    aiOverviewCount: Math.floor(Math.random() * 20),
    companyMentionsCount: Math.floor(Math.random() * 15),
    competitorMentionsCount: Math.floor(Math.random() * 25),
    totalKeywords: 50
  }))

  const keywordHistories: KeywordHistory[] = [
    {
      keyword: "ai content generation",
      history: [
        {
          date: dateRange.start,
          hasAIOverview: true,
          companyMentioned: false,
          competitorMentions: 2
        },
        {
          date: dateRange.end,
          hasAIOverview: true,
          companyMentioned: true,
          competitorMentions: 4
        }
      ]
    },
    {
      keyword: "ai writing tools",
      history: [
        {
          date: dateRange.start,
          hasAIOverview: false,
          companyMentioned: false,
          competitorMentions: 1
        },
        {
          date: dateRange.end,
          hasAIOverview: true,
          companyMentioned: false,
          competitorMentions: 3
        }
      ]
    }
  ]

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Time Range</h3>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIME_RANGES.map(range => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      <TrendChart
        data={trendData}
        selectedMetric={selectedMetric}
        onMetricChange={setSelectedMetric}
      />

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Keyword History</h3>
        <KeywordHistoryTable histories={keywordHistories} />
      </div>
    </div>
  )
} 