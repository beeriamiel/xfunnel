'use client'

import { useState, useEffect, useMemo, memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart3, AlertCircle, Globe, Info } from "lucide-react"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { createClient } from '@/app/supabase/client'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
  Tooltip
} from "@/components/ui/tooltip"
import { SourcesAnalysisMentions } from './source-analysis/sources-analysis-mentions'
import { SourcesAnalysisRankings } from './source-analysis/sources-analysis-rankings'
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { TopCitedSources } from './source-analysis/top-cited-sources'
import { Separator } from "@/components/ui/separator"

// Constants for journey stages
const MENTION_STAGES = ['problem_exploration', 'solution_education']
const RANKING_STAGES = ['solution_comparison', 'final_research']

// Add color constants at the top of the file
const COLORS = {
  perplexity: '#ff6b6b',     // Brighter coral
  claude: '#12b886',         // Mint
  gemini: '#4c6ef5',         // Indigo
  searchgpt: '#fcc419',      // Yellow
  aio: '#ff922b',           // Orange
  default: '#adb5bd'        // Gray
}

// Add at the top with other constants
const PURPLE_PALETTE = {
  base: '#7c3aed', // Main purple
  shades: [
    '#4c1d95', // Darkest
    '#5b21b6',
    '#6d28d9',
    '#7c3aed',
    '#8b5cf6'  // Lightest
  ],
  highlight: '#9333ea',
  muted: '#e9d5ff'
}

interface CitationAnalysisProps {
  companyId: number
}

interface CompetitorData {
  name: string
  mentions: {
    count: number
    percentage: number
    sources: ResponseAnalysis[]
  }
  rankings: {
    averagePosition: number | null
    frequency: number
    sources: ResponseAnalysis[]
  }
}

// Add ResponseAnalysis interface to match DB schema
interface ResponseAnalysis {
  id: number
  response_id: number | null
  citations_parsed: any | null
  recommended: boolean | null
  cited: boolean | null
  created_at: string | null
  sentiment_score: number | null
  ranking_position: number | null
  company_mentioned: boolean | null
  geographic_region: string | null
  industry_vertical: string | null
  buyer_persona: string | null
  buying_journey_stage: string | null
  response_text: string | null
  rank_list: string | null
  company_id: number
  answer_engine: string
  query_text: string | null
  query_id: number | null
  company_name: string
  prompt_id: number | null
  prompt_name: string | null
  competitors_list: string[] | null
  mentioned_companies: string[] | null
  solution_analysis: any | null
  analysis_batch_id: string | null
  created_by_batch: boolean | null
  icp_vertical: string | null
}

// Update ExtendedSourceAnalysis to include UI-specific fields
interface ExtendedSourceAnalysis extends ResponseAnalysis {
  citationCount: number
  contentMetrics: CitationMetrics
  queries: QueryCitation[]
  // UI specific fields
  url?: string
  domain?: string
  domainAuthority?: number
  urlType?: 'owned' | 'ugc' | 'affiliate'
  rank?: number | null
}

interface SourceAnalysis {
  url: string
  buyingJourneyStage: string
  companyId: number
  companyName: string
  mentionedCompetitors: string[]
  companyMentioned: boolean
  rank: number | null
  markdown: string
  domainAuthority: number
  topKeywords: string[]
  urlType: 'owned' | 'ugc' | 'affiliate'
  domain: string
}

interface CitationMetrics {
  keywordStuffing: number
  uniqueWords: number
  readability: number
  authority: number
  technicalTerms: number
  fluency: number
  citations: number
  quotations: number
  statistics: number
}

interface QueryCitation {
  text: string
  date: string
  context: string
}

// Database types
interface RawCitation {
  id: number
  created_at: string | null
  citation_url: string
  citation_order: number
  response_analysis_id: number
  company_id: number
  recommended: boolean | null
  company_mentioned: boolean | null
  buyer_persona: string | null
  buyer_journey_phase: string | null
  rank_list: string | null
  mentioned_companies: string[] | null
  icp_vertical: string | null
  response_text: string | null
  region: string | null
  ranking_position: number | null
  updated_at: string | null
  domain_authority: number | null
  source_type: string | null
  query_text: string | null
  content_analysis: string | null
}

// Application types
interface Citation {
  id: number
  created_at: string
  citation_url: string
  citation_order: number
  response_analysis_id: number
  company_id: number
  recommended: boolean | null
  company_mentioned: boolean | null
  buyer_persona: string | null
  buying_journey_stage: string | null
  rank_list: string | null
  mentioned_companies: string[]
  icp_vertical: string | null
  response_text: string | null
  region: string | null
  ranking_position: number | null
  updated_at: string
  domain_authority: number | null
  source_type: string | null
  query_text: string | null
  content_analysis: string | null
}

// Helper function to safely convert dates
function toISOString(date: string | null): string {
  if (!date) return new Date().toISOString()
  try {
    return new Date(date).toISOString()
  } catch {
    return new Date().toISOString()
  }
}

// Type guard for raw citation data
function isValidCitation(item: any): item is RawCitation {
  return (
    item &&
    typeof item.id === 'number' &&
    typeof item.citation_url === 'string' &&
    typeof item.citation_order === 'number' &&
    typeof item.response_analysis_id === 'number' &&
    typeof item.company_id === 'number'
  )
}

// Convert raw citation to application citation
function convertToCitation(raw: RawCitation): Citation {
  return {
    id: raw.id,
    created_at: toISOString(raw.created_at),
    citation_url: raw.citation_url,
    citation_order: raw.citation_order,
    response_analysis_id: raw.response_analysis_id,
    company_id: raw.company_id,
    recommended: raw.recommended || null,
    company_mentioned: raw.company_mentioned || null,
    buyer_persona: raw.buyer_persona || null,
    buying_journey_stage: raw.buyer_journey_phase || null,
    rank_list: raw.rank_list || null,
    mentioned_companies: Array.isArray(raw.mentioned_companies) ? raw.mentioned_companies : [],
    icp_vertical: raw.icp_vertical || null,
    response_text: raw.response_text || null,
    region: raw.region || null,
    ranking_position: typeof raw.ranking_position === 'number' ? raw.ranking_position : null,
    updated_at: toISOString(raw.updated_at),
    domain_authority: typeof raw.domain_authority === 'number' ? raw.domain_authority : null,
    source_type: raw.source_type || null,
    query_text: raw.query_text || null,
    content_analysis: typeof raw.content_analysis === 'string' ? raw.content_analysis : null
  }
}

interface ParsedContentAnalysis {
  metrics: {
    keyword_usage: MetricScore
    statistics: MetricScore
    quotations: MetricScore
    citations: MetricScore
    fluency: MetricScore
    technical_terms: MetricScore
    authority: MetricScore
    readability: MetricScore
    unique_words: MetricScore
  }
  analysis_details: {
    total_words: number
    avg_sentence_length: number
    keyword_density: number
    technical_term_count: number
    statistics_count: number
    quote_count: number
    citation_count: number
  }
}

interface MetricScore {
  score: number
  components: {
    [key: string]: number
  }
}

// Utility type for grouped citations
interface GroupedCitation {
  url: string
  domain: string
  citations: Citation[]
  citationCount: number
  latestCitation: Citation
}

// Utility functions for citation processing
function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname.replace('www.', '')
  } catch (e) {
    // If URL parsing fails, try basic string manipulation
    const match = url.match(/(?:https?:\/\/)?(?:www\.)?([^\/]+)/)
    return match ? match[1] : url
  }
}

function groupCitationsByUrl(citations: Citation[]): GroupedCitation[] {
  const groupedMap = new Map<string, GroupedCitation>()

  citations.forEach(citation => {
    const url = citation.citation_url
    const domain = extractDomain(url)

    if (!groupedMap.has(url)) {
      groupedMap.set(url, {
        url,
        domain,
        citations: [],
        citationCount: 0,
        latestCitation: citation
      })
    }

    const group = groupedMap.get(url)!
    group.citations.push(citation)
    group.citationCount++

    // Update latest citation if this one is newer
    if (new Date(citation.created_at) > new Date(group.latestCitation.created_at)) {
      group.latestCitation = citation
    }
  })

  return Array.from(groupedMap.values())
    .sort((a, b) => b.citationCount - a.citationCount)
}

// Helper function to parse content analysis
function parseContentAnalysis(contentAnalysisJson: string | null): CitationMetrics {
  const defaultMetrics: CitationMetrics = {
    keywordStuffing: 0,
    uniqueWords: 0,
    readability: 0,
    authority: 0,
    technicalTerms: 0,
    fluency: 0,
    citations: 0,
    quotations: 0,
    statistics: 0
  }

  if (!contentAnalysisJson) {
    return defaultMetrics
  }

  try {
    const analysis = JSON.parse(contentAnalysisJson) as ParsedContentAnalysis
    return {
      keywordStuffing: analysis.metrics.keyword_usage.score,
      uniqueWords: analysis.metrics.unique_words.score,
      readability: analysis.metrics.readability.score,
      authority: analysis.metrics.authority.score,
      technicalTerms: analysis.metrics.technical_terms.score,
      fluency: analysis.metrics.fluency.score,
      citations: analysis.metrics.citations.score,
      quotations: analysis.metrics.quotations.score,
      statistics: analysis.metrics.statistics.score
    }
  } catch (e) {
    console.warn('Failed to parse content analysis:', e)
    return defaultMetrics
  }
}

function mapCitationToSourceAnalysis(groupedCitation: GroupedCitation): ExtendedSourceAnalysis {
  const latestCitation = groupedCitation.latestCitation

  return {
    id: latestCitation.id,
    response_id: null,
    citations_parsed: null,
    recommended: latestCitation.recommended,
    cited: null,
    created_at: latestCitation.created_at,
    sentiment_score: null,
    ranking_position: latestCitation.ranking_position,
    company_mentioned: latestCitation.company_mentioned || false,
    geographic_region: null,
    industry_vertical: null,
    buyer_persona: latestCitation.buyer_persona,
    buying_journey_stage: latestCitation.buying_journey_stage,
    response_text: latestCitation.response_text || '',
    rank_list: latestCitation.rank_list,
    company_id: latestCitation.company_id,
    answer_engine: 'citation',
    query_text: latestCitation.query_text,
    query_id: null,
    company_name: '',
    prompt_id: null,
    prompt_name: null,
    competitors_list: [],
    mentioned_companies: latestCitation.mentioned_companies || [],
    solution_analysis: null,
    analysis_batch_id: null,
    created_by_batch: null,
    icp_vertical: latestCitation.icp_vertical,
    // UI specific fields
    url: groupedCitation.url,
    domain: groupedCitation.domain,
    domainAuthority: latestCitation.domain_authority || 0,
    urlType: (latestCitation.source_type as 'owned' | 'ugc' | 'affiliate') || 'ugc',
    citationCount: groupedCitation.citationCount,
    contentMetrics: parseContentAnalysis(latestCitation.content_analysis),
    queries: groupedCitation.citations.map(citation => ({
      text: citation.query_text || '',
      date: new Date(citation.created_at || '').toLocaleDateString(),
      context: citation.response_text || ''
    }))
  }
}

interface CompetitorChartProps {
  data: CompetitorData[]
  type: 'mentions' | 'rankings'
  onCompetitorSelect: (name: string) => void
  currentCompanyName?: string
  selectedCompany?: string | null
}

const MemoizedCompetitorChart = memo(CompetitorChart, (prevProps, nextProps) => {
  // Re-render if data, currentCompanyName, type, or selectedCompany changes
  return (
    prevProps.data === nextProps.data &&
    prevProps.currentCompanyName === nextProps.currentCompanyName &&
    prevProps.type === nextProps.type &&
    prevProps.selectedCompany === nextProps.selectedCompany
  )
})

function CompetitorChart({ 
  data,
  type,
  onCompetitorSelect,
  currentCompanyName,
  selectedCompany
}: CompetitorChartProps) {
  // Calculate total mentions for ALL competitors first
  const totalMentions = data.reduce((sum, item) => sum + item.mentions.count, 0)

  // Get top 5 sorted - update sorting for rankings
  const top5Data = [...data]
    .sort((a, b) => {
      if (type === 'mentions') {
        return b.mentions.count - a.mentions.count
      } else {
        if (a.rankings.averagePosition === null && b.rankings.averagePosition === null) {
          return b.rankings.frequency - a.rankings.frequency
        }
        if (a.rankings.averagePosition === null) return 1
        if (b.rankings.averagePosition === null) return -1
        // Sort by position first (lower is better), then by frequency
        const positionDiff = (a.rankings.averagePosition) - (b.rankings.averagePosition)
        return positionDiff !== 0 ? positionDiff : b.rankings.frequency - a.rankings.frequency
      }
    })
    .slice(0, 5)

  // Helper function to get color based on index and highlight status
  const getColor = (index: number, isCurrentCompany: boolean) => {
    if (isCurrentCompany) return PURPLE_PALETTE.highlight
    return PURPLE_PALETTE.shades[index % PURPLE_PALETTE.shades.length]
  }

  const handlePieClick = (entry: any) => {
    if (entry && entry.name && entry.name !== 'Others') {
      onCompetitorSelect(entry.name)
    }
  }

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: any) => {
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    )
  }

  // Create normalized data including "Others"
  const normalizedData = [
    ...top5Data.map(item => ({
      ...item,
      mentions: {
        ...item.mentions,
        percentage: (item.mentions.count / totalMentions) * 100
      }
    })),
    {
      name: 'Others',
      mentions: {
        count: totalMentions - top5Data.reduce((sum, item) => sum + item.mentions.count, 0),
        percentage: ((totalMentions - top5Data.reduce((sum, item) => sum + item.mentions.count, 0)) / totalMentions) * 100,
        sources: []
      },
      rankings: { averagePosition: null, frequency: 0, sources: [] }
    }
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-6">
        <div className="relative h-[300px] rounded-lg border bg-gradient-to-b from-background to-muted/20 p-4">
          <ResponsiveContainer width="100%" height="100%">
            {type === 'mentions' ? (
              <PieChart>
                <Pie
                  data={normalizedData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={100}
                  fill={PURPLE_PALETTE.base}
                  dataKey="mentions.percentage"
                  onClick={handlePieClick}
                  className="cursor-pointer"
                >
                  {normalizedData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.name === 'Others' 
                        ? PURPLE_PALETTE.muted 
                        : getColor(index, entry.name === currentCompanyName)
                      }
                      className={cn(
                        entry.name !== 'Others' && 'hover:opacity-80 transition-opacity',
                        entry.name === currentCompanyName && 'filter drop-shadow-md'
                      )}
                    />
                  ))}
                </Pie>
                <RechartsTooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      const isCurrentCompany = data.name === currentCompanyName
                      return (
                        <div className={cn(
                          "rounded-lg border bg-background p-2 shadow-md",
                          isCurrentCompany && "ring-2 ring-purple-500/20"
                        )}>
                          <p className="font-medium flex items-center gap-2">
                            {data.name}
                            {isCurrentCompany && <span className="text-xs text-purple-500">(Current)</span>}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {type === 'mentions' 
                              ? `${data.mentions.percentage.toFixed(1)}% (${data.mentions.count})`
                              : data.rankings.averagePosition 
                                ? `#${data.rankings.averagePosition.toFixed(1)} (${data.rankings.frequency}x)`
                                : 'N/A'
                            }
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
              </PieChart>
            ) : (
              <RechartsBarChart
                data={top5Data}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 70, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis 
                  type="number" 
                  domain={[0, 'auto']}
                  tickFormatter={(value: number) => `#${value}`}
                />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  width={60}
                />
                <RechartsTooltip 
                  cursor={{ fill: 'transparent' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      const isCurrentCompany = data.name === currentCompanyName
                      return (
                        <div className={cn(
                          "rounded-lg border bg-background p-2 shadow-md",
                          isCurrentCompany && "ring-2 ring-purple-500/20"
                        )}>
                          <p className="font-medium flex items-center gap-2">
                            {data.name}
                            {isCurrentCompany && <span className="text-xs text-purple-500">(Current)</span>}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {`Ranked #${data.rankings.averagePosition?.toFixed(1)} (${data.rankings.frequency} mentions)`}
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Bar 
                  dataKey="rankings.averagePosition"
                  fill={PURPLE_PALETTE.base}
                  radius={[4, 4, 4, 4]}
                  onClick={handlePieClick}
                  className="cursor-pointer"
                >
                  {top5Data.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={getColor(index, entry.name === currentCompanyName)}
                      className={cn(
                        'transition-all duration-200',
                        entry.name === currentCompanyName && 'filter drop-shadow-md'
                      )}
                    />
                  ))}
                </Bar>
              </RechartsBarChart>
            )}
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg border shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead className="text-right">
                  {type === 'mentions' ? 'Mentions' : 'Position'}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {top5Data.map((item, index) => {
                const isCurrentCompany = item.name === currentCompanyName
                const isSelected = item.name === selectedCompany
                return (
                  <TableRow 
                    key={item.name}
                    className={cn(
                      "cursor-pointer transition-all",
                      isSelected && "bg-gradient-to-r from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-900/10 border-l-2 border-l-purple-500",
                      isCurrentCompany && !isSelected && "bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/10 dark:hover:bg-purple-900/20",
                      !isSelected && !isCurrentCompany && "hover:bg-muted/50"
                    )}
                    onClick={() => onCompetitorSelect(item.name)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div 
                          className={cn(
                            "w-3 h-3 rounded-full",
                            isCurrentCompany && "ring-2 ring-purple-500/20",
                            isSelected && "ring-2 ring-purple-500"
                          )}
                          style={{ 
                            backgroundColor: getColor(index, isCurrentCompany)
                          }}
                        />
                        <span className={cn(
                          isCurrentCompany && "font-medium text-purple-700 dark:text-purple-300",
                          isSelected && "font-semibold text-purple-800 dark:text-purple-200"
                        )}>
                          {item.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className={cn(
                      "text-right",
                      isSelected && "font-medium text-purple-800 dark:text-purple-200"
                    )}>
                      {type === 'mentions' 
                        ? `${(item.mentions.count / totalMentions * 100).toFixed(1)}% (${item.mentions.count})`
                        : item.rankings.averagePosition 
                          ? `#${item.rankings.averagePosition.toFixed(1)} (${item.rankings.frequency}x)`
                          : 'N/A'
                      }
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}

function SourceCard({ source, onAnalyze, onOpenModal, type }: { 
  source: ExtendedSourceAnalysis
  onAnalyze: (source: ExtendedSourceAnalysis) => void 
  onOpenModal: () => void
  type: 'mentions' | 'rankings'
}) {
  // Calculate remaining companies count
  const displayedCompanies = source.mentioned_companies?.slice(0, 5) || []
  const remainingCount = Math.max(0, (source.mentioned_companies?.length || 0) - 5)

  return (
    <Card 
      className="group relative cursor-pointer transition-all duration-300 hover:shadow-md overflow-hidden border-border/50 hover:border-primary/20" 
      onClick={() => {
        onAnalyze(source)
        onOpenModal()
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/10 transition-opacity group-hover:opacity-50" />
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/20 via-primary/30 to-primary/20" />
      
      <div className="relative">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-gradient-to-br from-primary/10 to-primary/20">
                <Globe className="h-4 w-4 text-primary" />
              </div>
              <span className="text-base font-semibold bg-gradient-to-r from-primary/90 to-primary bg-clip-text text-transparent">
                {source.domain}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {source.domainAuthority && (
                <Badge variant="secondary" className="bg-gradient-to-r from-gemini/10 to-gemini/20 text-gemini border-gemini/20">
                  DA: {source.domainAuthority}
                </Badge>
              )}
              <Badge variant="outline" className="bg-gradient-to-r from-claude/10 to-claude/20 text-claude border-claude/20">
                {source.citationCount} citations
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <a 
            href={source.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground/70 hover:text-primary truncate block transition-colors"
            onClick={e => e.stopPropagation()}
          >
            {source.url}
          </a>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {source.company_mentioned ? (
                <Badge variant="default" className="bg-gradient-to-r from-claude/10 to-claude/20 text-claude border-claude/20">
                  Mentioned
                </Badge>
              ) : (
                <Badge variant="outline" className="text-muted-foreground/70">
                  Not Mentioned
                </Badge>
              )}
              {source.urlType && (
                <Badge 
                  variant="outline" 
                  className={cn(
                    "capitalize border transition-colors",
                    source.urlType === 'owned' && "bg-gradient-to-r from-perplexity/10 to-perplexity/20 text-perplexity border-perplexity/20",
                    source.urlType === 'ugc' && "bg-gradient-to-r from-gemini/10 to-gemini/20 text-gemini border-gemini/20",
                    source.urlType === 'affiliate' && "bg-gradient-to-r from-aio/10 to-aio/20 text-aio border-aio/20"
                  )}
                >
                  {source.urlType}
                </Badge>
              )}
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-0 translate-x-2">
              <Badge 
                variant="secondary" 
                className="cursor-pointer bg-gradient-to-r from-searchgpt/10 to-searchgpt/20 text-searchgpt hover:from-searchgpt/20 hover:to-searchgpt/30 transition-colors"
              >
                View Analysis →
              </Badge>
            </div>
          </div>

          {type === 'mentions' ? (
            <div className="pt-3 border-t border-border/50">
              <span className="text-xs font-medium text-muted-foreground/80 uppercase tracking-wider flex items-center gap-2 mb-3">
                <div className="h-1 w-1 rounded-full bg-primary/60" />
                Companies mentioned
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {displayedCompanies.map((comp: string, i: number) => (
                  <Badge 
                    key={i} 
                    variant="outline" 
                    className="text-xs bg-gradient-to-r from-background to-muted/30 hover:from-muted/20 hover:to-muted/40 transition-colors truncate"
                  >
                    {comp}
                  </Badge>
                ))}
                {remainingCount > 0 && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge 
                          variant="outline" 
                          className="text-xs bg-gradient-to-r from-primary/5 to-primary/10 hover:from-primary/10 hover:to-primary/20 text-primary/80 transition-colors cursor-help"
                        >
                          and {remainingCount} more
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[280px]">
                        <div className="space-y-1.5">
                          {source.mentioned_companies?.slice(5).map((comp: string, i: number) => (
                            <div key={i} className="text-xs">{comp}</div>
                          ))}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </div>
          ) : source.ranking_position && (
            <div className="pt-3 border-t border-border/50">
              <span className="text-xs font-medium text-muted-foreground/80 uppercase tracking-wider flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-primary/60" />
                Ranking position
              </span>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="default" className="bg-gradient-to-r from-primary/10 to-primary/20 text-primary border-primary/20">
                  #{source.ranking_position}
                </Badge>
              </div>
            </div>
          )}

          {source.queries.length > 0 && (
            <div className="pt-3 border-t border-border/50">
              <span className="text-xs font-medium text-muted-foreground/80 uppercase tracking-wider flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-primary/60" />
                Latest query
              </span>
              <p className="text-sm truncate mt-2 text-muted-foreground/80 pl-3">
                {source.queries[0].text}
              </p>
            </div>
          )}
        </CardContent>
      </div>
    </Card>
  )
}

function ContentMetricsChart({ metrics }: { metrics: CitationMetrics }) {
  const data = [
    { subject: 'Keyword Usage', value: metrics.keywordStuffing },
    { subject: 'Unique Words', value: metrics.uniqueWords },
    { subject: 'Readability', value: metrics.readability },
    { subject: 'Authority', value: metrics.authority },
    { subject: 'Technical Terms', value: metrics.technicalTerms },
    { subject: 'Fluency', value: metrics.fluency },
    { subject: 'Citations', value: metrics.citations },
    { subject: 'Quotations', value: metrics.quotations },
    { subject: 'Statistics', value: metrics.statistics },
  ]

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
        <PolarGrid stroke="#e2e8f0" strokeWidth={0.5} />
        <PolarAngleAxis 
          dataKey="subject" 
          tick={{ fill: '#64748b', fontSize: 12 }}
          stroke="#e2e8f0"
          strokeWidth={0.5}
        />
        <PolarRadiusAxis 
          angle={30} 
          domain={[0, 100]} 
          stroke="#e2e8f0"
          strokeWidth={0.5}
          tick={{ fill: '#64748b', fontSize: 12 }}
        />
        <Radar
          name="Content Quality"
          dataKey="value"
          stroke="#7c3aed"
          strokeWidth={1}
          fill="#7c3aed"
          fillOpacity={0.2}
        />
        <RechartsTooltip 
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="rounded-lg border bg-background/95 p-2 shadow-sm">
                  <p className="text-sm font-medium">
                    {payload[0].payload.subject}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Score: {payload[0].value}
                  </p>
                </div>
              )
            }
            return null
          }}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}

interface QueryCardProps {
  query: QueryCitation
  onViewResponse: () => void
}

function QueryCard({ query, onViewResponse }: QueryCardProps) {
  return (
    <Card className="group p-4 space-y-2 hover:bg-muted/5 transition-all hover:shadow-sm border-border/50">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary/60" />
            <p className="font-medium text-sm leading-relaxed">{query.text}</p>
          </div>
          <time className="text-xs text-muted-foreground/70 ml-4">{query.date}</time>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={onViewResponse}
          className="shrink-0 bg-gradient-to-r from-primary/10 via-primary/20 to-primary/10 hover:from-primary/20 hover:via-primary/30 hover:to-primary/20 transition-all hover:-translate-y-0.5"
        >
          View Response →
        </Button>
      </div>
    </Card>
  )
}

interface QueryResponseModalProps {
  query: QueryCitation | null
  isOpen: boolean
  onClose: () => void
}

function QueryResponseModal({ query, isOpen, onClose }: QueryResponseModalProps) {
  if (!query) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] p-0 bg-background/80">
        <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-background via-muted/20 to-background sticky top-0 z-10">
          <DialogTitle className="text-lg font-semibold">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary/60" />
              Query Response
            </div>
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2 mt-1">
            <time className="text-sm text-muted-foreground">{query.date}</time>
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-4 space-y-4">
          {/* Query Section */}
          <div className="relative rounded-lg border bg-gradient-to-br from-muted/20 via-background to-muted/10 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-1 w-1 rounded-full bg-primary/60" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Query</span>
            </div>
            <p className="text-sm leading-relaxed pl-3">{query.text}</p>
          </div>

          {/* Response Section */}
          <ScrollArea className="h-[350px] pr-4 -mr-4">
            <div className="relative rounded-lg border bg-gradient-to-br from-muted/30 via-background to-muted/20 p-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-1 w-1 rounded-full bg-primary/60" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Response</span>
              </div>
              <div className="prose prose-sm max-w-none pl-3">
                {query.context}
              </div>
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface CompanyGridProps {
  companies: string[] | null
  onSelect: (company: string) => void
  selectedCompany: string | null
}

function CompanyGrid({ companies = [], onSelect, selectedCompany }: CompanyGridProps) {
  const [showAll, setShowAll] = useState(false)
  const safeCompanies = companies || []
  const visibleCompanies = showAll ? safeCompanies : safeCompanies.slice(0, 5)
  const remainingCount = Math.max(0, safeCompanies.length - 5)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        {visibleCompanies.map((company: string, i: number) => (
          <button
            key={i}
            onClick={() => onSelect(company)}
            className={cn(
              "px-3 py-2 rounded-md text-sm font-medium text-left transition-colors",
              "hover:bg-muted/50",
              selectedCompany === company ? "bg-primary/10 text-primary" : "bg-muted/20"
            )}
          >
            {company}
          </button>
        ))}
      </div>
      {!showAll && remainingCount > 0 && (
        <Button
          variant="ghost"
          className="w-full text-muted-foreground hover:text-primary"
          onClick={() => setShowAll(true)}
        >
          Show {remainingCount} more
        </Button>
      )}
    </div>
  )
}

// Add helper function to parse rank list string
function parseRankList(rankListStr: string | null): string[] {
  if (!rankListStr) return []
  
  // Split by number pattern (e.g. "1.", "2.", "3.")
  // and filter out empty strings and clean up company names
  const parts = rankListStr.split(/\d+\./)
  return parts
    .map(s => s.trim())
    .filter((s): s is string => Boolean(s))
}

// Update the CitationModal component to use CompanyGrid
function CitationModal({ 
  source, 
  isOpen, 
  onClose,
  type
}: { 
  source: ExtendedSourceAnalysis | null
  isOpen: boolean
  onClose: () => void
  type: 'mentions' | 'rankings'
}) {
  const [selectedQuery, setSelectedQuery] = useState<QueryCitation | null>(null)
  const [isResponseModalOpen, setIsResponseModalOpen] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null)

  if (!source) return null

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              {source.domain}
            </DialogTitle>
            <DialogDescription>
              <a 
                href={source.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-primary"
              >
                {source.url}
              </a>
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="analysis">
            <TabsList>
              <TabsTrigger value="analysis">Source Analysis</TabsTrigger>
              <TabsTrigger value="metrics">Content Quality</TabsTrigger>
            </TabsList>
            
            <TabsContent value="analysis" className="space-y-4">
              <div className="grid grid-cols-[2fr_3fr] gap-6">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Source Details</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Type:</span>
                        <Badge>{source.urlType}</Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Journey Phase:</span>
                        <Badge variant="outline">{source.buying_journey_stage}</Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Domain Authority:</span>
                        <span>{source.domainAuthority}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Citations:</span>
                        <span>{source.citationCount}</span>
                      </div>
                    </div>
                  </div>

                  {type === 'mentions' ? (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Companies Mentioned</h4>
                      <CompanyGrid
                        companies={source.mentioned_companies}
                        onSelect={setSelectedCompany}
                        selectedCompany={selectedCompany}
                      />
                    </div>
                  ) : (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Rankings</h4>
                      <div className="space-y-2">
                        {source.mentioned_companies?.map((comp, i) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span>{comp}</span>
                            <Badge variant="outline">#{i + 1}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-3">Queries that cited this source</h4>
                  <ScrollArea className="h-[300px] rounded-md border">
                    <div className="p-4 space-y-4">
                      {source.queries.map((query, i) => (
                        <QueryCard
                          key={i}
                          query={query}
                          onViewResponse={() => {
                            setSelectedQuery(query)
                            setIsResponseModalOpen(true)
                          }}
                        />
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="metrics">
              <div className="h-[300px]">
                <ContentMetricsChart metrics={source.contentMetrics} />
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <QueryResponseModal
        query={selectedQuery}
        isOpen={isResponseModalOpen}
        onClose={() => {
          setIsResponseModalOpen(false)
          setSelectedQuery(null)
        }}
      />
    </>
  )
}

// Add placeholder data generator
function generatePlaceholderSource(index: number, competitor: string): ExtendedSourceAnalysis {
  const domains = [
    'techcrunch.com',
    'g2.com',
    'reddit.com/r/saas',
    'capterra.com',
    'medium.com'
  ]
  
  const domain = domains[index % domains.length]
  const urlTypes: Array<'owned' | 'ugc' | 'affiliate'> = ['owned', 'ugc', 'affiliate']
  const isRanking = Math.random() > 0.5

  return {
    id: index,
    response_id: null,
    citations_parsed: null,
    recommended: null,
    cited: null,
    created_at: new Date().toISOString(),
    sentiment_score: null,
    ranking_position: isRanking ? Math.floor(Math.random() * 5) + 1 : null,
    company_mentioned: Math.random() > 0.3,
    geographic_region: null,
    industry_vertical: null,
    buyer_persona: null,
    buying_journey_stage: isRanking ? 'solution_comparison' : 'problem_exploration',
    response_text: "Placeholder content",
    rank_list: null,
    company_id: 1,
    answer_engine: 'placeholder',
    query_text: null,
    query_id: null,
    company_name: competitor,
    prompt_id: null,
    prompt_name: null,
    competitors_list: [],
    mentioned_companies: [competitor, 'Competitor A', 'Competitor B'],
    solution_analysis: null,
    analysis_batch_id: null,
    created_by_batch: null,
    icp_vertical: null,
    // UI specific fields
    url: `https://www.${domain}/article-${index + 1}-about-${competitor.toLowerCase()}`,
    domain: domain,
    domainAuthority: Math.floor(Math.random() * 60) + 40,
    urlType: urlTypes[Math.floor(Math.random() * urlTypes.length)],
    citationCount: Math.floor(Math.random() * 20) + 1,
    contentMetrics: {
      keywordStuffing: Math.random() * 100,
      uniqueWords: Math.random() * 100,
      readability: Math.random() * 100,
      authority: Math.random() * 100,
      technicalTerms: Math.random() * 100,
      fluency: Math.random() * 100,
      citations: Math.random() * 100,
      quotations: Math.random() * 100,
      statistics: Math.random() * 100
    },
    queries: [{
      text: `Query about ${competitor}`,
      date: new Date().toLocaleDateString(),
      context: "Placeholder context"
    }]
  }
}

// Add helper function for info popovers
function InfoPopover({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-5 w-5 rounded-full hover:bg-muted/50"
        >
          <Info className="h-4 w-4 text-muted-foreground" />
          <span className="sr-only">Info</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        {title && (
          <div className="mb-2 font-medium">{title}</div>
        )}
        <div className="text-sm text-muted-foreground">
          {children}
        </div>
      </PopoverContent>
    </Popover>
  )
}

interface CompetitorSectionProps {
  title: string
  type: 'mentions' | 'rankings'
  data: CompetitorData[]
  currentCompanyName?: string
  companyId: number
  onCompetitorSelect: (name: string) => void
  selectedCompetitor?: string
}

const CompetitorSection = memo(({ 
  title, 
  type,
  data,
  currentCompanyName,
  companyId,
  onCompetitorSelect,
  selectedCompetitor 
}: CompetitorSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle>{title}</CardTitle>
          <InfoPopover title={type === 'mentions' ? "About Competitor Mentions" : "About Rankings Analysis"}>
            {type === 'mentions' ? (
              <>
                <p>These mentions come from AI responses to general questions about solutions, without specifically targeting any company.</p>
                <p className="mt-2">The chart shows which companies the AI naturally associates with solutions in your space.</p>
              </>
            ) : (
              <>
                <p>These rankings come from AI responses when explicitly asked to compare and rank solutions.</p>
                <p className="mt-2">The chart shows how often each company appears in top positions when the AI ranks competitors.</p>
              </>
            )}
            <p className="mt-2">Click on any company to see the sources where they were {type === 'mentions' ? 'mentioned' : 'ranked'}.</p>
          </InfoPopover>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <MemoizedCompetitorChart 
          data={data}
          type={type}
          currentCompanyName={currentCompanyName}
          onCompetitorSelect={onCompetitorSelect}
          selectedCompany={selectedCompetitor}
        />
        <ScrollArea className="h-[400px] rounded-md border">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="font-semibold">Top Sources</h3>
              <InfoPopover 
                title={`About ${type === 'mentions' ? 'Top Sources' : 'Ranking Sources'}`}
              >
                {type === 'mentions' ? (
                  <>
                    <p>These are the sources that the AI referenced when mentioning the selected company in its responses.</p>
                    <p className="mt-2">Click on any source to see:</p>
                    <ul className="mt-1 space-y-1 list-disc list-inside">
                      <li>How many times the AI used it</li>
                      <li>Which questions triggered these citations</li>
                      <li>Other companies mentioned in the same source</li>
                      <li>Content quality metrics that impact AI visibility</li>
                    </ul>
                  </>
                ) : (
                  <>
                    <p>These are the sources the AI used to justify its rankings of competitors.</p>
                    <p className="mt-2">Click on any source to see:</p>
                    <ul className="mt-1 space-y-1 list-disc list-inside">
                      <li>The specific rankings given</li>
                      <li>The context behind the rankings</li>
                      <li>Content quality metrics</li>
                      <li>Other related sources</li>
                    </ul>
                  </>
                )}
              </InfoPopover>
            </div>
            {type === 'mentions' ? (
              <SourcesAnalysisMentions
                companyId={companyId}
                selectedCompetitor={selectedCompetitor}
              />
            ) : (
              <SourcesAnalysisRankings
                companyId={companyId}
                selectedCompetitor={selectedCompetitor}
              />
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
})

CompetitorSection.displayName = 'CompetitorSection'

// Add this component before CitationAnalysis
function ChartLoadingState() {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="relative overflow-hidden border-border rounded-lg p-8 bg-gradient-to-br from-background via-background to-muted/20"
    >
      <div className="flex flex-col items-center justify-center space-y-4">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="rounded-full bg-primary/10 p-4"
        >
          <BarChart3 className="h-8 w-8 text-primary/70" />
        </motion.div>
        <div className="text-center space-y-2">
          <motion.h3 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base font-medium"
          >
            Retrieving competitor data...
          </motion.h3>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-sm text-muted-foreground"
          >
            Preparing charts and analysis
          </motion.p>
        </div>
      </div>
    </motion.div>
  )
}

export function CitationAnalysis({ companyId }: CitationAnalysisProps) {
  const [currentCompanyName, setCurrentCompanyName] = useState<string | null>(null)
  const [data, setData] = useState<CompetitorData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCompetitor, setSelectedCompetitor] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Memoize the competitor data to prevent unnecessary recalculations
  const memoizedData = useMemo(() => data, [data])

  useEffect(() => {
    let isMounted = true

    async function fetchData() {
      if (!companyId) return

      try {
        setIsLoading(true)
        setError(null)

        const supabase = createClient()

        // Fetch company name
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .select('name')
          .eq('id', companyId)
          .single()

        if (companyError) throw companyError
        
        if (isMounted) {
          setCurrentCompanyName(companyData?.name || null)
        }

        // Fetch mentions data
        const { data: mentionsData, error: mentionsError } = await supabase
          .from('response_analysis')
          .select('*')
          .eq('company_id', companyId)
          .in('buying_journey_stage', MENTION_STAGES)
          .not('mentioned_companies', 'is', null)
          .order('created_at', { ascending: false })

        if (mentionsError) throw mentionsError

        // Fetch rankings data
        const { data: rankingsData, error: rankingsError } = await supabase
          .from('response_analysis')
          .select('*')
          .eq('company_id', companyId)
          .in('buying_journey_stage', RANKING_STAGES)
          .not('rank_list', 'is', null)
          .order('created_at', { ascending: false })

        if (rankingsError) throw rankingsError

        // Process competitor data
        const competitorMap = new Map<string, CompetitorData>()

        // Process mentions - only count companies that are actually mentioned
        mentionsData.forEach(response => {
          const mentionedCompanies = response.mentioned_companies || []
          
          mentionedCompanies.forEach(company => {
            if (!competitorMap.has(company)) {
              competitorMap.set(company, {
                name: company,
                mentions: { count: 0, percentage: 0, sources: [] },
                rankings: { averagePosition: null, frequency: 0, sources: [] }
              })
            }

            const compData = competitorMap.get(company)!
            compData.mentions.count++
            compData.mentions.sources.push(response)
          })
        })

        // Process rankings
        rankingsData.forEach(response => {
          const companies = parseRankList(response.rank_list)
          if (!companies.length) return

          companies.forEach((company, index) => {
            if (!competitorMap.has(company)) {
              competitorMap.set(company, {
                name: company,
                mentions: { count: 0, percentage: 0, sources: [] },
                rankings: { averagePosition: null, frequency: 0, sources: [] }
              })
            }

            const compData = competitorMap.get(company)!
            compData.rankings.frequency++
            compData.rankings.sources.push(response)

            // Update average position (1-based index)
            const position = index + 1
            const currentAvg = compData.rankings.averagePosition
            compData.rankings.averagePosition = currentAvg === null 
              ? position 
              : (currentAvg * (compData.rankings.frequency - 1) + position) / compData.rankings.frequency
          })
        })

        // Calculate percentages for mentions
        const totalMentions = Array.from(competitorMap.values())
          .reduce((sum, comp) => sum + comp.mentions.count, 0)
        
        competitorMap.forEach(comp => {
          comp.mentions.percentage = totalMentions > 0 
            ? (comp.mentions.count / totalMentions) * 100 
            : 0
        })

        // Filter out companies with less than 10 ranking appearances
        const MIN_RANKING_APPEARANCES = 10
        const filteredCompetitors = Array.from(competitorMap.values()).filter(comp => {
          // Keep companies that either:
          // 1. Have 10 or more ranking appearances
          // 2. Have no rankings but have mentions (to not affect mentions chart)
          return comp.rankings.frequency >= MIN_RANKING_APPEARANCES || comp.rankings.frequency === 0
        })

        if (isMounted) {
          setData(filteredCompetitors)
          setIsLoading(false)
        }
      } catch (err) {
        console.error('Error fetching competitor data:', err)
        if (isMounted) {
          setError('Failed to load competitor data')
          setIsLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      isMounted = false
    }
  }, [companyId])

  if (!companyId) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
        <BarChart3 className="h-8 w-8 text-muted-foreground/60" />
        <div className="space-y-1">
          <h3 className="font-medium text-muted-foreground">No Company Selected</h3>
          <p className="text-sm text-muted-foreground/60">
            Select a company to view citation analysis
          </p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return <ChartLoadingState />
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <div className="space-y-1">
          <h3 className="font-medium text-destructive">Error Loading Data</h3>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Top Cited Sources Section */}
      <TopCitedSources companyId={companyId} />
      
      {/* Add divider with label */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-background px-4 text-sm text-muted-foreground">
            Competitor Analysis
          </span>
        </div>
      </div>
      
      {/* Competitor Analysis Section */}
      <div className="grid grid-cols-2 gap-8">
        {/* Left Column - Mentions Analysis */}
        <div>
          <CompetitorSection
            title="Competitor Mentions Analysis"
            type="mentions"
            data={memoizedData}
            currentCompanyName={currentCompanyName || undefined}
            companyId={companyId}
            onCompetitorSelect={setSelectedCompetitor}
            selectedCompetitor={selectedCompetitor ? selectedCompetitor : undefined}
          />
        </div>

        {/* Right Column - Rankings Analysis */}
        <div className="pl-8 border-l">
          <CompetitorSection
            title="Competitor Rankings Analysis"
            type="rankings"
            data={memoizedData}
            currentCompanyName={currentCompanyName || undefined}
            companyId={companyId}
            onCompetitorSelect={setSelectedCompetitor}
            selectedCompetitor={selectedCompetitor ? selectedCompetitor : undefined}
          />
        </div>
      </div>
    </div>
  )
} 