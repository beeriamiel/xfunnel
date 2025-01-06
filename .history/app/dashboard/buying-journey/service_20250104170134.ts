import {
  Region,
  Vertical,
  Persona,
  Query,
  TimeFilter,
  ResponseAnalysis,
  MetricData,
} from './types'
import {
  fetchResponseAnalysis,
  fetchPreviousPeriodAnalysis,
  fetchBatches,
} from './api'

function calculateMetrics(
  analyses: ResponseAnalysis[],
  prevAnalyses: ResponseAnalysis[] = []
): MetricData {
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

export async function fetchRegions(
  companyId: number,
  filter: TimeFilter
): Promise<Region[]> {
  const [analyses, prevAnalyses] = await Promise.all([
    fetchResponseAnalysis({ companyId, filter }),
    fetchPreviousPeriodAnalysis({ companyId, filter }),
  ])

  const regions = new Map<string, ResponseAnalysis[]>()
  const prevRegions = new Map<string, ResponseAnalysis[]>()

  // Group current period by region
  analyses.forEach((analysis: ResponseAnalysis) => {
    if (!analysis.geographic_region) return
    if (!regions.has(analysis.geographic_region)) {
      regions.set(analysis.geographic_region, [])
    }
    regions.get(analysis.geographic_region)?.push(analysis)
  })

  // Group previous period by region
  prevAnalyses.forEach((analysis: ResponseAnalysis) => {
    if (!analysis.geographic_region) return
    if (!prevRegions.has(analysis.geographic_region)) {
      prevRegions.set(analysis.geographic_region, [])
    }
    prevRegions.get(analysis.geographic_region)?.push(analysis)
  })

  return Array.from(regions.entries()).map(([id, regionAnalyses]) => ({
    id,
    name: id === 'americas' ? 'Americas' : 'EMEA',
    metrics: calculateMetrics(regionAnalyses, prevRegions.get(id)),
  }))
}

export async function fetchVerticals(
  companyId: number,
  regionId: string,
  filter: TimeFilter
): Promise<Vertical[]> {
  const [analyses, prevAnalyses] = await Promise.all([
    fetchResponseAnalysis({ companyId, region: regionId, filter }),
    fetchPreviousPeriodAnalysis({ companyId, region: regionId, filter }),
  ])

  const verticals = new Map<string, ResponseAnalysis[]>()
  const prevVerticals = new Map<string, ResponseAnalysis[]>()

  // Group current period by vertical
  analyses.forEach((analysis: ResponseAnalysis) => {
    if (!analysis.industry_vertical) return
    if (!verticals.has(analysis.industry_vertical)) {
      verticals.set(analysis.industry_vertical, [])
    }
    verticals.get(analysis.industry_vertical)?.push(analysis)
  })

  // Group previous period by vertical
  prevAnalyses.forEach((analysis: ResponseAnalysis) => {
    if (!analysis.industry_vertical) return
    if (!prevVerticals.has(analysis.industry_vertical)) {
      prevVerticals.set(analysis.industry_vertical, [])
    }
    prevVerticals.get(analysis.industry_vertical)?.push(analysis)
  })

  return Array.from(verticals.entries()).map(([id, verticalAnalyses]) => ({
    id,
    name: id === 'enterprise-software' ? 'Enterprise Software' : 'Financial Services',
    metrics: calculateMetrics(verticalAnalyses, prevVerticals.get(id)),
  }))
}

export async function fetchPersonas(
  companyId: number,
  verticalId: string,
  filter: TimeFilter
): Promise<Persona[]> {
  const [analyses, prevAnalyses] = await Promise.all([
    fetchResponseAnalysis({ companyId, vertical: verticalId, filter }),
    fetchPreviousPeriodAnalysis({ companyId, vertical: verticalId, filter }),
  ])

  const personas = new Map<string, ResponseAnalysis[]>()
  const prevPersonas = new Map<string, ResponseAnalysis[]>()

  // Group current period by persona
  analyses.forEach((analysis: ResponseAnalysis) => {
    if (!analysis.buyer_persona) return
    if (!personas.has(analysis.buyer_persona)) {
      personas.set(analysis.buyer_persona, [])
    }
    personas.get(analysis.buyer_persona)?.push(analysis)
  })

  // Group previous period by persona
  prevAnalyses.forEach((analysis: ResponseAnalysis) => {
    if (!analysis.buyer_persona) return
    if (!prevPersonas.has(analysis.buyer_persona)) {
      prevPersonas.set(analysis.buyer_persona, [])
    }
    prevPersonas.get(analysis.buyer_persona)?.push(analysis)
  })

  return Array.from(personas.entries()).map(([id, personaAnalyses]) => ({
    id,
    name: id === 'devops-lead' ? 'DevOps Lead' : 'Tech Lead',
    description:
      id === 'devops-lead'
        ? 'Technical decision maker for infrastructure and operations'
        : 'Technical architect responsible for system design',
    metrics: calculateMetrics(personaAnalyses, prevPersonas.get(id)),
  }))
}

export async function fetchQueries(
  companyId: number,
  personaId: string,
  filter: TimeFilter
): Promise<Query[]> {
  const analyses = await fetchResponseAnalysis({
    companyId,
    persona: personaId,
    filter,
  })

  const queries = new Map<string, ResponseAnalysis[]>()

  // Group by query
  analyses.forEach((analysis: ResponseAnalysis) => {
    if (!analysis.query_id || !analysis.query_text) return
    const queryId = analysis.query_id.toString()
    if (!queries.has(queryId)) {
      queries.set(queryId, [])
    }
    queries.get(queryId)?.push(analysis)
  })

  return Array.from(queries.entries()).map(([id, queryAnalyses]) => {
    const analysis = queryAnalyses[0]
    return {
      id,
      text: analysis.query_text!,
      stage: (analysis.buying_journey_stage as Query['stage']) || 'problem-exploration',
      engines: queryAnalyses.map((a) => ({
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

export async function fetchAvailableBatches(companyId: number) {
  return fetchBatches(companyId)
} 