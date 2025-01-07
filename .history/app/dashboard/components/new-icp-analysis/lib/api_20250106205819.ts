import { createClient } from '@/app/supabase/client'
import { Database } from '@/types/supabase'

export interface AnalysisMetrics {
  sentimentScore: number
  rankingPosition: number
  companyMentioned: number
  recommendationRate: number
  totalResponses: number
}

export interface CompanyAnalysis {
  metrics: AnalysisMetrics
  timelineData: {
    date: string
    metrics: AnalysisMetrics
  }[]
}

export interface RegionAnalysis {
  region: string
  metrics: AnalysisMetrics
  timelineData: {
    date: string
    metrics: AnalysisMetrics
  }[]
}

export interface VerticalAnalysis {
  vertical: string
  metrics: AnalysisMetrics
  timelineData: {
    date: string
    metrics: AnalysisMetrics
  }[]
}

export interface PersonaAnalysis {
  persona: string
  metrics: AnalysisMetrics
  timelineData: {
    date: string
    metrics: AnalysisMetrics
  }[]
}

export interface PlatformRankings {
  [platform: string]: number  // e.g., { "Perplexity": 3, "Claude": 1 }
}

export interface QueryAnalysis {
  stage: string
  queries: {
    queryText: string
    metrics: AnalysisMetrics
    platformRankings: PlatformRankings
    answerEngine: string
    responseText: string | null
    competitors: string[]
  }[]
  metrics: AnalysisMetrics
  timelineData: {
    date: string
    metrics: AnalysisMetrics
  }[]
}

export async function getAnalysisByCompany(companyId: number): Promise<CompanyAnalysis> {
  const supabase = createClient()

  // Get the raw analysis data
  const { data: analysisData, error } = await supabase
    .from('response_analysis')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: true })

  if (error) throw new Error(`Failed to fetch analysis data: ${error.message}`)
  if (!analysisData?.length) {
    throw new Error('No analysis data found for this company')
  }

  const typedData = analysisData as Database['public']['Tables']['response_analysis']['Row'][]

  // Calculate overall metrics
  const metrics: AnalysisMetrics = {
    sentimentScore: calculateSentimentScore(typedData),
    rankingPosition: calculateRankingPosition(typedData),
    companyMentioned: calculateMentionedRate(typedData),
    recommendationRate: calculateRecommendationRate(typedData),
    totalResponses: typedData.length
  }

  // Group data by date for timeline
  const timelineData = groupByDate(typedData)

  return {
    metrics,
    timelineData
  }
}

export async function getAnalysisByRegion(companyId: number): Promise<RegionAnalysis[]> {
  const supabase = createClient()

  // Get the raw analysis data
  const { data: analysisData, error } = await supabase
    .from('response_analysis')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: true })

  if (error) throw new Error(`Failed to fetch analysis data: ${error.message}`)
  if (!analysisData?.length) {
    throw new Error('No analysis data found for this company')
  }

  const typedData = analysisData as Database['public']['Tables']['response_analysis']['Row'][]

  // Group data by region
  const regionGroups = typedData.reduce((acc, item) => {
    const region = item.geographic_region || 'Unknown'
    if (!acc[region]) {
      acc[region] = []
    }
    acc[region].push(item)
    return acc
  }, {} as Record<string, Database['public']['Tables']['response_analysis']['Row'][]>)

  // Calculate metrics for each region
  return Object.entries(regionGroups).map(([region, items]) => ({
    region,
    metrics: {
      sentimentScore: calculateSentimentScore(items),
      rankingPosition: calculateRankingPosition(items),
      companyMentioned: calculateMentionedRate(items),
      recommendationRate: calculateRecommendationRate(items),
      totalResponses: items.length
    },
    timelineData: groupByDate(items)
  }))
}

export async function getAnalysisByVertical(
  companyId: number,
  region: string
): Promise<VerticalAnalysis[]> {
  const supabase = createClient()

  // Get the raw analysis data filtered by region
  const { data: analysisData, error } = await supabase
    .from('response_analysis')
    .select('*')
    .eq('company_id', companyId)
    .eq('geographic_region', region)
    .order('created_at', { ascending: true })

  if (error) throw new Error(`Failed to fetch analysis data: ${error.message}`)
  if (!analysisData?.length) {
    throw new Error(`No analysis data found for company in region: ${region}`)
  }

  const typedData = analysisData as Database['public']['Tables']['response_analysis']['Row'][]

  // Group data by vertical
  const verticalGroups = typedData.reduce((acc, item) => {
    const vertical = item.icp_vertical || 'Unknown'
    if (!acc[vertical]) {
      acc[vertical] = []
    }
    acc[vertical].push(item)
    return acc
  }, {} as Record<string, Database['public']['Tables']['response_analysis']['Row'][]>)

  // Calculate metrics for each vertical
  return Object.entries(verticalGroups).map(([vertical, items]) => ({
    vertical,
    metrics: {
      sentimentScore: calculateSentimentScore(items),
      rankingPosition: calculateRankingPosition(items),
      companyMentioned: calculateMentionedRate(items),
      recommendationRate: calculateRecommendationRate(items),
      totalResponses: items.length
    },
    timelineData: groupByDate(items)
  }))
}

export async function getAnalysisByPersona(
  companyId: number,
  region: string,
  vertical: string
): Promise<PersonaAnalysis[]> {
  const supabase = createClient()

  // Get the raw analysis data filtered by region and vertical
  const { data: analysisData, error } = await supabase
    .from('response_analysis')
    .select('*')
    .eq('company_id', companyId)
    .eq('geographic_region', region)
    .eq('icp_vertical', vertical)
    .order('created_at', { ascending: true })

  if (error) throw new Error(`Failed to fetch analysis data: ${error.message}`)
  if (!analysisData?.length) {
    throw new Error(`No analysis data found for company in region: ${region} and vertical: ${vertical}`)
  }

  const typedData = analysisData as Database['public']['Tables']['response_analysis']['Row'][]

  // Group data by persona
  const personaGroups = typedData.reduce((acc, item) => {
    const persona = item.buyer_persona || 'Unknown'
    if (!acc[persona]) {
      acc[persona] = []
    }
    acc[persona].push(item)
    return acc
  }, {} as Record<string, Database['public']['Tables']['response_analysis']['Row'][]>)

  // Calculate metrics for each persona
  return Object.entries(personaGroups).map(([persona, items]) => ({
    persona,
    metrics: {
      sentimentScore: calculateSentimentScore(items),
      rankingPosition: calculateRankingPosition(items),
      companyMentioned: calculateMentionedRate(items),
      recommendationRate: calculateRecommendationRate(items),
      totalResponses: items.length
    },
    timelineData: groupByDate(items)
  }))
}

export async function getAnalysisByQueries(
  companyId: number,
  region: string,
  vertical: string,
  persona: string,
  filters?: {
    batchId?: string
    startDate?: Date
    endDate?: Date
  }
): Promise<QueryAnalysis[]> {
  const supabase = createClient()

  // Build query with filters
  let query = supabase
    .from('response_analysis')
    .select('*')
    .eq('company_id', companyId)
    .eq('geographic_region', region)
    .eq('icp_vertical', vertical)
    .eq('buyer_persona', persona)

  // Apply optional filters
  if (filters?.batchId) {
    query = query.eq('analysis_batch_id', filters.batchId)
  }
  if (filters?.startDate) {
    query = query.gte('created_at', filters.startDate.toISOString())
  }
  if (filters?.endDate) {
    query = query.lte('created_at', filters.endDate.toISOString())
  }

  // Execute query
  const { data: analysisData, error } = await query.order('created_at', { ascending: true })

  if (error) throw new Error(`Failed to fetch analysis data: ${error.message}`)
  if (!analysisData?.length) {
    throw new Error(`No analysis data found for the specified filters`)
  }

  const typedData = analysisData as Database['public']['Tables']['response_analysis']['Row'][]

  // Group data by buying journey stage
  const stageGroups = typedData.reduce((acc, item) => {
    const stage = item.buying_journey_stage || 'Unknown'
    if (!acc[stage]) {
      acc[stage] = []
    }
    acc[stage].push(item)
    return acc
  }, {} as Record<string, Database['public']['Tables']['response_analysis']['Row'][]>)

  // Process each stage
  return Object.entries(stageGroups).map(([stage, items]) => ({
    stage,
    queries: items.map(item => ({
      queryText: item.query_text || '',
      metrics: {
        sentimentScore: item.sentiment_score || 0,
        rankingPosition: item.ranking_position || 0,
        companyMentioned: item.company_mentioned ? 100 : 0,
        recommendationRate: item.recommended ? 100 : 0,
        totalResponses: 1
      },
      platformRankings: parsePlatformRankings(item.rank_list),
      answerEngine: item.answer_engine,
      responseText: item.response_text,
      competitors: item.competitors_list || []
    })),
    metrics: {
      sentimentScore: calculateSentimentScore(items),
      rankingPosition: calculateRankingPosition(items),
      companyMentioned: calculateMentionedRate(items),
      recommendationRate: calculateRecommendationRate(items),
      totalResponses: items.length
    },
    timelineData: groupByDate(items)
  }))
}

// New helper function for parsing platform rankings
function parsePlatformRankings(rankList: string | null): PlatformRankings {
  if (!rankList) return {}
  
  try {
    // Assuming rank_list is stored as JSON string
    const rankings = JSON.parse(rankList)
    return rankings as PlatformRankings
  } catch {
    // If parsing fails, try to parse as comma-separated string (fallback)
    const rankings: PlatformRankings = {}
    rankList.split(',').forEach(rank => {
      const [platform, position] = rank.split(':')
      if (platform && position) {
        rankings[platform.trim()] = parseInt(position.trim(), 10)
      }
    })
    return rankings
  }
}

// Helper functions
function calculateSentimentScore(
  data: Database['public']['Tables']['response_analysis']['Row'][]
): number {
  // Filter out null/undefined values
  const validValues = data.filter(item => 
    item.sentiment_score !== null && 
    item.sentiment_score !== undefined
  )
  
  if (!validValues.length) return 0
  
  // Calculate average and normalize to 0-100 scale
  const average = validValues.reduce((sum, item) => {
    // Ensure value is between -1 and 1 before normalizing
    const score = Math.max(-1, Math.min(1, item.sentiment_score || 0))
    return sum + score
  }, 0) / validValues.length
  
  // Convert from -1:1 scale to 0:100 scale
  return ((average + 1) / 2) * 100
}

function calculateRankingPosition(
  data: Database['public']['Tables']['response_analysis']['Row'][]
): number {
  // Only consider solution_comparison and final_research stages
  const validStages = ['solution_comparison', 'final_research']
  const relevantData = data.filter(item => 
    item.buying_journey_stage && 
    validStages.includes(item.buying_journey_stage) &&
    item.ranking_position !== null &&
    item.ranking_position !== undefined
  )
  
  if (!relevantData.length) return 0
  
  return relevantData.reduce((sum, item) => 
    sum + (item.ranking_position || 0), 0
  ) / relevantData.length
}

function calculateAverage(
  data: Database['public']['Tables']['response_analysis']['Row'][]
): number {
  return 0 // This function might not be needed anymore, but keeping for now
}

function calculateMentionedRate(
  data: Database['public']['Tables']['response_analysis']['Row'][]
): number {
  const mentioned = data.filter(item => item.company_mentioned).length
  return (mentioned / data.length) * 100
}

function calculateRecommendationRate(
  data: Database['public']['Tables']['response_analysis']['Row'][]
): number {
  const recommended = data.filter(item => item.recommended).length
  return (recommended / data.length) * 100
}

function groupByDate(
  data: Database['public']['Tables']['response_analysis']['Row'][]
): { date: string; metrics: AnalysisMetrics }[] {
  const groupedData = data.reduce((acc, item) => {
    const date = new Date(item.created_at || '').toISOString().split('T')[0]
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(item)
    return acc
  }, {} as Record<string, Database['public']['Tables']['response_analysis']['Row'][]>)

  return Object.entries(groupedData).map(([date, items]) => ({
    date,
    metrics: {
      sentimentScore: calculateSentimentScore(items),
      rankingPosition: calculateRankingPosition(items),
      companyMentioned: calculateMentionedRate(items),
      recommendationRate: calculateRecommendationRate(items),
      totalResponses: items.length
    }
  }))
} 