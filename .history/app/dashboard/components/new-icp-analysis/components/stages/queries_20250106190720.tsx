"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { MOCK_DATA, type BuyingJourneyStage } from "../../types"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

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

const PLATFORM_COLORS = {
  perplexity: 'rgb(59, 130, 246)', // blue-500
  claude: 'rgb(168, 85, 247)',     // purple-500
  gemini: 'rgb(34, 197, 94)'       // green-500
}

export function Queries({ 
  companyId, 
  selectedRegion, 
  selectedVertical,
  selectedPersona,
  onBack 
}: QueriesProps) {
  const [selectedMetric, setSelectedMetric] = React.useState<keyof typeof MOCK_DATA.total.metrics>('average_sentiment')
  const [expandedQueries, setExpandedQueries] = React.useState<string[]>([])
  const data = MOCK_DATA.queries[selectedPersona as keyof typeof MOCK_DATA.queries] || {}

  // Toggle query expansion
  const toggleQuery = (queryId: string) => {
    setExpandedQueries(prev => 
      prev.includes(queryId)
        ? prev.filter(id => id !== queryId)
        : [...prev, queryId]
    )
  }

  // Prepare data for the timeline chart
  const timelineData = React.useMemo(() => {
    const allQueries = Object.values(data).flat()
    if (!allQueries.length) return []
    
    const dates = allQueries[0].timeline.map(t => t.date)
    return dates.map((date, index) => ({
      date,
      ...allQueries.reduce((acc, query) => ({
        ...acc,
        [query.query]: query.timeline[index].metrics[selectedMetric]
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
          Back to Personas
        </Button>
      </div>

      {/* Buying Journey Stages */}
      <div className="space-y-4">
        {JOURNEY_STAGES.map((stage) => {
          const stageQueries = data[stage.id] || []
          if (!stageQueries.length) return null

          return (
            <Card key={stage.id} className="p-6">
              <h3 className="text-lg font-semibold mb-4">{stage.label}</h3>
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
                              <div className="border-t pt-4 mt-4">
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

                              {/* Timeline Chart */}
                              <div className="mt-6 h-[200px]">
                                <ResponsiveContainer width="100%" height="100%">
                                  <LineChart
                                    data={query.timeline}
                                    margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
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
                                      activeDot={{ r: 6 }}
                                    />
                                  </LineChart>
                                </ResponsiveContainer>
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

      {/* Overall Timeline Chart */}
      <Card className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-medium">Query Performance Over Time</h3>
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
              {Object.values(data).flat().map((query) => (
                <Line
                  key={query.query}
                  type="monotone"
                  dataKey={query.query}
                  name={query.query}
                  stroke={`hsl(${Math.random() * 360}, 70%, 50%)`}
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