'use client'

import { useState, useEffect } from 'react'
import { Card } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from '@/app/supabase/client'
import { useDashboardStore } from '@/app/dashboard/store'
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from 'recharts'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Info } from "lucide-react"
import { BarChart3, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

// Constants for stages
const MENTION_STAGES = ['problem_exploration', 'solution_education']
const RANKING_STAGES = ['solution_comparison', 'final_research']

// Engine mapping
const ENGINE_NAMES: { [key: string]: string } = {
  perplexity: 'Perplexity',
  claude: 'Claude',
  gemini: 'Gemini',
  openai: 'OpenAI',
  google_search: 'Google Search'
}

interface CompetitorData {
  name: string
  mentions: {
    count: number
    percentage: number
  }
  rankings: {
    position: number | null
    frequency: number
  }
}

interface EngineData {
  [engine: string]: CompetitorData[]
}

interface CompetitorAnalysisProps {
  companyId?: number | null
}

interface MetricInfo {
  title: string
  description: string
  example: string
}

const METRIC_EXPLANATIONS = {
  mentions: {
    title: "Company Mentions",
    description: "How often this company appears in early-stage queries (Problem Exploration & Solution Education stages)",
    example: "Example: 33% (10) means mentioned in 33% of discussions, appearing 10 times"
  },
  rankings: {
    title: "Average Rankings",
    description: "Average ranking position in competitive comparisons. Lower numbers are better.",
    example: "Example: #1.3 (16x) means typically ranked between 1st and 2nd place, appearing in 16 comparisons"
  }
}

interface InfoHoverCardProps {
  type: 'mentions' | 'rankings'
}

function InfoHoverCard({ type }: InfoHoverCardProps) {
  const info = type === 'mentions' 
    ? METRIC_EXPLANATIONS.mentions
    : METRIC_EXPLANATIONS.rankings
  
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Info className="h-4 w-4 text-muted-foreground/70 hover:text-muted-foreground cursor-help inline-flex ml-1.5" />
      </HoverCardTrigger>
      <HoverCardContent 
        side="top"
        align="center"
        alignOffset={-15}
        className="w-80 p-4"
      >
        <div className="text-left space-y-2">
          <h4 className="font-semibold text-sm">{info.title}</h4>
          <p className="text-sm text-muted-foreground leading-snug">{info.description}</p>
          <p className="text-sm text-muted-foreground/80 italic leading-snug">{info.example}</p>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}

function CompetitorChart({ 
  data, 
  companyName,
  type
}: { 
  data: CompetitorData[]
  companyName: string
  type: 'mentions' | 'rankings'
}) {
  if (!data || data.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h4 className="text-base font-medium tracking-tight">
            {METRIC_EXPLANATIONS[type].title}
          </h4>
          <InfoHoverCard type={type} />
        </div>
        <div className="relative h-[400px] w-full rounded-lg border bg-gradient-to-b from-background to-muted/20">
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3">
            <div className="rounded-full bg-muted/10 p-4 shadow-sm">
              <BarChart3 className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">No data available</p>
          </div>
        </div>
      </div>
    )
  }

  // Filter out Rest category for rankings view first
  const filteredData = type === 'rankings' 
    ? data.filter(item => item.name !== "Rest")
    : data

  // Sort data based on view type
  const sortedData = [...filteredData].sort((a, b) => {
    // For mentions view, handle Rest category
    if (type === 'mentions') {
      if (a.name === "Rest") return 1
      if (b.name === "Rest") return -1
      return b.mentions.percentage - a.mentions.percentage
    }
    
    // For rankings view, handle N/A and sorting
    // If both have positions, sort normally (lower numbers first)
    if (a.rankings.position && b.rankings.position) {
      return a.rankings.position - b.rankings.position
    }
    // Push N/A to the end
    if (!a.rankings.position) return 1
    if (!b.rankings.position) return -1
    return 0
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h4 className="text-base font-medium tracking-tight">
          {METRIC_EXPLANATIONS[type].title}
        </h4>
        <InfoHoverCard type={type} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6">
        <div className="relative h-[400px] rounded-lg border bg-gradient-to-b from-background to-muted/20 p-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={sortedData}
              layout="vertical"
              margin={{ top: 5, right: 20, left: 70, bottom: 5 }}
            >
              <XAxis 
                type="number" 
                domain={type === 'mentions' ? [0, 100] : [0, 'auto']}
                tickFormatter={(value) => type === 'mentions' ? `${value}%` : `#${value}`}
                stroke={ENGINE_COLORS.muted}
                fontSize={12}
                tickLine={false}
                axisLine={false}
                opacity={0.7}
              />
              <YAxis 
                type="category" 
                dataKey="name" 
                width={60}
                tick={{ 
                  fontSize: 12,
                  fill: ENGINE_COLORS.muted
                }}
                tickLine={false}
                axisLine={false}
                opacity={0.7}
              />
              <Tooltip content={<CompetitorTooltip type={type} />} />
              <Bar 
                dataKey={type === 'mentions' ? 'mentions.percentage' : 'rankings.position'}
                radius={[4, 4, 4, 4]}
                background={{ fill: ENGINE_COLORS.border, opacity: 0.2 }}
                className="transition-all duration-300"
              >
                {sortedData.map((entry, index) => {
                  let fillColor = ENGINE_COLORS.primary // Default to primary (blue)
                  
                  if (entry.name === companyName) {
                    fillColor = ENGINE_COLORS.primary
                  } else if (entry.name === "Rest") {
                    fillColor = ENGINE_COLORS.rest
                  } else {
                    // Assign colors from the competitors array based on index
                    const competitorIndex = sortedData
                      .filter(item => item.name !== companyName && item.name !== "Rest")
                      .findIndex(item => item.name === entry.name)
                    fillColor = COMPETITOR_COLORS.competitors[competitorIndex] || COMPETITOR_COLORS.competitors[0]
                  }

                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={fillColor}
                      opacity={entry.name === companyName 
                        ? 1 
                        : entry.name === "Rest"
                          ? 0.5
                          : 0.8}
                      className="hover:opacity-90 transition-opacity duration-200"
                    />
                  )
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="md:w-[280px] rounded-lg border shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b border-border/50">
                <TableHead className="w-[40%] text-xs font-medium text-muted-foreground">
                  Company
                </TableHead>
                <TableHead className="text-right text-xs font-medium text-muted-foreground">
                  {type === 'mentions' ? 'Mentions' : 'Position'}
                  <InfoHoverCard type={type} />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((item: CompetitorData) => (
                <TableRow 
                  key={item.name} 
                  className={cn(
                    "transition-colors hover:bg-muted/5",
                    item.name === companyName && "bg-primary/5 border border-primary/20 shadow-[0_0_0_1px_rgba(59,130,246,0.1)] rounded-sm relative"
                  )}
                >
                  <TableCell className={cn(
                    "py-2.5 text-sm",
                    item.name === companyName && "font-medium text-primary",
                    item.name === "Rest" && "italic text-muted-foreground"
                  )}>
                    {item.name}
                  </TableCell>
                  <TableCell className={cn(
                    "py-2.5 text-right text-sm font-mono",
                    item.name === companyName ? "text-primary/90" : "text-muted-foreground"
                  )}>
                    {type === 'mentions' 
                      ? `${item.mentions.percentage.toFixed(1)}% (${item.mentions.count})`
                      : item.rankings.position 
                        ? `#${item.rankings.position.toFixed(1)} (${item.rankings.frequency}x)`
                        : 'N/A'
                    }
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}

function CompetitorTooltip({ 
  active, 
  payload, 
  label,
  type
}: { 
  active?: boolean
  payload?: any[]
  label?: string
  type: 'mentions' | 'rankings'
}) {
  if (!active || !payload || !payload.length) return null

  const data = payload[0].payload as CompetitorData

  return (
    <div className="rounded-lg border bg-white px-3 py-2 shadow-md">
      <p className="text-sm font-medium">{label}</p>
      <div className="mt-1 space-y-1">
        {type === 'mentions' ? (
          <>
            <p className="text-xs text-muted-foreground">
              Percentage: {data.mentions.percentage.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground">
              Count: {data.mentions.count}
            </p>
          </>
        ) : (
          <>
            <p className="text-xs text-muted-foreground">
              Position: #{data.rankings.position?.toFixed(1) || 'N/A'}
            </p>
            <p className="text-xs text-muted-foreground">
              Frequency: {data.rankings.frequency}x
            </p>
          </>
        )}
      </div>
    </div>
  )
}

const COMPETITOR_COLORS = {
  primary: 'hsl(221.2 83.2% 53.3%)', // Keep blue for main company
  competitors: [
    '#4c1d95', // Darkest purple - 1st competitor
    '#5b21b6', // 2nd competitor
    '#6d28d9', // 3rd competitor
    '#7c3aed', // 4th competitor
    '#8b5cf6'  // Lightest purple - 5th competitor
  ],
  highlight: '#9333ea',
  rest: '#e9d5ff'
}

const ENGINE_COLORS = {
  primary: COMPETITOR_COLORS.primary,
  secondary: COMPETITOR_COLORS.competitors[0], // Using darkest purple as default secondary
  background: 'hsl(0 0% 100%)',
  border: 'hsl(214.3 31.8% 91.4%)',
  muted: 'hsl(215.4 16.3% 46.9%)',
  hover: COMPETITOR_COLORS.highlight,
  rest: COMPETITOR_COLORS.rest
}

export function CompetitorAnalysis({ companyId }: CompetitorAnalysisProps) {
  const selectedCompanyId = useDashboardStore(state => state.selectedCompanyId)
  const effectiveCompanyId = companyId ?? selectedCompanyId
  const [activeEngine, setActiveEngine] = useState<string>('perplexity')
  const [view, setView] = useState<'mentions' | 'rankings'>('mentions')
  const [companyName, setCompanyName] = useState<string>('')
  const [competitorData, setCompetitorData] = useState<EngineData>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      if (!effectiveCompanyId) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)
        console.log('Fetching data for company ID:', effectiveCompanyId)

        // Get competitor analysis data with company name
        const { data: analysisData, error: analysisError } = await createClient()
          .from('response_analysis')
          .select(`
            answer_engine,
            buying_journey_stage,
            company_mentioned,
            mentioned_companies,
            ranking_position,
            rank_list,
            company_name,
            response_text
          `)
          .eq('company_id', effectiveCompanyId)

        if (analysisError) throw analysisError
        if (!analysisData?.length) {
          setError('No data available')
          return
        }

        // Get company name from the first record
        const companyName = analysisData[0].company_name
        setCompanyName(companyName)
        console.log('Company name from analysis:', companyName)

        // Process data by engine
        const engineData: EngineData = {}

        analysisData.forEach(record => {
          const engine = record.answer_engine?.toLowerCase()
          if (!engine) return

          // Initialize engine data if not exists with the main company
          if (!engineData[engine]) {
            engineData[engine] = [{
              name: companyName,
              mentions: {
                count: 0,
                percentage: 0
              },
              rankings: {
                position: null,
                frequency: 0
              }
            }]
          }

          // Process mentions (early stages)
          if (MENTION_STAGES.includes(record.buying_journey_stage || '')) {
            // Count if the company being analyzed is mentioned
            if (record.company_mentioned) {
              const companyData = engineData[engine].find(m => m.name === companyName)
              if (companyData) {
                companyData.mentions.count++
              }
            }

            // Process other mentioned companies
            const mentionedCompanies = record.mentioned_companies || []
            mentionedCompanies.forEach(company => {
              if (company === companyName) return // Skip as we already counted it above
              const existingData = engineData[engine].find(m => m.name === company)
              if (existingData) {
                existingData.mentions.count++
              } else {
                engineData[engine].push({
                  name: company,
                  mentions: {
                    count: 1,
                    percentage: 0
                  },
                  rankings: {
                    position: null,
                    frequency: 0
                  }
                })
              }
            })
          }

          // Process rankings (later stages)
          if (RANKING_STAGES.includes(record.buying_journey_stage || '') && record.rank_list) {
            try {
              const rankings = record.rank_list.split('\n')
              rankings.forEach((rankEntry, index) => {
                const company = rankEntry.replace(/^\d+\.\s*/, '').trim()
                if (!company) return
                
                const position = index + 1
                const existingData = engineData[engine].find(r => r.name === company)
                
                if (existingData) {
                  existingData.rankings.frequency++
                  existingData.rankings.position = existingData.rankings.position 
                    ? (existingData.rankings.position * (existingData.rankings.frequency - 1) + position) / existingData.rankings.frequency
                    : position
                } else {
                  engineData[engine].push({
                    name: company,
                    mentions: {
                      count: 0,
                      percentage: 0
                    },
                    rankings: {
                      position: position,
                      frequency: 1
                    }
                  })
                }
              })
            } catch (e) {
              console.warn('Failed to parse rank list:', e)
            }
          }
        })

        // Calculate percentages and limit to top 5 + current company + "Rest"
        const processedEngineData: EngineData = {}
        Object.entries(engineData).forEach(([currentEngine, data]) => {
          // Skip if no data for this engine
          if (!data.length) return

          // Calculate initial percentages
          const totalMentions = data.reduce((sum, item) => sum + item.mentions.count, 0)
          data.forEach(item => {
            item.mentions.percentage = (item.mentions.count / totalMentions) * 100
          })

          // Get the main company's data first
          const mainCompanyData = data.find(item => item.name === companyName)
          if (!mainCompanyData) {
            console.warn(`Company ${companyName} not found in data for engine ${currentEngine}`)
            return
          }

          // Sort remaining companies by mentions percentage
          const otherCompanies = data
            .filter(item => item.name !== companyName)
            .sort((a, b) => b.mentions.percentage - a.mentions.percentage)

          // Get top 5 other companies
          const top5 = otherCompanies.slice(0, 5)

          // Calculate "Rest" from remaining companies
          const restCompanies = otherCompanies.slice(5)
          const restCount = restCompanies.reduce((sum, item) => sum + item.mentions.count, 0)
          const restPercentage = restCompanies.reduce((sum, item) => sum + item.mentions.percentage, 0)

          // Create new data array with: main company first, top 5 others
          const engineCompanies: CompetitorData[] = [
            mainCompanyData,
            ...top5
          ]

          // Only add Rest for mentions data
          if (restCompanies.length > 0) {
            engineCompanies.push({
              name: "Rest",
              mentions: {
                count: restCount,
                percentage: restPercentage
              },
              rankings: {
                position: null,
                frequency: 0
              }
            })
          }

          processedEngineData[currentEngine] = engineCompanies
        })

        setCompetitorData(processedEngineData)
      } catch (err) {
        console.error('Error fetching competitor data:', err)
        setError('Failed to load competitor data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [effectiveCompanyId])

  if (!effectiveCompanyId) {
    return (
      <Card className="relative overflow-hidden border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/20" />
        <div className="relative p-8">
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="rounded-full bg-muted/10 p-4 shadow-sm">
              <BarChart3 className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-medium">No Company Selected</h3>
              <p className="text-sm text-muted-foreground">
                Select a company to view competitor analysis
              </p>
            </div>
          </div>
        </div>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card className="relative overflow-hidden border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/20" />
        <div className="relative p-8 space-y-8">
          <div className="space-y-2">
            <div className="h-6 w-1/4 animate-pulse rounded-md bg-muted/20" />
            <div className="h-4 w-1/2 animate-pulse rounded-md bg-muted/20" />
          </div>
          <div className="h-[350px] animate-pulse rounded-lg bg-muted/20" />
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="relative overflow-hidden border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/20" />
        <div className="relative p-8">
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="rounded-full bg-red-500/10 p-4 shadow-sm">
              <AlertCircle className="h-8 w-8 text-red-500/70" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-medium text-red-500">Error Loading Data</h3>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
        </div>
      </Card>
    )
  }

  const currentEngineData = competitorData[activeEngine]

  return (
    <div className="space-y-8">
      <Card className="relative overflow-hidden border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/20" />
        <div className="relative p-8 space-y-8">
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold tracking-tight">
                  Competitor Analysis
                </h2>
                <Badge 
                  variant="outline" 
                  className="text-xs font-medium bg-primary/5 text-primary border-primary/20"
                >
                  {companyName}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Compare competitor mentions and rankings across AI engines
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Tabs
              value={activeEngine}
              onValueChange={(value) => {
                setActiveEngine(value)
              }}
              className="w-auto"
            >
              <TabsList className="bg-muted/10 p-1 h-9 rounded-lg">
                {Object.entries(ENGINE_NAMES).map(([key, label]) => (
                  <TabsTrigger
                    key={key}
                    value={key}
                    disabled={!competitorData[key]}
                    className={cn(
                      "px-3 h-7 rounded-md transition-all duration-200",
                      "text-sm font-medium",
                      "data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm",
                      "data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:bg-muted/5",
                      "data-[disabled]:opacity-40 data-[disabled]:cursor-not-allowed"
                    )}
                  >
                    {label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            <Tabs
              value={view}
              onValueChange={(value: string) => {
                setView(value as 'mentions' | 'rankings')
              }}
              className="w-auto"
            >
              <TabsList className="bg-muted/10 p-1 h-9 rounded-lg">
                <TabsTrigger
                  value="mentions"
                  className={cn(
                    "px-3 h-7 rounded-md transition-all duration-200",
                    "text-sm font-medium",
                    "data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm",
                    "data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:bg-muted/5"
                  )}
                >
                  Mentions
                </TabsTrigger>
                <TabsTrigger
                  value="rankings"
                  className={cn(
                    "px-3 h-7 rounded-md transition-all duration-200",
                    "text-sm font-medium",
                    "data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm",
                    "data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:bg-muted/5"
                  )}
                >
                  Rankings
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <AnimatePresence mode="wait">
            {currentEngineData && (
              <motion.div
                key={`${activeEngine}-${view}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <CompetitorChart
                  data={currentEngineData}
                  companyName={companyName}
                  type={view}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>
    </div>
  )
} 