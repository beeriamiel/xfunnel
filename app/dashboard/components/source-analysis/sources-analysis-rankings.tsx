'use client'

import { useEffect, useState, memo } from 'react'
import { createClient } from '@/app/supabase/client'
import { SourceCard } from './source-card'
import { SourceData } from './types'
import { isValidCitation, groupCitationsByUrl, convertToSourceData, RawCitation } from './utils'
import { Badge } from "@/components/ui/badge"
import { Globe } from 'lucide-react'
import { Database } from '@/types/supabase'

const RANKING_PHASES = ['solution_comparison', 'final_research'] as const

interface Props {
  companyId: number | null
  selectedCompetitor?: string
}

type CitationRow = Database['public']['Tables']['citations']['Row']

export const SourcesAnalysisRankings = memo(function SourcesAnalysisRankings({ 
  companyId, 
  selectedCompetitor 
}: Props) {
  const [sources, setSources] = useState<SourceData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [averagePosition, setAveragePosition] = useState<number | null>(null)

  useEffect(() => {
    let isMounted = true

    async function fetchData() {
      // Don't fetch if no competitor is selected
      if (!companyId || !selectedCompetitor) return

      try {
        setIsLoading(true)
        setError(null)

        const supabase = createClient()

        // First fetch ranking data from response_analysis
        const { data: rankingData, error: rankingError } = await supabase
          .from('response_analysis')
          .select('*')
          .eq('company_id', companyId)
          .in('buying_journey_stage', RANKING_PHASES)
          .not('rank_list', 'is', null)

        if (rankingError) throw rankingError

        // Calculate average position for the selected competitor from response_analysis
        if (selectedCompetitor && rankingData) {
          const positions = rankingData
            .map(record => {
              const rankList = record.rank_list?.split('\n') || []
              const position = rankList.findIndex(rank => rank.includes(selectedCompetitor)) + 1
              return position > 0 ? position : null
            })
            .filter((pos): pos is number => pos !== null)

          if (positions.length > 0) {
            const avg = positions.reduce((a, b) => a + b, 0) / positions.length
            setAveragePosition(Number(avg.toFixed(1)))
          } else {
            setAveragePosition(null)
          }
        } else {
          setAveragePosition(null)
        }

        // Then fetch citation data
        const { data: citationData, error: citationError } = await supabase
          .from('citations')
          .select(`
            id,
            citation_url,
            citation_order,
            response_analysis_id,
            company_id,
            recommended,
            company_mentioned,
            buyer_persona,
            buyer_journey_phase,
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
            created_at,
            updated_at
          `)
          .eq('company_id', companyId)
          .in('buyer_journey_phase', RANKING_PHASES)

        if (citationError) throw citationError

        if (!isMounted) return

        // Safely type and filter the raw data
        const validCitations = (citationData || []).filter((citation): citation is RawCitation => {
          if (!citation) return false;
          return isValidCitation(citation);
        });
        
        // Filter by selected competitor if one is selected
        const filteredCitations = selectedCompetitor 
          ? validCitations.filter(citation => citation.rank_list?.includes(selectedCompetitor))
          : validCitations

        // Group citations by URL and convert to source data
        const groupedCitations = groupCitationsByUrl(filteredCitations)
        const sourcesData = groupedCitations.map(convertToSourceData)

        setSources(sourcesData)
      } catch (err) {
        console.error('Error fetching rankings data:', err)
        if (isMounted) {
          setError('Failed to load rankings data')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      isMounted = false
    }
  }, [companyId, selectedCompetitor])

  if (!selectedCompetitor) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
        <div className="p-3 rounded-full bg-muted/20">
          <Globe className="h-6 w-6 text-muted-foreground/60" />
        </div>
        <div className="space-y-1">
          <h3 className="font-medium text-muted-foreground">Select a Company</h3>
          <p className="text-sm text-muted-foreground/60">
            Choose a competitor from the chart or table above to view their rankings
          </p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading rankings data...</div>
  }

  if (error) {
    return <div className="text-center py-8 text-destructive">{error}</div>
  }

  if (sources.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No rankings found {selectedCompetitor ? `for ${selectedCompetitor}` : ''}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {selectedCompetitor && (
        <div className="flex items-center justify-between pb-2 border-b">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
              Viewing rankings for {selectedCompetitor}
            </Badge>
            {averagePosition && (
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                Avg. Position #{averagePosition}
              </Badge>
            )}
          </div>
          <span className="text-sm text-muted-foreground">
            {sources.length} source{sources.length === 1 ? '' : 's'} found
          </span>
        </div>
      )}
      <div className="grid grid-cols-1 gap-6 w-full max-w-full px-1">
        {sources.map((source, index) => (
          <SourceCard
            key={`${source.citation_url}-${index}`}
            data={source}
            type="rankings"
          />
        ))}
      </div>
    </div>
  )
}) 