import { useEffect, useState } from "react"
import { createClient } from "@/app/supabase/client"
import type { Query } from "../../types/query-types"
import { useDashboardStore } from "@/app/dashboard/store"
import { getDateRangeForPeriod } from "../date-utils"
import { Database } from "@/types/supabase"

interface QueryPhase {
  stage: string;
  queries: Query[];
}

type QueryResponse = Pick<
  Database['public']['Tables']['response_analysis']['Row'],
  | 'query_id'
  | 'query_text'
  | 'buying_journey_stage'
  | 'sentiment_score'
  | 'ranking_position'
  | 'company_mentioned'
  | 'solution_analysis'
  | 'answer_engine'
  | 'rank_list'
  | 'response_text'
  | 'citations_parsed'
  | 'recommended'
  | 'mentioned_companies'
  | 'company_name'
>

export function useQueries(
  companyId: number | null,
  region: string,
  vertical: string,
  persona: string
) {
  const [data, setData] = useState<QueryPhase[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const timePeriod = useDashboardStore(state => state.timePeriod)

  useEffect(() => {
    async function fetchQueries() {
      if (!companyId || !region || !vertical || !persona) {
        setData([])
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        console.log('Fetching queries with:', {
          companyId,
          region,
          vertical,
          persona,
          timePeriod
        })

        const supabase = createClient()
        const { start, end } = getDateRangeForPeriod(timePeriod)

        // Get all responses for the selected filters
        const { data: responses, error: fetchError } = await supabase
          .from('response_analysis')
          .select(`
            query_id,
            query_text,
            buying_journey_stage,
            sentiment_score,
            ranking_position,
            company_mentioned,
            solution_analysis,
            answer_engine,
            rank_list,
            response_text,
            citations_parsed,
            recommended,
            mentioned_companies,
            company_name
          `)
          .eq('company_id', companyId)
          .eq('geographic_region', region)
          .eq('icp_vertical', vertical)
          .eq('buyer_persona', persona)
          .gte('created_at', start.toISOString())
          .lte('created_at', end.toISOString())
          .not('query_id', 'is', null)
          .order('query_id', { ascending: true })

        console.log('Query response:', { responses, error: fetchError })

        if (fetchError) throw fetchError

        // Group responses by query and phase
        const queryMap = new Map<string, Query>()
        const phaseMap = new Map<string, Query[]>()

        responses?.forEach((response: QueryResponse) => {
          const queryKey = `${response.query_id}-${response.buying_journey_stage}`
          const phase = response.buying_journey_stage || 'unknown'

          if (!queryMap.has(queryKey)) {
            queryMap.set(queryKey, {
              id: response.query_id!,
              text: response.query_text || '',
              buyerJourneyPhase: phase,
              engineResults: {},
              companyMentioned: false,
              companyMentionRate: 0,
              companyName: response.company_name
            })
          }

          const query = queryMap.get(queryKey)!
          const engine = response.answer_engine

          if (engine) {
            query.engineResults[engine] = {
              rank: response.ranking_position || 'n/a',
              rankList: response.rank_list || undefined,
              responseText: response.response_text || undefined,
              recommended: response.recommended || false,
              citations: typeof response.citations_parsed === 'object' && response.citations_parsed
                ? (response.citations_parsed as any).urls || []
                : [],
              solutionAnalysis: typeof response.solution_analysis === 'object' && response.solution_analysis
                ? {
                    has_feature: (response.solution_analysis as any).has_feature || 'N/A'
                  }
                : undefined,
              companyMentioned: response.company_mentioned || false,
              mentioned_companies: response.mentioned_companies || []
            }

            if (response.company_mentioned) {
              query.companyMentioned = true
            }
          }

          // Update phase map
          if (!phaseMap.has(phase)) {
            phaseMap.set(phase, [])
          }
          if (!phaseMap.get(phase)!.find(q => q.id === query.id)) {
            phaseMap.get(phase)!.push(query)
          }
        })

        // Calculate mention rates for each query
        queryMap.forEach(query => {
          const engineCount = Object.keys(query.engineResults).length
          const mentionCount = Object.values(query.engineResults)
            .filter(result => result.companyMentioned).length
          query.companyMentionRate = engineCount > 0 ? (mentionCount / engineCount) * 100 : 0
        })

        // Convert to final format
        const finalData: QueryPhase[] = Array.from(phaseMap.entries())
          .map(([stage, queries]) => ({
            stage,
            queries
          }))

        setData(finalData)
      } catch (err) {
        console.error('Error fetching queries:', err)
        setError('Failed to load queries')
      } finally {
        setIsLoading(false)
      }
    }

    fetchQueries()
  }, [companyId, region, vertical, persona, timePeriod])

  return { data, isLoading, error }
} 