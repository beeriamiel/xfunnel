import { startOfWeek, startOfMonth, endOfWeek, endOfMonth } from 'date-fns'
import {
  Region,
  Vertical,
  Persona,
  Query,
  TimeFilter,
  ResponseAnalysis,
  MetricData,
} from './types'

function calculateMetrics(analyses: ResponseAnalysis[]): MetricData {
  const prevAnalyses = [] // TODO: Get previous period analyses
  
  const metrics = {
    sentiment: 0,
    position: 0,
    mentioned: 0,
    featureScore: 0,
  }
  
  const changes = {
    sentiment: 0,
    position: 0,
    mentioned: 0,
    featureScore: 0,
  }

  if (analyses.length === 0) return { ...metrics }

  // Calculate current metrics
  metrics.sentiment =
    analyses.reduce((sum, a) => sum + (a.sentiment_score || 0), 0) /
    analyses.length
  
  metrics.position =
    analyses.reduce((sum, a) => sum + (a.ranking_position || 0), 0) /
    analyses.length
  
  metrics.mentioned =
    (analyses.filter((a) => a.company_mentioned).length / analyses.length) * 100
  
  metrics.featureScore =
    analyses.reduce((sum, a) => {
      if (!a.solution_analysis) return sum
      const analysis = a.solution_analysis as { yes: number; no: number; unknown: number }
      return sum + (analysis.yes || 0)
    }, 0) / analyses.length

  // Calculate changes if we have previous period data
  if (prevAnalyses.length > 0) {
    const prevMetrics = calculateMetrics(prevAnalyses)
    changes.sentiment = metrics.sentiment - prevMetrics.sentiment
    changes.position = metrics.position - prevMetrics.position
    changes.mentioned = metrics.mentioned - prevMetrics.mentioned
    changes.featureScore = metrics.featureScore - prevMetrics.featureScore
  }

  return { ...metrics, changes }
}

function getTimeRange(filter: TimeFilter) {
  if (filter.type === 'batch') {
    return { batchId: filter.batchId }
  }

  if (!filter.timePeriod?.value) {
    return {}
  }

  const date = new Date(filter.timePeriod.value)
  const isWeek = filter.timePeriod.type === 'week'

  const start = isWeek ? startOfWeek(date) : startOfMonth(date)
  const end = isWeek ? endOfWeek(date) : endOfMonth(date)

  return { start, end }
}

export async function fetchRegions(
  companyId: number,
  filter: TimeFilter
): Promise<Region[]> {
  // TODO: Fetch from API
  const analyses: ResponseAnalysis[] = []
  const regions = new Map<string, ResponseAnalysis[]>()

  // Group by region
  analyses.forEach((analysis) => {
    if (!analysis.geographic_region) return
    if (!regions.has(analysis.geographic_region)) {
      regions.set(analysis.geographic_region, [])
    }
    regions.get(analysis.geographic_region)?.push(analysis)
  })

  return Array.from(regions.entries()).map(([id, analyses]) => ({
    id,
    name: id === 'americas' ? 'Americas' : 'EMEA',
    metrics: calculateMetrics(analyses),
  }))
}

export async function fetchVerticals(
  companyId: number,
  regionId: string,
  filter: TimeFilter
): Promise<Vertical[]> {
  // TODO: Fetch from API
  const analyses: ResponseAnalysis[] = []
  const verticals = new Map<string, ResponseAnalysis[]>()

  // Group by vertical
  analyses.forEach((analysis) => {
    if (!analysis.industry_vertical) return
    if (!verticals.has(analysis.industry_vertical)) {
      verticals.set(analysis.industry_vertical, [])
    }
    verticals.get(analysis.industry_vertical)?.push(analysis)
  })

  return Array.from(verticals.entries()).map(([id, analyses]) => ({
    id,
    name: id === 'enterprise-software' ? 'Enterprise Software' : 'Financial Services',
    metrics: calculateMetrics(analyses),
  }))
}

export async function fetchPersonas(
  companyId: number,
  verticalId: string,
  filter: TimeFilter
): Promise<Persona[]> {
  // TODO: Fetch from API
  const analyses: ResponseAnalysis[] = []
  const personas = new Map<string, ResponseAnalysis[]>()

  // Group by persona
  analyses.forEach((analysis) => {
    if (!analysis.buyer_persona) return
    if (!personas.has(analysis.buyer_persona)) {
      personas.set(analysis.buyer_persona, [])
    }
    personas.get(analysis.buyer_persona)?.push(analysis)
  })

  return Array.from(personas.entries()).map(([id, analyses]) => ({
    id,
    name: id === 'devops-lead' ? 'DevOps Lead' : 'Tech Lead',
    description:
      id === 'devops-lead'
        ? 'Technical decision maker for infrastructure and operations'
        : 'Technical architect responsible for system design',
    metrics: calculateMetrics(analyses),
  }))
}

export async function fetchQueries(
  companyId: number,
  personaId: string,
  filter: TimeFilter
): Promise<Query[]> {
  // TODO: Fetch from API
  const analyses: ResponseAnalysis[] = []
  const queries = new Map<string, ResponseAnalysis[]>()

  // Group by query
  analyses.forEach((analysis) => {
    if (!analysis.query_id || !analysis.query_text) return
    const queryId = analysis.query_id.toString()
    if (!queries.has(queryId)) {
      queries.set(queryId, [])
    }
    queries.get(queryId)?.push(analysis)
  })

  return Array.from(queries.entries()).map(([id, analyses]) => {
    const analysis = analyses[0]
    return {
      id,
      text: analysis.query_text!,
      stage: (analysis.buying_journey_stage as Query['stage']) || 'problem-exploration',
      engines: analyses.map((a) => ({
        name: a.answer_engine,
        result: {
          mentioned: a.company_mentioned || false,
          position: a.ranking_position || undefined,
          featureAnalysis: a.solution_analysis as Query['engines'][0]['result']['featureAnalysis'],
        },
      })),
    }
  })
} 