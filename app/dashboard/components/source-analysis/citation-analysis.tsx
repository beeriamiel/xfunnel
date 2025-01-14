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
import { SourcesAnalysisMentions } from './sources-analysis-mentions'
import { SourcesAnalysisRankings } from './sources-analysis-rankings'
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { TopCitedSources } from './top-cited-sources'
import { Separator } from "@/components/ui/separator"

// Constants
const MENTION_STAGES = ['problem_exploration', 'solution_education']
const RANKING_STAGES = ['solution_comparison', 'final_research']

const COLORS = {
  perplexity: '#ff6b6b',     // Brighter coral
  claude: '#12b886',         // Mint
  gemini: '#4c6ef5',         // Indigo
  searchgpt: '#fcc419',      // Yellow
  aio: '#ff922b',           // Orange
  default: '#adb5bd'        // Gray
}

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

// Types
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

interface CompetitorSectionProps {
  title: string
  type: 'mentions' | 'rankings'
  data: CompetitorData[]
  currentCompanyName?: string
  companyId: number
  onCompetitorSelect: (name: string) => void
  selectedCompetitor?: string
}

// Helper functions
function parseRankList(rankListStr: string | null): string[] {
  if (!rankListStr) return []
  
  // Split by number pattern (e.g. "1.", "2.", "3.")
  // and filter out empty strings and clean up company names
  const parts = rankListStr.split(/\d+\./)
  return parts
    .map(s => s.trim())
    .filter((s): s is string => Boolean(s))
}

// Helper Components
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

// Main Components
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
        mentionsData.forEach((response: ResponseAnalysis) => {
          const mentionedCompanies = response.mentioned_companies || []
          
          mentionedCompanies.forEach((company: string) => {
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
        rankingsData.forEach((response: ResponseAnalysis) => {
          const companies = parseRankList(response.rank_list)
          if (!companies.length) return

          companies.forEach((company: string, index: number) => {
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