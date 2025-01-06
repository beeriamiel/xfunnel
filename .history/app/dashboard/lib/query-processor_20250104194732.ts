'use client'

import { createClient } from '@/app/supabase/client'

export interface Query {
  id: number
  text: string
  buyerJourneyPhase: string
  engineResults: {
    [engine: string]: {
      rank: number | 'n/a'
      rankList?: string | null
      responseText?: string
      recommended?: boolean
      citations?: string[]
      solutionAnalysis?: {
        has_feature: 'YES' | 'NO' | 'N/A'
      }
      companyMentioned?: boolean
      mentioned_companies?: string[]
    }
  }
  companyMentioned: boolean
  companyMentionRate: number
  companyName?: string
}

export async function fetchQueries(
  companyId: number,
  region: string,
  vertical: string,
  persona: string
): Promise<Query[]> {
  try {
    const supabase = createClient()

    // First get all query IDs for the selected filters
    const { data: queryData, error: queryError } = await supabase
      .from('response_analysis')
      .select('query_id, query_text, buying_journey_stage, company_name')
      .eq('company_id', companyId)
      .eq('geographic_region', region)
      .eq('icp_vertical', vertical)
      .eq('buyer_persona', persona)
      .not('query_id', 'is', null)

    if (queryError) throw queryError

    // Get unique query IDs
    const queryIds = Array.from(new Set((queryData || [])
      .map(q => q.query_id)
      .filter((id): id is number => typeof id === 'number')))
    
    if (queryIds.length === 0) {
      return []
    }

    // Get all responses for these queries
    const { data: responseData, error: responseError } = await supabase
      .from('response_analysis')
      .select(`
        sentiment_score,
        ranking_position,
        company_mentioned,
        solution_analysis,
        buyer_persona,
        query_id,
        buying_journey_stage,
        answer_engine,
        rank_list,
        response_text,
        citations_parsed,
        recommended,
        mentioned_companies
      `)
      .eq('company_id', companyId)
      .eq('geographic_region', region)
      .eq('icp_vertical', vertical)
      .eq('buyer_persona', persona)
      .in('query_id', queryIds)

    if (responseError) throw responseError

    // Process the data into the Query format
    const validQueryData = (queryData || []).filter((q): q is (typeof q & {
      query_id: number
      query_text: string
      buying_journey_stage: string
    }) => 
      typeof q?.query_id === 'number' &&
      typeof q?.query_text === 'string' &&
      typeof q?.buying_journey_stage === 'string'
    )

    return validQueryData.map(queryInfo => {
      const queryResponses = (responseData || []).filter(r => 
        typeof r?.query_id === 'number' && r.query_id === queryInfo.query_id
      )

      const engineResults: Query['engineResults'] = {}

      queryResponses.forEach(response => {
        if (response.answer_engine) {
          let solutionAnalysis: { has_feature: 'YES' | 'NO' | 'N/A' } | undefined
          if (response.solution_analysis && response.buying_journey_stage === 'solution_evaluation') {
            try {
              const parsedAnalysis = typeof response.solution_analysis === 'string'
                ? JSON.parse(response.solution_analysis)
                : response.solution_analysis
              
              solutionAnalysis = {
                has_feature: (parsedAnalysis.has_feature === 'YES' || parsedAnalysis.has_feature === 'NO')
                  ? parsedAnalysis.has_feature
                  : 'N/A'
              }
            } catch (e) {
              console.warn('Failed to parse solution analysis:', e)
              solutionAnalysis = {
                has_feature: 'N/A'
              }
            }
          }

          const citationUrls = typeof response.citations_parsed === 'object' && 
            response.citations_parsed !== null && 
            'urls' in response.citations_parsed
            ? (response.citations_parsed as { urls: string[] }).urls
            : undefined

          engineResults[response.answer_engine] = {
            rank: response.ranking_position || 'n/a',
            rankList: response.rank_list || undefined,
            responseText: response.response_text || undefined,
            recommended: response.recommended || false,
            citations: citationUrls,
            solutionAnalysis,
            companyMentioned: response.company_mentioned || false,
            mentioned_companies: Array.isArray(response.mentioned_companies) 
              ? response.mentioned_companies 
              : []
          }
        }
      })

      // Calculate company mention rate
      const engineCount = Object.keys(engineResults).length
      const mentionCount = Object.values(engineResults)
        .filter(result => result.companyMentioned).length
      const companyMentionRate = engineCount > 0 ? (mentionCount / engineCount) * 100 : 0

      return {
        id: queryInfo.query_id,
        text: queryInfo.query_text,
        buyerJourneyPhase: queryInfo.buying_journey_stage,
        engineResults,
        companyMentioned: companyMentionRate > 0,
        companyMentionRate,
        companyName: queryInfo.company_name || undefined
      }
    })
  } catch (error) {
    console.error('Error fetching queries:', error)
    return []
  }
} 