import { useEffect, useState } from "react"
import { createClient } from "@/app/supabase/client"
import type { Query } from "../../types/query-types"

interface QueryPhase {
  stage: string;
  queries: Query[];
}

export function useQueries(
  companyId: number | null,
  region: string,
  vertical: string,
  persona: string
) {
  const [data, setData] = useState<QueryPhase[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

        const supabase = createClient()

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
          .not('query_id', 'is', null)
          .order('query_id', { ascending: true })

        if (fetchError) throw fetchError

        // Group responses by query and phase
        const queryMap = new Map<string, Query>()
        const phaseMap = new Map<string, Query[]>()

        responses?.forEach(response => {
          const queryKey = `${response.query_id}-${response.buying_journey_stage}`
          const phase = response.buying_journey_stage || 'unknown'

          if (!queryMap.has(queryKey)) {
            queryMap.set(queryKey, {
              id: response.query_id!,
              text: response.query_text!,
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
              rankList: response.rank_list,
              responseText: response.response_text,
              recommended: response.recommended,
              citations: response.citations_parsed?.urls,
              solutionAnalysis: response.solution_analysis ? {
                has_feature: response.solution_analysis.has_feature || 'N/A'
              } : undefined,
              companyMentioned: response.company_mentioned || false,
              mentioned_companies: response.mentioned_companies
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
  }, [companyId, region, vertical, persona])

  return { data, isLoading, error }
} 