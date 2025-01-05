import { createClient } from '@/app/supabase/server'
import { NextResponse } from 'next/server'

interface ResponseAnalysis {
  id: number
  company_id: number
  geographic_region: string | null
  icp_vertical: string | null
  buyer_persona: string | null
  sentiment_score: number | null
  ranking_position: number | null
  company_mentioned: boolean
  created_at: string
  buying_journey_stage: string | null
  solution_analysis: {
    has_feature?: 'YES' | 'NO' | 'N/A'
  } | null
}

interface Metrics {
  companyMentioned: number
  averagePosition: number
  featureScore: number
  averageSentiment: number
  totalQueries?: number
  changeFromPrevious?: {
    companyMentioned: number
    averagePosition: number
    featureScore: number
    averageSentiment: number
  }
}

interface Card {
  id: string
  title: string
  description: string
  metrics: Metrics
}

const EARLY_PHASES = ['problem_exploration', 'solution_education']
const POSITION_PHASES = ['solution_comparison', 'user_feedback']
const EVALUATION_PHASE = 'solution_evaluation'

function calculateMetrics(responses: ResponseAnalysis[]): Metrics {
  const metrics = {
    companyMentioned: 0,
    averagePosition: 0,
    featureScore: 0,
    averageSentiment: 0,
    totalQueries: responses.length
  }

  if (!responses.length) return metrics

  // Calculate sentiment score (all stages)
  const validSentiments = responses.filter(r => r.sentiment_score !== null)
  if (validSentiments.length) {
    metrics.averageSentiment = validSentiments.reduce((sum, r) => sum + (r.sentiment_score || 0), 0) / validSentiments.length
  }

  // Calculate position score (comparison and feedback stages)
  const positionResponses = responses.filter(r => 
    r.buying_journey_stage && 
    POSITION_PHASES.includes(r.buying_journey_stage) &&
    r.ranking_position !== null && 
    r.ranking_position > 0
  )
  if (positionResponses.length) {
    metrics.averagePosition = positionResponses.reduce((sum, r) => sum + (r.ranking_position || 0), 0) / positionResponses.length
  }

  // Calculate mention rate (early stages)
  const earlyStageResponses = responses.filter(r => 
    r.buying_journey_stage && 
    EARLY_PHASES.includes(r.buying_journey_stage)
  )
  if (earlyStageResponses.length) {
    metrics.companyMentioned = earlyStageResponses.filter(r => r.company_mentioned).length / earlyStageResponses.length
  }

  // Calculate feature score (evaluation stage)
  const evaluationResponses = responses.filter(r => 
    r.buying_journey_stage === EVALUATION_PHASE && 
    r.solution_analysis
  )
  if (evaluationResponses.length) {
    const featureYesCount = evaluationResponses.filter(r => {
      try {
        const analysis = typeof r.solution_analysis === 'string'
          ? JSON.parse(r.solution_analysis)
          : r.solution_analysis
        return analysis.has_feature === 'YES'
      } catch (e) {
        console.warn('Failed to parse solution analysis:', e)
        return false
      }
    }).length
    metrics.featureScore = featureYesCount / evaluationResponses.length
  }

  return metrics
}

function calculateTimeRange(timeFrame: string) {
  const now = new Date()
  const start = new Date()
  
  if (timeFrame === 'week') {
    start.setDate(now.getDate() - 7)
  } else if (timeFrame === 'month') {
    start.setMonth(now.getMonth() - 1)
  }
  
  return {
    start: start.toISOString(),
    end: now.toISOString()
  }
}

function generateCards(data: ResponseAnalysis[], type: 'region' | 'vertical' | 'persona'): Card[] {
  // Group data by the specified type
  const groups = data.reduce((acc, item) => {
    let key = ''
    switch (type) {
      case 'region':
        key = item.geographic_region || 'Unknown'
        break
      case 'vertical':
        key = item.icp_vertical || 'Unknown'
        break
      case 'persona':
        key = item.buyer_persona || 'Unknown'
        break
    }
    
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(item)
    return acc
  }, {} as Record<string, ResponseAnalysis[]>)

  // Convert groups to cards
  return Object.entries(groups)
    .filter(([key]) => key !== 'Unknown' && key !== null) // Filter out unknown/null values
    .map(([key, items]) => ({
      id: key,
      title: key,
      description: `${items.length} responses`,
      metrics: calculateMetrics(items)
    }))
    .sort((a, b) => (b.metrics.totalQueries || 0) - (a.metrics.totalQueries || 0)) // Sort by total queries
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('companyId')
    const region = searchParams.get('region')
    const vertical = searchParams.get('vertical')
    const persona = searchParams.get('persona')
    const timeFrame = searchParams.get('timeFrame') || 'week'

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const { start, end } = calculateTimeRange(timeFrame)

    // Build query filters
    let query = supabase
      .from('response_analysis')
      .select('*')
      .eq('company_id', companyId)
      .gte('created_at', start)
      .lte('created_at', end)

    // Add filters and ensure non-null values for the current stage
    if (region) {
      query = query.eq('geographic_region', region)
      if (!vertical) {
        query = query.not('icp_vertical', 'is', null)
      }
    }
    if (vertical) {
      query = query.eq('icp_vertical', vertical)
      if (!persona) {
        query = query.not('buyer_persona', 'is', null)
      }
    }
    if (persona) {
      query = query.eq('buyer_persona', persona)
    }

    const { data: currentData, error: currentError } = await query

    if (currentError) {
      return NextResponse.json(
        { error: 'Failed to fetch data' },
        { status: 500 }
      )
    }

    const typedCurrentData = (currentData || []) as ResponseAnalysis[]
    const metrics = calculateMetrics(typedCurrentData)

    // Get previous period data for comparison
    const prevStart = new Date(start)
    const prevEnd = new Date(end)
    if (timeFrame === 'week') {
      prevStart.setDate(prevStart.getDate() - 7)
      prevEnd.setDate(prevEnd.getDate() - 7)
    } else {
      prevStart.setMonth(prevStart.getMonth() - 1)
      prevEnd.setMonth(prevEnd.getMonth() - 1)
    }

    const { data: prevData } = await supabase
      .from('response_analysis')
      .select('*')
      .eq('company_id', companyId)
      .gte('created_at', prevStart.toISOString())
      .lte('created_at', prevEnd.toISOString())

    const typedPrevData = (prevData || []) as ResponseAnalysis[]

    if (typedPrevData.length) {
      const prevMetrics = calculateMetrics(typedPrevData)
      metrics.changeFromPrevious = {
        companyMentioned: metrics.companyMentioned - prevMetrics.companyMentioned,
        averagePosition: metrics.averagePosition - prevMetrics.averagePosition,
        featureScore: metrics.featureScore - prevMetrics.featureScore,
        averageSentiment: metrics.averageSentiment - prevMetrics.averageSentiment
      }
    }

    // Generate cards based on current stage
    let cards: Card[] = []
    if (!region) {
      cards = generateCards(typedCurrentData, 'region')
    } else if (!vertical) {
      cards = generateCards(typedCurrentData, 'vertical')
    } else if (!persona) {
      cards = generateCards(typedCurrentData, 'persona')
    }

    // Calculate trends
    const trends = typedCurrentData.reduce((acc, item) => {
      const date = new Date(item.created_at).toISOString().split('T')[0]
      const existing = acc.find(t => t.date === date)
      
      if (existing) {
        const metrics = calculateMetrics([...acc.find(t => t.date === date)!.responses, item])
        existing.companyMentioned = metrics.companyMentioned
        existing.averageSentiment = metrics.averageSentiment
        existing.responses.push(item)
      } else {
        const metrics = calculateMetrics([item])
        acc.push({
          date,
          companyMentioned: metrics.companyMentioned,
          averageSentiment: metrics.averageSentiment,
          responses: [item]
        })
      }
      return acc
    }, [] as Array<{
      date: string
      companyMentioned: number
      averageSentiment: number
      responses: ResponseAnalysis[]
    }>)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(({ responses, ...rest }) => rest) // Remove responses array from output

    return NextResponse.json({
      cards,
      metrics,
      trends
    })
  } catch (error) {
    console.error('Error in buying journey data API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 