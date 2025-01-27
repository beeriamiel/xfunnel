'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { KeywordHistory } from "../../types"

interface KeywordHistoryTableProps {
  histories: KeywordHistory[]
}

export function KeywordHistoryTable({ histories }: KeywordHistoryTableProps) {
  if (histories.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No historical data available yet.
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Keyword</TableHead>
            <TableHead>Est. Volume</TableHead>
            <TableHead>Est. Relevance</TableHead>
            <TableHead>Est. Difficulty</TableHead>
            <TableHead>First Seen</TableHead>
            <TableHead>Last Seen</TableHead>
            <TableHead>AI Overview Changes</TableHead>
            <TableHead>Company Mention Changes</TableHead>
            <TableHead>Competitor Mentions Trend</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {histories.map((history) => {
            const firstEntry = history.history[0]
            const lastEntry = history.history[history.history.length - 1]
            const aiOverviewChanges = history.history.filter((entry, i, arr) => 
              i > 0 && entry.hasAIOverview !== arr[i-1].hasAIOverview
            ).length
            const companyMentionChanges = history.history.filter((entry, i, arr) => 
              i > 0 && entry.companyMentioned !== arr[i-1].companyMentioned
            ).length

            const competitorTrend = (() => {
              const first = firstEntry.competitorMentions
              const last = lastEntry.competitorMentions
              if (last > first) return 'increase'
              if (last < first) return 'decrease'
              return 'stable'
            })()

            return (
              <TableRow key={history.keyword}>
                <TableCell>{history.keyword}</TableCell>
                <TableCell>
                  {history.estimatedVolume ? 
                    new Intl.NumberFormat().format(history.estimatedVolume) 
                    : 'N/A'}
                </TableCell>
                <TableCell>
                  {history.estimatedRelevance ? 
                    `${(history.estimatedRelevance * 100).toFixed(1)}%` 
                    : 'N/A'}
                </TableCell>
                <TableCell>
                  {history.estimatedDifficulty ? 
                    `${history.estimatedDifficulty}/100` 
                    : 'N/A'}
                </TableCell>
                <TableCell>{firstEntry.date.toLocaleDateString()}</TableCell>
                <TableCell>{lastEntry.date.toLocaleDateString()}</TableCell>
                <TableCell>
                  <Badge variant={aiOverviewChanges > 0 ? "default" : "secondary"}>
                    {aiOverviewChanges}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={companyMentionChanges > 0 ? "default" : "secondary"}>
                    {companyMentionChanges}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={
                    competitorTrend === 'increase' ? "default" :
                    competitorTrend === 'decrease' ? "destructive" :
                    "secondary"
                  }>
                    {competitorTrend}
                  </Badge>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
} 