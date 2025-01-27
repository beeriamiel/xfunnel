import { createClient } from '@/app/supabase/client'
import { Database } from '@/types/supabase'
import { TimePeriod } from '@/app/dashboard/store'
import { groupDataByPeriod, getDateRangeForPeriod, formatPeriodLabel } from './date-utils'

export interface AnalysisMetrics {
  sentimentScore: number
  rankingPosition: number
  companyMentioned: number
  featureScore: number
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

export async function getAnalysisByCompany(
  companyId: number,
  accountId: string,
  timePeriod: TimePeriod,
  isSuperAdmin?: boolean
): Promise<CompanyAnalysis> {
  const supabase = createClient()
  const { start, end } = getDateRangeForPeriod(timePeriod)

  // Get the raw analysis data with date range filter
  let query = supabase
    .from('response_analysis')
    .select('*')
    .eq('company_id', companyId)
    .gte('created_at', start.toISOString())
    .lte('created_at', end.toISOString())
    .order('created_at', { ascending: true })

  // Add account filter for non-super admins
  if (!isSuperAdmin) {
    query = query.eq('account_id', accountId)
  }

  const { data: analysisData, error } = await query

  if (error) throw new Error(`Failed to fetch analysis data: ${error.message}`)
  if (!analysisData?.length) {
    throw new Error('No analysis data found for this company')
  }

  const typedData = analysisData as Database['public']['Tables']['response_analysis']['Row'][]

  // Group data by region first
  const regionGroups = groupByField(typedData, 'geographic_region');

  // Calculate metrics for each region
  const regionMetrics = Object.entries(regionGroups).map(([region, items]) => ({
    region,
    metrics: {
      sentimentScore: calculateSentimentScore(items),
      rankingPosition: calculateRankingPosition(items),
      companyMentioned: calculateMentionedRate(items),
      featureScore: calculateFeatureScore(items),
      totalResponses: items.length
    }
  }));

  // Calculate company-wide metrics by aggregating region metrics
  const companyMetrics = aggregateMetrics(regionMetrics.map(r => r.metrics));

  // Calculate timeline data
  const groupedData = groupDataByPeriod(typedData, timePeriod)
  const timelineData = Array.from(groupedData.entries()).map(([date, items]) => ({
    date,
    metrics: {
      sentimentScore: calculateSentimentScore(items),
      rankingPosition: calculateRankingPosition(items),
      companyMentioned: calculateMentionedRate(items),
      featureScore: calculateFeatureScore(items),
      totalResponses: items.length
    }
  }));

  return {
    metrics: companyMetrics,
    timelineData
  }
}

export async function getAnalysisByRegion(
  companyId: number,
  accountId: string,
  timePeriod: TimePeriod,
  isSuperAdmin?: boolean
): Promise<RegionAnalysis[]> {
  const supabase = createClient()
  const { start, end } = getDateRangeForPeriod(timePeriod)

  // Get the raw analysis data with date range filter
  let query = supabase
    .from('response_analysis')
    .select('*')
    .eq('company_id', companyId)
    .gte('created_at', start.toISOString())
    .lte('created_at', end.toISOString())
    .order('created_at', { ascending: true })

  // Add account filter for non-super admins
  if (!isSuperAdmin) {
    query = query.eq('account_id', accountId)
  }

  const { data: analysisData, error } = await query

  if (error) throw new Error(`Failed to fetch analysis data: ${error.message}`)
  if (!analysisData?.length) {
    throw new Error('No analysis data found for this company')
  }

  const typedData = analysisData as Database['public']['Tables']['response_analysis']['Row'][]

  // Group data by region
  const regionGroups = groupByField(typedData, 'geographic_region');

  // Calculate metrics for each region
  return Object.entries(regionGroups).map(([region, items]) => {
    // Calculate metrics for the region
    const metrics = {
      sentimentScore: calculateSentimentScore(items),
      rankingPosition: calculateRankingPosition(items),
      companyMentioned: calculateMentionedRate(items),
      featureScore: calculateFeatureScore(items),
      totalResponses: items.length
    };

    // Calculate timeline data for the region
    const groupedData = groupDataByPeriod(items, timePeriod)
    const timelineData = Array.from(groupedData.entries()).map(([date, periodItems]) => ({
      date,
      metrics: {
        sentimentScore: calculateSentimentScore(periodItems),
        rankingPosition: calculateRankingPosition(periodItems),
        companyMentioned: calculateMentionedRate(periodItems),
        featureScore: calculateFeatureScore(periodItems),
        totalResponses: periodItems.length
      }
    }));

    return {
      region,
      metrics,
      timelineData
    }
  })
}

export async function getAnalysisByVertical(
  companyId: number,
  accountId: string,
  region: string,
  timePeriod: TimePeriod,
  isSuperAdmin?: boolean
): Promise<VerticalAnalysis[]> {
  const supabase = createClient()
  const { start, end } = getDateRangeForPeriod(timePeriod)

  // Get the raw analysis data filtered by region and date range
  let query = supabase
    .from('response_analysis')
    .select('*')
    .eq('company_id', companyId)
    .eq('geographic_region', region)
    .gte('created_at', start.toISOString())
    .lte('created_at', end.toISOString())
    .order('created_at', { ascending: true })

  // Add account filter for non-super admins
  if (!isSuperAdmin) {
    query = query.eq('account_id', accountId)
  }

  const { data: analysisData, error } = await query

  if (error) throw new Error(`Failed to fetch analysis data: ${error.message}`)
  if (!analysisData?.length) {
    throw new Error(`No analysis data found for company in region: ${region}`)
  }

  const typedData = analysisData as Database['public']['Tables']['response_analysis']['Row'][]

  // Group data by vertical
  const verticalGroups = groupByField(typedData, 'icp_vertical');

  // Calculate metrics for each vertical
  return Object.entries(verticalGroups).map(([vertical, items]) => {
    // Calculate metrics for the vertical
    const metrics = {
      sentimentScore: calculateSentimentScore(items),
      rankingPosition: calculateRankingPosition(items),
      companyMentioned: calculateMentionedRate(items),
      featureScore: calculateFeatureScore(items),
      totalResponses: items.length
    };

    // Calculate timeline data for the vertical
    const groupedData = groupDataByPeriod(items, timePeriod)
    const timelineData = Array.from(groupedData.entries()).map(([date, periodItems]) => ({
      date,
      metrics: {
        sentimentScore: calculateSentimentScore(periodItems),
        rankingPosition: calculateRankingPosition(periodItems),
        companyMentioned: calculateMentionedRate(periodItems),
        featureScore: calculateFeatureScore(periodItems),
        totalResponses: periodItems.length
      }
    }));

    return {
      vertical,
      metrics,
      timelineData
    }
  })
}

// Helper function to aggregate metrics from child items
function aggregateMetrics(items: AnalysisMetrics[]): AnalysisMetrics {
  if (!items.length) return {
    sentimentScore: 0,
    rankingPosition: 0,
    companyMentioned: 0,
    featureScore: 0,
    totalResponses: 0
  }

  const totalResponses = items.reduce((sum, item) => sum + item.totalResponses, 0);
  
  // Initialize weighted sums and weights for each metric
  const weightedSums = {
    sentiment: 0,
    position: 0,
    mentioned: 0,
    feature: 0
  };

  const weights = {
    sentiment: 0,
    position: 0,
    mentioned: 0,
    feature: 0
  };

  // Process each item with appropriate weights
  items.forEach(item => {
    // Skip items with no responses
    if (item.totalResponses === 0) return;

    // Base weight is the number of responses
    const baseWeight = item.totalResponses;

    // Sentiment Score: Weight by response count and value presence
    if (item.sentimentScore !== null && item.sentimentScore !== undefined) {
      const weight = baseWeight;
      weightedSums.sentiment += item.sentimentScore * weight;
      weights.sentiment += weight;
    }

    // Ranking Position: Weight by response count and valid position
    if (item.rankingPosition !== null && item.rankingPosition !== undefined && item.rankingPosition > 0) {
      const weight = baseWeight;
      weightedSums.position += item.rankingPosition * weight;
      weights.position += weight;
    }

    // Company Mentioned: Weight by response count and mention presence
    if (item.companyMentioned !== null && item.companyMentioned !== undefined) {
      const weight = baseWeight;
      weightedSums.mentioned += item.companyMentioned * weight;
      weights.mentioned += weight;
    }

    // Feature Score: Weight by response count and score presence
    if (item.featureScore !== null && item.featureScore !== undefined) {
      const weight = baseWeight;
      weightedSums.feature += item.featureScore * weight;
      weights.feature += weight;
    }
  });

  // Calculate final weighted averages with fallbacks
  return {
    sentimentScore: weights.sentiment > 0 
      ? Math.round(weightedSums.sentiment / weights.sentiment) 
      : 0,
    rankingPosition: weights.position > 0 
      ? Math.round((weightedSums.position / weights.position) * 100) / 100 
      : 0,
    companyMentioned: weights.mentioned > 0 
      ? Math.round(weightedSums.mentioned / weights.mentioned) 
      : 0,
    featureScore: weights.feature > 0 
      ? Math.round(weightedSums.feature / weights.feature) 
      : 0,
    totalResponses
  };
}

export async function getAnalysisByQueries(
  companyId: number,
  accountId: string,
  region: string,
  vertical: string,
  persona: string,
  timePeriod: TimePeriod,
  isSuperAdmin?: boolean,
  filters?: {
    batchId?: string
  }
): Promise<QueryAnalysis[]> {
  const supabase = createClient()
  const { start, end } = getDateRangeForPeriod(timePeriod)

  // Build query with filters
  let query = supabase
    .from('response_analysis')
    .select('*')
    .eq('company_id', companyId)
    .eq('geographic_region', region)
    .eq('icp_vertical', vertical)
    .eq('buyer_persona', persona)
    .gte('created_at', start.toISOString())
    .lte('created_at', end.toISOString())

  // Add account filter for non-super admins
  if (!isSuperAdmin) {
    query = query.eq('account_id', accountId)
  }

  // Apply optional filters
  if (filters?.batchId) {
    query = query.eq('analysis_batch_id', filters.batchId)
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
  const stageAnalysis = Object.entries(stageGroups).map(([stage, items]) => {
    // Calculate query-level metrics first
    const queryMetrics = items.map(item => ({
      queryText: item.query_text || '',
      metrics: {
        sentimentScore: item.sentiment_score || 0,
        rankingPosition: item.ranking_position || 0,
        companyMentioned: ['problem_exploration', 'solution_education'].includes(item.buying_journey_stage || '') 
          ? (item.company_mentioned ? 100 : 0)
          : 0,
        featureScore: item.buying_journey_stage === 'solution_evaluation' && item.solution_analysis
          ? (() => {
              try {
                const analysis = JSON.parse(item.solution_analysis as string)
                const yesCount = Object.values(analysis).filter(value => value === "yes").length
                const totalCount = Object.keys(analysis).length
                return totalCount > 0 ? (yesCount / totalCount) * 100 : 0
              } catch {
                return 0
              }
            })()
          : 0,
        totalResponses: 1
      },
      platformRankings: parsePlatformRankings(item.rank_list),
      answerEngine: item.answer_engine,
      responseText: item.response_text,
      competitors: item.competitors_list || []
    }))

    // Aggregate metrics from queries
    const stageMetrics = aggregateMetrics(queryMetrics.map(q => q.metrics))

    // Group data by time period for timeline
    const groupedData = groupDataByPeriod(items, timePeriod)
    const timelineData = Array.from(groupedData.entries()).map(([date, periodItems]) => {
      const periodMetrics = periodItems.map(item => ({
        metrics: {
          sentimentScore: item.sentiment_score || 0,
          rankingPosition: item.ranking_position || 0,
          companyMentioned: ['problem_exploration', 'solution_education'].includes(item.buying_journey_stage || '') 
            ? (item.company_mentioned ? 100 : 0)
            : 0,
          featureScore: item.buying_journey_stage === 'solution_evaluation' && item.solution_analysis
            ? (() => {
                try {
                  const analysis = JSON.parse(item.solution_analysis as string)
                  const yesCount = Object.values(analysis).filter(value => value === "yes").length
                  const totalCount = Object.keys(analysis).length
                  return totalCount > 0 ? (yesCount / totalCount) * 100 : 0
                } catch {
                  return 0
                }
              })()
            : 0,
          totalResponses: 1
        }
      }))

      return {
        date,
        metrics: aggregateMetrics(periodMetrics.map(m => m.metrics))
      }
    })

    return {
      stage,
      queries: queryMetrics,
      metrics: stageMetrics,
      timelineData
    }
  })

  return stageAnalysis
}

export async function getAnalysisByPersona(
  companyId: number,
  accountId: string,
  region: string,
  vertical: string,
  timePeriod: TimePeriod,
  isSuperAdmin?: boolean
): Promise<PersonaAnalysis[]> {
  const supabase = createClient()
  const { start, end } = getDateRangeForPeriod(timePeriod)

  // Get query analysis for each persona with date range filter
  let query = supabase
    .from('response_analysis')
    .select('*')
    .eq('company_id', companyId)
    .eq('geographic_region', region)
    .eq('icp_vertical', vertical)
    .gte('created_at', start.toISOString())
    .lte('created_at', end.toISOString())
    .order('created_at', { ascending: true })

  // Add account filter for non-super admins
  if (!isSuperAdmin) {
    query = query.eq('account_id', accountId)
  }

  const { data: analysisData, error } = await query

  if (error) throw new Error(`Failed to fetch analysis data: ${error.message}`)
  if (!analysisData?.length) {
    throw new Error(`No analysis data found for the specified filters`)
  }

  const typedData = analysisData as Database['public']['Tables']['response_analysis']['Row'][]

  // Group by persona
  const personaGroups = groupByField(typedData, 'buyer_persona');

  // Calculate metrics for each persona
  return Object.entries(personaGroups).map(([persona, items]) => {
    // Calculate metrics for the persona
    const metrics = {
      sentimentScore: calculateSentimentScore(items),
      rankingPosition: calculateRankingPosition(items),
      companyMentioned: calculateMentionedRate(items),
      featureScore: calculateFeatureScore(items),
      totalResponses: items.length
    };

    // Calculate timeline data for the persona
    const groupedData = groupDataByPeriod(items, timePeriod)
    const timelineData = Array.from(groupedData.entries()).map(([date, periodItems]) => ({
      date,
      metrics: {
        sentimentScore: calculateSentimentScore(periodItems),
        rankingPosition: calculateRankingPosition(periodItems),
        companyMentioned: calculateMentionedRate(periodItems),
        featureScore: calculateFeatureScore(periodItems),
        totalResponses: periodItems.length
      }
    }));

    return {
      persona,
      metrics,
      timelineData
    }
  })
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

// Helper function to calculate company mention rate
function calculateMentionedRate(
  data: Database['public']['Tables']['response_analysis']['Row'][]
): number {
  const validStages = ['problem_exploration', 'solution_education'];
  const filteredData = data.filter(item => 
    item.buying_journey_stage !== null &&
    validStages.includes(item.buying_journey_stage)
  );
  
  if (filteredData.length === 0) return 0;
  
  return (filteredData.filter(item => 
    item.company_mentioned
  ).length / filteredData.length) * 100;
}

// Helper function to calculate average ranking position
function calculateRankingPosition(
  data: Database['public']['Tables']['response_analysis']['Row'][]
): number {
  const validStages = ['solution_comparison', 'final_research'];
  const filteredData = data.filter(item => 
    item.buying_journey_stage !== null &&
    validStages.includes(item.buying_journey_stage) &&
    item.ranking_position !== null &&
    item.ranking_position > 0  // Only include rankings greater than 0
  );
  
  if (filteredData.length === 0) return 0;
  
  return filteredData.reduce((sum, item) => 
    sum + item.ranking_position!
  , 0) / filteredData.length;
}

// Helper function to calculate sentiment score
function calculateSentimentScore(
  data: Database['public']['Tables']['response_analysis']['Row'][]
): number {
  const validData = data.filter(item => 
    item.sentiment_score !== null
  );
  
  if (validData.length === 0) return 0;
  
  return (validData.reduce((sum, item) => 
    sum + (item.sentiment_score || 0)
  , 0) / validData.length) * 100;
}

// Helper function to calculate feature score
function calculateFeatureScore(
  data: Database['public']['Tables']['response_analysis']['Row'][]
): number {
  const validData = data.filter(item => 
    item.solution_analysis !== null
  );
  
  if (validData.length === 0) return 0;
  
  // Calculate feature score based on solution_analysis
  return validData.reduce((sum, item) => {
    const analysis = typeof item.solution_analysis === 'string'
      ? JSON.parse(item.solution_analysis)
      : item.solution_analysis;
      
    // Simple scoring: count positive features
    const features = Object.values(analysis);
    const positiveFeatures = features.filter(f => 
      typeof f === 'string' && 
      ['yes', 'partial', 'planned'].includes(f.toLowerCase())
    ).length;
    
    return sum + ((positiveFeatures / features.length) * 100);
  }, 0) / validData.length;
}

function groupByField<T>(
  data: T[],
  field: keyof T
): Record<string, T[]> {
  return data.reduce((acc, item) => {
    const value = (item[field] as string) || 'Unknown';
    if (!acc[value]) {
      acc[value] = [];
    }
    acc[value].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}

function calculateWeightedMetric(
  items: Array<{ value: number; weight: number }>
): number {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  const weightedSum = items.reduce((sum, item) => sum + (item.value * item.weight), 0);
  return totalWeight > 0 ? weightedSum / totalWeight : 0;
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
      featureScore: calculateFeatureScore(items),
      totalResponses: items.length
    }
  }))
} 