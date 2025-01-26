'use client'

import { useEffect, useState, memo } from 'react'
import { createClient } from '@/app/supabase/client'
import { SourceCard } from './source-card'
import { SourceData } from './types'
import { isValidCitation, groupCitationsByUrl, convertToSourceData } from './utils'
import { Badge } from "@/components/ui/badge"
import { Globe } from 'lucide-react'

const MENTION_PHASES = ['problem_exploration', 'solution_education'] as const

interface Props {
  companyId: number | null
  selectedCompetitor?: string
}

// Feature flag to control legacy citation analysis visibility
const SHOW_LEGACY_CITATIONS = false

export const SourcesAnalysisMentions = memo(function SourcesAnalysisMentions({ 
  companyId, 
  selectedCompetitor 
}: Props) {
  // Return null if feature flag is disabled
  if (!SHOW_LEGACY_CITATIONS) {
    return null
  }

  const [sources, setSources] = useState<SourceData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function fetchData() {
      if (!companyId || !selectedCompetitor) return

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
          .in('buyer_journey_phase', MENTION_PHASES)

        if (error) throw error

        if (!isMounted) return

        const rawData = data as unknown[]
        const validCitations = rawData.filter(isValidCitation)
        
        // First filter: Find responses where AI mentioned the company
        const filteredCitations = selectedCompetitor 
          ? validCitations.filter(citation => 
              citation.mentioned_companies?.includes(selectedCompetitor)
            )
          : validCitations

        // Group citations by URL and convert to source data
        // mentioned_companies_count will be used in SourceCard for displaying source analysis
        const groupedCitations = groupCitationsByUrl(filteredCitations)
        const sourcesData = groupedCitations.map(convertToSourceData)

        setSources(sourcesData)
      } catch (err) {
        console.error('Error fetching mentions data:', err)
        if (isMounted) {
          setError('Failed to load mentions data')
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
            Choose a competitor from the chart or table above to view their mentions
          </p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading mentions data...</div>
  }

  if (error) {
    return <div className="text-center py-8 text-destructive">{error}</div>
  }

  if (sources.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No mentions found {selectedCompetitor ? `for ${selectedCompetitor}` : ''}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {selectedCompetitor && (
        <div className="flex items-center justify-between pb-2 border-b">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
              Viewing mentions for {selectedCompetitor}
            </Badge>
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
            type="mentions"
          />
        ))}
      </div>
    </div>
  )
}) 