"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import {
  Brain,
  Target,
  Building2,
  ThumbsUp,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  MessageSquare,
  Users
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import useSWR from 'swr'
import { getAnalysisByQueries } from "../../lib/api"
import type { QueryAnalysis } from "../../lib/api"

interface QueriesProps {
  companyId: number | null
  selectedRegion: string
  selectedVertical: string
  selectedPersona: string
  onBack: () => void
}

const METRICS = [
  {
    key: 'sentimentScore',
    label: 'Sentiment',
    icon: Brain,
    formatter: (value: number) => `${value.toFixed(0)}%`,
    color: 'text-blue-500'
  },
  {
    key: 'rankingPosition',
    label: 'Position',
    icon: Target,
    formatter: (value: number) => value.toFixed(1),
    color: 'text-purple-500'
  },
  {
    key: 'companyMentioned',
    label: 'Mentioned',
    icon: Building2,
    formatter: (value: number) => `${value.toFixed(0)}%`,
    color: 'text-green-500'
  },
  {
    key: 'recommendationRate',
    label: 'Recommended',
    icon: ThumbsUp,
    formatter: (value: number) => `${value.toFixed(0)}%`,
    color: 'text-orange-500'
  }
] as const

type MetricKey = typeof METRICS[number]['key']

export function Queries({ 
  companyId, 
  selectedRegion, 
  selectedVertical,
  selectedPersona,
  onBack 
}: QueriesProps) {
  const [expandedQueries, setExpandedQueries] = React.useState<string[]>([])

  // Fetch data using SWR
  const { data, error, isLoading } = useSWR(
    companyId && selectedRegion && selectedVertical && selectedPersona
      ? `query-analysis-${companyId}-${selectedRegion}-${selectedVertical}-${selectedPersona}`
      : null,
    () => companyId && selectedRegion && selectedVertical && selectedPersona
      ? getAnalysisByQueries(companyId, selectedRegion, selectedVertical, selectedPersona)
      : null
  )

  // Error state
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load query analysis data. Please try again later.
        </AlertDescription>
      </Alert>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-9 w-32" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-24" />
          </div>
        </div>

        {/* Stage cards skeleton */}
        {[1, 2, 3].map((index) => (
          <Card key={index} className="p-6">
            <Skeleton className="h-6 w-48 mb-4" />
            <div className="space-y-4">
              {[1, 2].map((queryIndex) => (
                <Card key={queryIndex} className="p-4">
                  <div className="space-y-4">
                    <Skeleton className="h-6 w-full" />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {METRICS.map((metric, i) => (
                        <Skeleton key={i} className="h-6 w-32" />
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        ))}
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
            Back to Personas
          </Button>
          <div className="text-lg font-medium">
            {selectedRegion} • {selectedVertical} • {selectedPersona} • Queries
          </div>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No query analysis data available for this persona.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Calculate totals
  const totalQueries = data.reduce((acc, stage) => acc + stage.queries.length, 0)
  const mentionedQueries = data.reduce((acc, stage) => 
    acc + stage.queries.filter(q => q.metrics.companyMentioned > 0).length, 0
  )
  const mentionPercentage = (mentionedQueries / totalQueries * 100).toFixed(0)

  // Toggle query expansion
  const toggleQuery = (queryId: string) => {
    setExpandedQueries(prev => 
      prev.includes(queryId)
        ? prev.filter(id => id !== queryId)
        : [...prev, queryId]
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with back button and stats */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Personas
        </Button>
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="text-sm">
            {totalQueries} queries
          </Badge>
          <Badge variant="secondary" className="text-sm">
            {mentionPercentage}% mentioned
          </Badge>
        </div>
      </div>

      {/* Buying Journey Stages */}
      <div className="space-y-4">
        {data.map((stage) => (
          <Card key={stage.stage} className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              {stage.stage}
              <Badge variant="outline" className="ml-2">
                {stage.queries.length} queries
              </Badge>
            </h3>
            <div className="space-y-4">
              {stage.queries.map((query) => {
                const isExpanded = expandedQueries.includes(query.queryText)

                return (
                  <Collapsible
                    key={query.queryText}
                    open={isExpanded}
                    onOpenChange={() => toggleQuery(query.queryText)}
                  >
                    <Card className="p-4 hover:shadow-md transition-shadow">
                      <CollapsibleTrigger className="w-full">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="text-lg font-medium">{query.queryText}</div>
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                          {METRICS.map((metric) => {
                            const Icon = metric.icon
                            const value = query.metrics[metric.key]

                            return (
                              <div key={metric.key} className="flex items-center gap-2">
                                <div className={metric.color}>
                                  <Icon className="h-4 w-4" />
                                </div>
                                <span className="text-sm font-medium">
                                  {metric.formatter(value)}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {metric.label}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      </CollapsibleTrigger>

                      <CollapsibleContent className="mt-4">
                        <AnimatePresence>
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                          >
                            {/* Platform Rankings */}
                            <div className="border-t pt-4">
                              <h4 className="text-sm font-medium mb-3">Platform Rankings</h4>
                              <div className="grid grid-cols-3 gap-4">
                                {Object.entries(query.platformRankings).map(([platform, rank]) => (
                                  <div
                                    key={platform}
                                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                                  >
                                    <span className="text-sm font-medium capitalize">
                                      {platform}
                                    </span>
                                    <span className="text-sm font-bold">
                                      #{rank}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Response Text */}
                            {query.responseText && (
                              <div className="border-t pt-4 mt-4">
                                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                                  <MessageSquare className="h-4 w-4" />
                                  Response
                                </h4>
                                <div className="p-4 rounded-lg bg-muted/50">
                                  <p className="text-sm whitespace-pre-wrap">
                                    {query.responseText}
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Competitors List */}
                            {query.competitors?.length > 0 && (
                              <div className="border-t pt-4 mt-4">
                                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                                  <Users className="h-4 w-4" />
                                  Competitors Mentioned
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {query.competitors.map((competitor: string) => (
                                    <Badge key={competitor} variant="secondary">
                                      {competitor}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </motion.div>
                        </AnimatePresence>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                )
              })}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
} 