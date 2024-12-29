'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/app/supabase/client'
import { SourceCard } from './source-card'
import { SourceData } from './types'
import { isValidCitation, groupCitationsByUrl, convertToSourceData, RawCitation } from './utils'
import { Badge } from "@/components/ui/badge"

const RANKING_PHASES = ['solution_comparison', 'final_research'] as const

interface Props {
  companyId: number | null
  selectedCompetitor?: string
}

export function SourcesAnalysisRankings({ companyId, selectedCompetitor }: Props) {
  const [sources, setSources] = useState<SourceData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [averagePosition, setAveragePosition] = useState<number | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)
        setError(null)

        const supabase = createClient()
        const { data, error } = await supabase
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
          .eq('company_id', companyId || 0)
          .in('buyer_journey_phase', RANKING_PHASES)

        if (error) throw error

        // Safely type and filter the raw data
        const rawData = data as unknown[];
        const validCitations = rawData.filter(isValidCitation);
        
        // Filter by selected competitor if one is selected
        const filteredCitations = selectedCompetitor 
          ? validCitations.filter(citation => citation.rank_list?.includes(selectedCompetitor))
          : validCitations;

        // Calculate average position for the selected competitor
        if (selectedCompetitor) {
          const positions = filteredCitations
            .map(citation => {
              const rankList = citation.rank_list?.split('\n') || []
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

        // Group citations by URL and convert to source data
        const groupedCitations = groupCitationsByUrl(filteredCitations)
        const sourcesData = groupedCitations.map(convertToSourceData)

        setSources(sourcesData)
      } catch (err) {
        console.error('Error fetching rankings data:', err)
        setError('Failed to load rankings data')
      } finally {
        setIsLoading(false)
      }
    }

    if (companyId) {
      fetchData()
    }
  }, [companyId, selectedCompetitor])

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
      <div className="grid grid-cols-1 gap-6">
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
} 