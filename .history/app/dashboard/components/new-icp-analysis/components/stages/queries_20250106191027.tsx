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
  ChevronUp
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { MOCK_DATA, type BuyingJourneyStage } from "../../types"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"

interface QueriesProps {
  companyId: number | null
  selectedRegion: string
  selectedVertical: string
  selectedPersona: string
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

const JOURNEY_STAGES: { id: BuyingJourneyStage; label: string }[] = [
  { id: 'problem_exploration', label: 'Problem Exploration' },
  { id: 'solution_education', label: 'Solution Education' },
  { id: 'solution_comparison', label: 'Solution Comparison' },
  { id: 'solution_evaluation', label: 'Solution Evaluation' },
  { id: 'final_research', label: 'Final Research' }
]

export function Queries({ 
  companyId, 
  selectedRegion, 
  selectedVertical,
  selectedPersona,
  onBack 
}: QueriesProps) {
  const [expandedQueries, setExpandedQueries] = React.useState<string[]>([])
  const data = MOCK_DATA.queries[selectedPersona as keyof typeof MOCK_DATA.queries] || {}
  
  // Calculate total queries
  const totalQueries = Object.values(data).reduce((acc, queries) => acc + queries.length, 0)
  
  // Calculate mention percentage
  const mentionedQueries = Object.values(data)
    .flat()
    .filter(query => query.metrics.company_mentioned > 0)
    .length
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
        {JOURNEY_STAGES.map((stage) => {
          const stageQueries = data[stage.id] || []
          if (!stageQueries.length) return null

          return (
            <Card key={stage.id} className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                {stage.label}
                <Badge variant="outline" className="ml-2">
                  {stageQueries.length} queries
                </Badge>
              </h3>
              <div className="space-y-4">
                {stageQueries.map((query) => {
                  const isExpanded = expandedQueries.includes(query.query)

                  return (
                    <Collapsible
                      key={query.query}
                      open={isExpanded}
                      onOpenChange={() => toggleQuery(query.query)}
                    >
                      <Card className="p-4 hover:shadow-md transition-shadow">
                        <CollapsibleTrigger className="w-full">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="text-lg font-medium">{query.query}</div>
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
                              const value = query.metrics[metric.key as keyof typeof query.metrics]

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
                                  {Object.entries(query.platform_rankings).map(([platform, rank]) => (
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
                            </motion.div>
                          </AnimatePresence>
                        </CollapsibleContent>
                      </Card>
                    </Collapsible>
                  )
                })}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
} 