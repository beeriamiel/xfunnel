'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { createClient } from '@/app/supabase/client'
import { AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { extractDomain } from './utils'
import { 
  CitationRow, 
  CitationSourceType, 
  OverallSourceData, 
  LocalFilterOptions,
  Query,
  AnswerEngine
} from './types'
import { OverallSourceCard } from './overall-source-card'
import { OverallSourceModal } from './overall-source-modal'
import { 
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer 
} from 'recharts'
import { 
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { MultiSelect } from "@/components/ui/multi-select"
import { FilterButton } from './filter-sidebar/filter-button'
import { FilterSidebar } from './filter-sidebar/filter-sidebar'
import { FilterSection } from './filter-sidebar/filter-section'
import { FilterBadgeGroup } from './filter-sidebar/filter-badge-group'
import { useDashboardStore } from '@/app/dashboard/store'
import { useSearchParams } from 'next/navigation'

const JOURNEY_PHASES = [
  { value: 'problem_exploration', label: 'Problem Exploration' },
  { value: 'solution_education', label: 'Solution Education' },
  { value: 'solution_comparison', label: 'Solution Comparison' },
  { value: 'solution_evaluation', label: 'Solution Evaluation' },
  { value: 'final_research', label: 'User Feedback' }
] as const

const SOURCE_TYPES = [
  'OWNED',
  'EARNED',
  'COMPETITOR',
  'UGC'
] as const

const ANSWER_ENGINES = [
  { value: 'openai', label: 'SearchGPT (OpenAI)' },
  { value: 'anthropic', label: 'Claude (Anthropic)' },
  { value: 'perplexity', label: 'Perplexity' },
  { value: 'gemini', label: 'Gemini (Google)' }
] as const

const PAGE_SIZE = 9

interface Props {
  companyId: number
  accountId: string
}

const EmptyState = ({ title, description }: { title: string, description: string }) => {
  return (
    <div className="text-center p-8 border rounded-lg bg-muted/10">
      <h3 className="font-medium text-lg">{title}</h3>
      <p className="text-muted-foreground mt-1">{description}</p>
    </div>
  )
}

const Spinner = () => {
  return (
    <div className="flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  )
}

function PaginationControls({ 
  currentPage, 
  totalPages, 
  onPageChange,
  isLoading
}: { 
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  isLoading: boolean
}) {
  return (
    <div className="flex items-center justify-center gap-4 mt-8">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1 || isLoading}
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Previous
      </Button>
      
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </span>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || isLoading}
      >
        Next
        <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  )
}

// Update the color handling
const CHART_COLORS = {
  // Source Types
  EARNED: '#2563eb',    // Royal blue
  OWNED: '#9333ea',     // Bright purple
  COMPETITOR: '#db2777', // Deep pink
  UGC: '#06b6d4',       // Cyan
  
  // Journey Phases
  problem_exploration: '#2563eb',  // Royal blue
  solution_education: '#9333ea',   // Bright purple
  solution_comparison: '#db2777',  // Deep pink
  solution_evaluation: '#4f46e5',  // Indigo
  final_research: '#06b6d4',      // Cyan
  
  // Answer Engines
  openai: '#4f46e5',           // Indigo (SearchGPT)
  anthropic: '#2563eb',        // Royal blue
  perplexity: '#9333ea',       // Bright purple
  gemini: '#db2777',           // Deep pink
} as const

// Safe color getter with type checking
const getChartColor = (key: string): string => {
  const validKey = Object.keys(CHART_COLORS).includes(key)
  return validKey ? CHART_COLORS[key as keyof typeof CHART_COLORS] : '#94a3b8'
}

// Add chart configurations
const sourceTypeConfig = {
  value: { label: 'Citations' },
  EARNED: { label: 'Earned', color: CHART_COLORS.EARNED },
  OWNED: { label: 'Owned', color: CHART_COLORS.OWNED },
  COMPETITOR: { label: 'Competitor', color: CHART_COLORS.COMPETITOR },
  UGC: { label: 'UGC', color: CHART_COLORS.UGC },
} as const

const journeyPhaseConfig = {
  value: { label: 'Citations' },
  problem_exploration: { label: 'Problem Exploration', color: CHART_COLORS.problem_exploration },
  solution_education: { label: 'Solution Education', color: CHART_COLORS.solution_education },
  solution_comparison: { label: 'Solution Comparison', color: CHART_COLORS.solution_comparison },
  solution_evaluation: { label: 'Solution Evaluation', color: CHART_COLORS.solution_evaluation },
  final_research: { label: 'User Feedback', color: CHART_COLORS.final_research },
} as const

const answerEngineConfig = {
  value: { label: 'Citations' },
  openai: { label: 'SearchGPT (OpenAI)', color: CHART_COLORS.openai },
  anthropic: { label: 'Claude (Anthropic)', color: CHART_COLORS.anthropic },
  perplexity: { label: 'Perplexity', color: CHART_COLORS.perplexity },
  gemini: { label: 'Gemini (Google)', color: CHART_COLORS.gemini },
} as const

export function OverallCitations({ companyId, accountId }: Props) {
  const searchParams = useSearchParams()
  const urlCompanyId = searchParams.get('company') ? parseInt(searchParams.get('company')!) : undefined
  const companies = useDashboardStore(state => state.companies)
  
  // Use URL company ID if available, fallback to prop
  const effectiveCompanyId = urlCompanyId ?? companyId
  
  // Validate that the company exists in our data
  const isValidCompany = effectiveCompanyId && companies?.some(c => c.id === effectiveCompanyId)
  
  const [filters, setFilters] = useState<LocalFilterOptions>({
    buyingJourneyPhase: null,
    sourceType: null,
    answerEngine: null,
    buyerPersona: null
  })
  const [sources, setSources] = useState<OverallSourceData[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedSource, setSelectedSource] = useState<OverallSourceData | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [buyerPersonas, setBuyerPersonas] = useState<string[]>([])
  const isSuperAdmin = useDashboardStore(state => state.isSuperAdmin)

  // Add new state for filter UI
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [stagedFilters, setStagedFilters] = useState<LocalFilterOptions>(filters)
  
  // Transform active filters into badge format
  const activeFilterBadges = useMemo(() => {
    const badges = []
    
    if (filters.sourceType) {
      badges.push({
        category: 'sourceType',
        label: filters.sourceType,
        value: filters.sourceType
      })
    }
    
    if (filters.buyingJourneyPhase) {
      filters.buyingJourneyPhase.forEach(phase => {
        const label = JOURNEY_PHASES.find(p => p.value === phase)?.label || phase
        badges.push({
          category: 'buyingJourneyPhase',
          label,
          value: phase
        })
      })
    }
    
    if (filters.answerEngine) {
      filters.answerEngine.forEach(engine => {
        const label = ANSWER_ENGINES.find(e => e.value === engine)?.label || engine
        badges.push({
          category: 'answerEngine',
          label,
          value: engine
        })
      })
    }
    
    if (filters.buyerPersona) {
      filters.buyerPersona.forEach(persona => {
        badges.push({
          category: 'buyerPersona',
          label: persona,
          value: persona
        })
      })
    }
    
    return badges
  }, [filters])

  // Calculate pagination
  const totalPages = Math.ceil(sources.length / PAGE_SIZE)
  const startIndex = (currentPage - 1) * PAGE_SIZE
  const endIndex = startIndex + PAGE_SIZE
  const currentSources = sources.slice(startIndex, endIndex)

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // Scroll to top of the grid
    document.getElementById('citations-grid')?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    // Reset to first page when filters change
    setCurrentPage(1)
  }, [filters])

  useEffect(() => {
    async function fetchData() {
      if (!effectiveCompanyId) return

      try {
        setIsLoading(true)
        setError(null)

        const supabase = createClient()
        
        // First verify company access
        let companyQuery = supabase
          .from('companies')
          .select('id')
          .eq('id', effectiveCompanyId)
        
        // Add account filter for non-super admins
        if (!isSuperAdmin) {
          companyQuery = companyQuery.eq('account_id', accountId)
        }

        const { data: companyData, error: companyError } = await companyQuery.single()

        if (companyError || !companyData) {
          throw new Error('Company not found or access denied')
        }
        
        let query = supabase
          .from('citations')
          .select(`
            id,
            citation_url,
            citation_order,
            response_analysis_id,
            company_id,
            recommended,
            company_mentioned,
            buyer_journey_phase,
            buyer_persona,
            rank_list,
            mentioned_companies,
            mentioned_companies_count,
            icp_vertical,
            response_text,
            region,
            ranking_position,
            domain_authority,
            source_type,
            query_text,
            content_analysis,
            external_links_to_root_domain,
            page_authority,
            created_at,
            answer_engine
          `)
          .not('answer_engine', 'in', '("google_search","google-search")') as any

        // Apply filters
        if (filters.buyingJourneyPhase) {
          query = query.in('buyer_journey_phase', filters.buyingJourneyPhase)
        }
        if (filters.sourceType) {
          query = query.eq('source_type', filters.sourceType)
        }
        if (filters.answerEngine) {
          query = query.in('answer_engine', filters.answerEngine)
        }
        if (filters.buyerPersona) {
          query = query.in('buyer_persona', filters.buyerPersona)
        }

        query = query.eq('company_id', effectiveCompanyId)

        const { data, error: fetchError } = await query

        if (fetchError) throw fetchError

        // Extract unique buyer personas
        const uniquePersonas = Array.from(new Set(
          (data as CitationRow[])
            .map(citation => citation.buyer_persona)
            .filter((persona): persona is string => Boolean(persona))
        )).sort()
        
        setBuyerPersonas(uniquePersonas)

        // Process and group citations by URL
        const groupedCitations = new Map<string, OverallSourceData>()
        const companyMentionsMap = new Map<string, Map<string, number>>()
        const journeyPhasesMap = new Map<string, Set<string>>()
        const answerEnginesMap = new Map<string, Set<string>>()
        const buyerPersonasMap = new Map<string, Set<string>>()
        const citationOrdersMap = new Map<string, number[]>()

        // First pass: collect all data
        const citations = data as CitationRow[]
        citations.forEach((citation) => {
          const url = citation.citation_url
          
          // Initialize maps for this URL if needed
          if (!companyMentionsMap.has(url)) {
            companyMentionsMap.set(url, new Map())
          }
          if (!journeyPhasesMap.has(url)) {
            journeyPhasesMap.set(url, new Set())
          }
          if (!answerEnginesMap.has(url)) {
            answerEnginesMap.set(url, new Set())
          }
          if (!buyerPersonasMap.has(url)) {
            buyerPersonasMap.set(url, new Set())
          }
          if (!citationOrdersMap.has(url)) {
            citationOrdersMap.set(url, [])
          }

          // Collect citation orders
          if (typeof citation.citation_order === 'number') {
            citationOrdersMap.get(url)!.push(citation.citation_order)
          }

          // Process company mentions
          const mentionsForUrl = companyMentionsMap.get(url)!
          if (Array.isArray(citation.mentioned_companies_count)) {
            citation.mentioned_companies_count.forEach(mention => {
              const [company, countStr] = mention.split(':')
              const count = parseInt(countStr || '0')
              const currentMax = mentionsForUrl.get(company) || 0
              if (count > currentMax) {
                mentionsForUrl.set(company, count)
              }
            })
          }

          // Collect journey phases
          if (citation.buyer_journey_phase) {
            journeyPhasesMap.get(url)!.add(citation.buyer_journey_phase)
          }

          // Collect answer engines
          if (citation.answer_engine) {
            answerEnginesMap.get(url)!.add(citation.answer_engine)
          }

          // Collect buyer personas
          if (citation.buyer_persona) {
            buyerPersonasMap.get(url)!.add(citation.buyer_persona)
          }
        })

        // Second pass: create source data with standardized information
        citations.forEach((citation) => {
          const url = citation.citation_url
          const domain = extractDomain(url)

          if (!groupedCitations.has(url)) {
            // Calculate average citation order
            const citationOrders = citationOrdersMap.get(url) || []
            const averageCitationOrder = citationOrders.length > 0
              ? Number((citationOrders.reduce((sum, order) => sum + order, 0) / citationOrders.length).toFixed(1))
              : null

            // Convert company mentions map to array format
            const mentionsForUrl = companyMentionsMap.get(url)!
            const standardizedMentions = Array.from(mentionsForUrl.entries())
              .map(([company, count]) => `${company}:${count}`)
              .sort((a, b) => {
                const countA = parseInt(a.split(':')[1])
                const countB = parseInt(b.split(':')[1])
                return countB - countA // Sort by count descending
              })

            // Get journey phases and answer engines
            const journeyPhases = Array.from(journeyPhasesMap.get(url)!).sort()
            const answerEngines = Array.from(answerEnginesMap.get(url)!).sort()
            const buyerPersonas = Array.from(buyerPersonasMap.get(url)!).sort()

            groupedCitations.set(url, {
              domain,
              citation_url: url,
              citation_count: 0,
              domain_authority: citation.domain_authority ?? undefined,
              source_type: citation.source_type?.toLowerCase() as 'owned' | 'ugc' | 'affiliate',
              buyer_journey_phases: journeyPhases,
              buyer_personas: buyerPersonas,
              mentioned_companies_count: standardizedMentions,
              rank_list: citation.rank_list || undefined,
              content_analysis: citation.content_analysis ? JSON.parse(citation.content_analysis) : undefined,
              queries: [],
              external_links_to_root_domain: citation.external_links_to_root_domain ?? undefined,
              page_authority: citation.page_authority ?? undefined,
              content_analysis_details: citation.content_analysis ? 
                JSON.parse(citation.content_analysis).analysis_details : undefined,
              citation_orders: citationOrders,
              average_citation_order: averageCitationOrder,
              answer_engines: answerEngines
            })
          }

          const source = groupedCitations.get(url)!
          source.citation_count++

          // Add query if it exists
          if (citation.query_text) {
            source.queries.push({
              text: citation.query_text,
              date: new Date(citation.created_at || '').toLocaleDateString(),
              response: citation.response_text || '',
              answer_engine: citation.answer_engine || null
            })
          }
        })

        // Convert to array and sort by citation count
        const processedSources = Array.from(groupedCitations.values())
          .sort((a, b) => b.citation_count - a.citation_count)

        setSources(processedSources)
        setIsLoading(false)
      } catch (err) {
        console.error('Error fetching citations:', err)
        setError('Failed to load citations')
        setIsLoading(false)
      }
    }

    fetchData()
  }, [effectiveCompanyId, accountId, filters, isSuperAdmin])

  const handleSourceClick = (source: OverallSourceData) => {
    setSelectedSource(source)
    setIsModalOpen(true)
  }

  const handleApplyFilters = useCallback(() => {
    setFilters(stagedFilters)
    setIsFilterOpen(false)
  }, [stagedFilters])

  const handleResetFilters = useCallback(() => {
    const resetFilters = {
      buyingJourneyPhase: null,
      sourceType: null,
      answerEngine: null,
      buyerPersona: null
    }
    setStagedFilters(resetFilters)
    setFilters(resetFilters)
    setIsFilterOpen(false)
  }, [])

  const handleRemoveFilter = useCallback((category: string, value: string) => {
    setFilters(prev => {
      const updated = { ...prev }
      if (category === 'sourceType') {
        updated.sourceType = null
      } else if (category === 'buyingJourneyPhase') {
        updated.buyingJourneyPhase = prev.buyingJourneyPhase?.filter(v => v !== value) || null
      } else if (category === 'answerEngine') {
        updated.answerEngine = prev.answerEngine?.filter(v => v !== value) || null
      } else if (category === 'buyerPersona') {
        updated.buyerPersona = prev.buyerPersona?.filter(v => v !== value) || null
      }
      return updated as LocalFilterOptions
    })
  }, [])

  // Return early if company is invalid
  if (!effectiveCompanyId || !isValidCompany) {
    return (
      <Card className="w-full bg-white shadow-sm">
        <div className="p-6">
          <h3 className="text-lg font-semibold">Source Analysis</h3>
          <div className="h-[200px] w-full flex items-center justify-center text-muted-foreground">
            {!effectiveCompanyId ? 'Please select a company to view source analysis' : 'Invalid company selected'}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div>
      <div className="space-y-4">
        {/* Overall Metrics and Distribution Charts */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Metrics Card - Top Left */}
            <Card className="flex flex-col justify-center">
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-muted-foreground">Total Citations</p>
                      <span className="text-sm text-emerald-600">+12% from last month</span>
                    </div>
                    <p className="text-3xl font-bold">
                      {sources.reduce((sum, source) => sum + source.citation_count, 0).toLocaleString()}
                    </p>
                  </div>

                  <div className="h-[1px] bg-border" />
                  
                  <div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-muted-foreground">Unique Sources</p>
                      <span className="text-sm text-emerald-600">+5% from last month</span>
                    </div>
                    <p className="text-3xl font-bold">
                      {sources.length.toLocaleString()}
                    </p>
                  </div>

                  <div className="h-[1px] bg-border" />

                  <div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-muted-foreground">Companies Mentioned</p>
                      <span className="text-sm text-emerald-600">8 new this month</span>
                    </div>
                    <p className="text-3xl font-bold">
                      {Array.from(new Set(
                        sources.flatMap(source => 
                          source.mentioned_companies_count.map(mention => mention.split(':')[0])
                        )
                      )).length.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Buyer Journey Chart - Top Right */}
            <Card className="flex flex-col">
              <CardHeader className="items-center pb-0">
                <CardTitle className="text-base">Buyer Journey Phases</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 pb-0">
                <ChartContainer 
                  config={journeyPhaseConfig}
                  className="mx-auto aspect-square max-h-[300px]"
                >
                  <PieChart>
                    <Pie
                      data={sources.reduce((acc, source) => {
                        source.buyer_journey_phases.forEach(phase => {
                          const existing = acc.find(item => item.name === phase)
                          if (existing) {
                            existing.value += source.citation_count
                          } else {
                            acc.push({ 
                              name: phase,
                              label: JOURNEY_PHASES.find(p => p.value === phase)?.label || phase,
                              value: source.citation_count,
                              fill: getChartColor(phase)
                            })
                          }
                        })
                        return acc
                      }, [] as { name: string; label: string; value: number; fill: string }[])}
                      dataKey="value"
                      nameKey="label"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                    />
                    <ChartLegend
                      content={<ChartLegendContent />}
                      className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                    />
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Citation Sources Chart - Bottom Left */}
            <Card className="flex flex-col">
              <CardHeader className="items-center pb-0">
                <CardTitle className="text-base">Citation Sources</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 pb-0">
                <ChartContainer 
                  config={sourceTypeConfig}
                  className="mx-auto aspect-square max-h-[300px]"
                >
                  <PieChart>
                    <Pie
                      data={sources.reduce((acc, source) => {
                        const type = source.source_type?.toUpperCase() || 'UNKNOWN'
                        const existing = acc.find(item => item.name === type)
                        if (existing) {
                          existing.value += source.citation_count
                        } else {
                          acc.push({ 
                            name: type, 
                            value: source.citation_count,
                            fill: getChartColor(type)
                          })
                        }
                        return acc
                      }, [] as { name: string; value: number; fill: string }[])}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                    />
                    <ChartLegend
                      content={<ChartLegendContent />}
                      className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                    />
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Answer Engines Chart - Bottom Right */}
            <Card className="flex flex-col">
              <CardHeader className="items-center pb-0">
                <CardTitle className="text-base">Answer Engines</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 pb-0">
                <ChartContainer 
                  config={answerEngineConfig}
                  className="mx-auto aspect-square max-h-[300px]"
                >
                  <PieChart>
                    <Pie
                      data={sources.reduce((acc, source) => {
                        source.answer_engines.forEach(engine => {
                          const existing = acc.find(item => item.name === engine)
                          if (existing) {
                            existing.value += source.citation_count
                          } else {
                            acc.push({ 
                              name: engine,
                              label: ANSWER_ENGINES.find(e => e.value === engine)?.label || engine,
                              value: source.citation_count,
                              fill: getChartColor(engine)
                            })
                          }
                        })
                        return acc
                      }, [] as { name: string; label: string; value: number; fill: string }[])}
                      dataKey="value"
                      nameKey="label"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                    />
                    <ChartLegend
                      content={<ChartLegendContent />}
                      className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                    />
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
          
          <div className="h-px bg-border" />
        </div>

        {/* New Header with Filter Button */}
        <div className="px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Overall Citations Analysis</h2>
              <p className="text-muted-foreground">
                Analyze all citations across different sources and metrics
              </p>
            </div>
            <FilterButton 
              onOpenChange={() => setIsFilterOpen(true)} 
              totalFilters={activeFilterBadges.length} 
            />
          </div>

          {/* Active Filter Badges */}
          <FilterBadgeGroup
            filters={activeFilterBadges}
            onRemove={handleRemoveFilter}
          />
        </div>

        {/* Filter Sidebar */}
        <FilterSidebar
          open={isFilterOpen}
          onOpenChange={setIsFilterOpen}
          onApply={handleApplyFilters}
          onReset={handleResetFilters}
        >
          <FilterSection
            title="Source Type"
            options={[
              { value: 'EARNED', label: 'Earned' },
              { value: 'OWNED', label: 'Owned' },
              { value: 'COMPETITOR', label: 'Competitor' },
              { value: 'UGC', label: 'UGC' }
            ]}
            values={stagedFilters.sourceType ? [stagedFilters.sourceType] : []}
            onChange={(values: string[]) => setStagedFilters(prev => ({
              ...prev,
              sourceType: (values[0] as CitationSourceType) || null
            }))}
          />
          <FilterSection
            title="Buying Journey Phase"
            options={JOURNEY_PHASES.map(phase => ({
              value: phase.value,
              label: phase.label
            }))}
            values={stagedFilters.buyingJourneyPhase || []}
            onChange={(values: string[]) => setStagedFilters(prev => ({
              ...prev,
              buyingJourneyPhase: values.length > 0 ? values : null
            }))}
          />
          <FilterSection
            title="Answer Engine"
            options={ANSWER_ENGINES.map(engine => ({
              value: engine.value,
              label: engine.label
            }))}
            values={stagedFilters.answerEngine || []}
            onChange={(values: string[]) => setStagedFilters(prev => ({
              ...prev,
              answerEngine: values.length > 0 ? values : null
            }))}
          />
          <FilterSection
            title="Buyer Persona"
            options={buyerPersonas.map(persona => ({
              value: persona,
              label: persona
            }))}
            values={stagedFilters.buyerPersona || []}
            onChange={(values: string[]) => setStagedFilters(prev => ({
              ...prev,
              buyerPersona: values.length > 0 ? values : null
            }))}
          />
        </FilterSidebar>

        {/* Citations Grid */}
        {isLoading ? (
          <div className="flex justify-center p-8">
            <Spinner />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : sources.length === 0 ? (
          <EmptyState
            title="No citations found"
            description="Try adjusting your filters or adding more citations"
          />
        ) : (
          <>
            <div id="citations-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {currentSources.map((source, index) => (
                <OverallSourceCard 
                  key={index} 
                  source={source} 
                  onClick={() => handleSourceClick(source)}
                />
              ))}
            </div>

            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              isLoading={isLoading}
            />
          </>
        )}

        {/* Source Modal */}
        {selectedSource && (
          <OverallSourceModal
            source={selectedSource}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          />
        )}
      </div>
    </div>
  )
} 