'use client'

import { useEffect, useState, memo, useMemo } from 'react'
import { createClient } from '@/app/supabase/client'
import { SourceCard } from '../source-card'
import { TopCitedSource, TopCitedSourcesProps, RANKING_PHASES, GroupedCitation } from './types'
import { Badge } from "@/components/ui/badge"
import { Database } from '@/types/supabase'
import { BarChart2 } from 'lucide-react'
import { Query } from '../types'
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type CitationRow = Database['public']['Tables']['citations']['Row']
type CitationSourceType = 'OWNED' | 'COMPETITOR' | 'UGC' | 'EARNED'
type SortType = 'citations' | CitationSourceType

function processGroupedCitations(citations: CitationRow[]): GroupedCitation[] {
  const groupedMap = new Map<string, GroupedCitation>()

  citations.forEach(citation => {
    if (!citation.citation_url) return

    if (!groupedMap.has(citation.citation_url)) {
      groupedMap.set(citation.citation_url, {
        url: citation.citation_url,
        citations: [],
        total_citations: 0,
        citation_orders: [],
        average_order: 0,
        latest_citation: citation
      })
    }

    const group = groupedMap.get(citation.citation_url)!
    group.citations.push(citation)
    group.total_citations++
    group.citation_orders.push(citation.citation_order)
    
    // Update latest citation if this one is newer
    if (new Date(citation.created_at || '') > new Date(group.latest_citation.created_at || '')) {
      group.latest_citation = citation
    }
  })

  // Calculate averages and prepare final array
  return Array.from(groupedMap.values()).map(group => ({
    ...group,
    average_order: group.citation_orders.reduce((a, b) => a + b, 0) / group.citation_orders.length
  }))
}

function convertToTopCitedSource(group: GroupedCitation): TopCitedSource {
  const latest = group.latest_citation
  const domain = new URL(group.url).hostname

  return {
    citation_url: group.url,
    domain,
    citation_count: group.total_citations,
    average_citation_order: group.average_order,
    citations: group.citations,
    lastCited: new Date(latest.created_at || new Date()),
    domain_authority: latest.domain_authority,
    page_authority: latest.page_authority,
    spam_score: latest.spam_score,
    source_type: latest.source_type as 'owned' | 'ugc' | 'affiliate',
    buyer_journey_phase: latest.buyer_journey_phase || undefined,
    mentioned_companies_count: latest.mentioned_companies_count || undefined,
    mentioned_companies: latest.mentioned_companies || undefined,
    rank_list: latest.rank_list || undefined,
    content_analysis: latest.content_analysis ? JSON.parse(latest.content_analysis) : undefined,
    queries: group.citations.map(citation => ({
      text: citation.query_text || '',
      date: citation.created_at || new Date().toISOString(),
      response: citation.response_text || ''
    })),
    verticals: Array.from(new Set(group.citations.map(c => c.icp_vertical).filter((v): v is string => Boolean(v)))),
    regions: Array.from(new Set(group.citations.map(c => c.region).filter((r): r is string => Boolean(r))))
  }
}

export const TopCitedRankings = memo(function TopCitedRankings({ 
  companyId 
}: TopCitedSourcesProps) {
  const [topSources, setTopSources] = useState<TopCitedSource[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<SortType>('citations')

  useEffect(() => {
    let isMounted = true

    async function fetchTopCitedSources() {
      if (!companyId) return

      try {
        setIsLoading(true)
        setError(null)

        const supabase = createClient()
        const { data: citations, error: citationsError } = await supabase
          .from('citations')
          .select('*')
          .eq('company_id', companyId)
          .in('buyer_journey_phase', RANKING_PHASES)
          .order('created_at', { ascending: false })

        if (citationsError) throw citationsError

        if (!isMounted) return

        // Process citations
        const groupedCitations = processGroupedCitations(citations)
        const sourcesData = groupedCitations
          .map(convertToTopCitedSource)
          .sort((a, b) => b.citation_count - a.citation_count)
          .slice(0, 10)

        if (isMounted) {
          setTopSources(sourcesData)
        }
      } catch (err) {
        console.error('Error fetching top cited sources:', err)
        if (isMounted) {
          setError('Failed to load top cited sources')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchTopCitedSources()

    return () => {
      isMounted = false
    }
  }, [companyId])

  const sortedSources = useMemo(() => {
    if (sortBy === 'citations') {
      return topSources
    }
    
    return [
      ...topSources.filter(source => source.source_type?.toUpperCase() === sortBy),
      ...topSources.filter(source => source.source_type?.toUpperCase() !== sortBy)
    ]
  }, [topSources, sortBy])

  if (isLoading) {
    return <div className="text-center py-8">Loading top cited sources...</div>
  }

  if (error) {
    return <div className="text-center py-8 text-destructive">{error}</div>
  }

  if (!companyId) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
        <div className="p-3 rounded-full bg-muted/20">
          <BarChart2 className="h-6 w-6 text-muted-foreground/60" />
        </div>
        <div className="space-y-1">
          <h3 className="font-medium text-muted-foreground">No Company Selected</h3>
          <p className="text-sm text-muted-foreground/60">
            Select a company to view their top cited sources
          </p>
        </div>
      </div>
    )
  }

  if (topSources.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No citations found for rankings analysis
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
            Top Cited Sources
          </Badge>
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
            {topSources.length} Sources
          </Badge>
        </div>
        <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortType)}>
          <SelectTrigger className="w-[140px] h-8">
            <SelectValue placeholder="Sort by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="citations">Most Cited</SelectItem>
            <SelectItem value="OWNED">Owned Sources</SelectItem>
            <SelectItem value="UGC">UGC Sources</SelectItem>
            <SelectItem value="EARNED">Earned Sources</SelectItem>
            <SelectItem value="COMPETITOR">Competitor Sources</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <ScrollArea className="h-[400px] pr-4">
        <div className="grid grid-cols-1 gap-4">
          {sortedSources.map((source) => (
            <SourceCard
              key={source.citation_url}
              data={{
                domain: source.domain,
                citation_url: source.citation_url,
                citation_count: source.citation_count,
                domain_authority: source.domain_authority || undefined,
                source_type: source.source_type,
                buyer_journey_phase: source.buyer_journey_phase,
                mentioned_companies_count: source.mentioned_companies_count,
                rank_list: source.rank_list,
                content_analysis: source.content_analysis,
                queries: source.queries
              }}
              type="rankings"
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}) 