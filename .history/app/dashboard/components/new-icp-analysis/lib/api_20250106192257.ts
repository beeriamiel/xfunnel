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
    sentimentScore: calculateAverage(typedData, 'sentiment_score'),
    rankingPosition: calculateAverage(typedData, 'ranking_position'),
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
      sentimentScore: calculateAverage(items, 'sentiment_score'),
      rankingPosition: calculateAverage(items, 'ranking_position'),
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
    const vertical = item.industry_vertical || 'Unknown'
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
      sentimentScore: calculateAverage(items, 'sentiment_score'),
      rankingPosition: calculateAverage(items, 'ranking_position'),
      companyMentioned: calculateMentionedRate(items),
      recommendationRate: calculateRecommendationRate(items),
      totalResponses: items.length
    },
    timelineData: groupByDate(items)
  }))
}

// Helper functions
function calculateAverage(
  data: Database['public']['Tables']['response_analysis']['Row'][], 
  field: 'sentiment_score' | 'ranking_position'
): number {
  const validValues = data.filter(item => item[field] != null)
  if (!validValues.length) return 0
  return validValues.reduce((sum, item) => sum + (item[field] || 0), 0) / validValues.length
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
      sentimentScore: calculateAverage(items, 'sentiment_score'),
      rankingPosition: calculateAverage(items, 'ranking_position'),
      companyMentioned: calculateMentionedRate(items),
      recommendationRate: calculateRecommendationRate(items),
      totalResponses: items.length
    }
  }))
} 