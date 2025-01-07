"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
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
import useSWR from 'swr'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { getAnalysisByCompany } from "../../lib/api"
import { useDashboardStore } from "@/app/dashboard/store"
import { MetricsHeader } from "../common/metrics-header"

interface TotalCompanyProps {
  companyId: number | null
}

export function TotalCompany({ companyId }: TotalCompanyProps) {
  const timePeriod = useDashboardStore(state => state.timePeriod)
  const setTimePeriod = useDashboardStore(state => state.setTimePeriod)

  // Fetch data using SWR
  const { data, error, isLoading } = useSWR(
    companyId ? `company-analysis-${companyId}-${timePeriod}` : null,
    () => companyId ? getAnalysisByCompany(companyId, timePeriod) : null
  )

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
        <Card>
          <Skeleton className="h-[72px] w-full" />
        </Card>
        <Card className="p-6">
          <Skeleton className="h-[400px] w-full" />
        </Card>
      </div>
    )
  }

  // No data state
  if (!data?.metrics || !data?.timelineData?.length) {
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
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card>
          <MetricsHeader
            metrics={data.metrics}
            timePeriod={timePeriod}
            onTimePeriodChange={setTimePeriod}
          />
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card className="p-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Performance Over Time</h3>
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
                    domain={[0, 100]}
                    tickFormatter={(value: number) => `${value}%`}
                    className="text-xs"
                  />
                  <Tooltip
                    formatter={(value: number) => `${value.toFixed(0)}%`}
                  />
                  <Line
                    type="monotone"
                    dataKey="metrics.companyMentioned"
                    name="Company Mentioned"
                    stroke="hsl(var(--purple-500))"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="metrics.rankingPosition"
                    name="Average Position"
                    stroke="hsl(var(--pink-500))"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="metrics.featureScore"
                    name="Feature Score"
                    stroke="hsl(var(--fuchsia-500))"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="metrics.sentimentScore"
                    name="Average Sentiment"
                    stroke="hsl(var(--violet-500))"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  )
} 