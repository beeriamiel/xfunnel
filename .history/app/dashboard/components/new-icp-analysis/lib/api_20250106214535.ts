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
  timePeriod: TimePeriod
): Promise<CompanyAnalysis> {
  const supabase = createClient()
  const { start, end } = getDateRangeForPeriod(timePeriod)

  // Get the raw analysis data with date range filter
  const { data: analysisData, error } = await supabase
    .from('response_analysis')
    .select('*')
    .eq('company_id', companyId)
    .gte('created_at', start.toISOString())
    .lte('created_at', end.toISOString())
    .order('created_at', { ascending: true })

  if (error) throw new Error(`Failed to fetch analysis data: ${error.message}`)
  if (!analysisData?.length) {
    throw new Error('No analysis data found for this company')
  }

  const typedData = analysisData as Database['public']['Tables']['response_analysis']['Row'][]

  // Calculate metrics using the same calculation methods as queries
  const queryAnalysis = typedData.map(item => ({
    metrics: {
      sentimentScore: calculateSentimentScore([item]),
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

  // Group data by time period
  const groupedData = groupDataByPeriod(typedData, timePeriod)
  const timelineData = Array.from(groupedData.entries()).map(([date, items]) => {
    return {
      date,
      metrics: {
        sentimentScore: calculateSentimentScore(items),
        rankingPosition: calculateRankingPosition(items),
        companyMentioned: calculateMentionedRate(items),
        featureScore: calculateFeatureScore(items),
        totalResponses: items.length
      }
    }
  })

  return {
    metrics: {
      sentimentScore: calculateSentimentScore(typedData),
      rankingPosition: calculateRankingPosition(typedData),
      companyMentioned: calculateMentionedRate(typedData),
      featureScore: calculateFeatureScore(typedData),
      totalResponses: typedData.length
    },
    timelineData
  }
}

export async function getAnalysisByRegion(
  companyId: number,
  timePeriod: TimePeriod
): Promise<RegionAnalysis[]> {
  const supabase = createClient()
  const { start, end } = getDateRangeForPeriod(timePeriod)

  // Get the raw analysis data with date range filter
  const { data: analysisData, error } = await supabase
    .from('response_analysis')
    .select('*')
    .eq('company_id', companyId)
    .gte('created_at', start.toISOString())
    .lte('created_at', end.toISOString())
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

  // Calculate metrics for each region using the same calculation methods as queries
  return Object.entries(regionGroups).map(([region, items]) => {
    const queryAnalysis = items.map(item => ({
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
      region,
      metrics: aggregateMetrics(queryAnalysis.map(q => q.metrics)),
      timelineData
    }
  })
}

export async function getAnalysisByVertical(
  companyId: number,
  region: string,
  timePeriod: TimePeriod
): Promise<VerticalAnalysis[]> {
  const supabase = createClient()
  const { start, end } = getDateRangeForPeriod(timePeriod)

  // Get the raw analysis data filtered by region and date range
  const { data: analysisData, error } = await supabase
    .from('response_analysis')
    .select('*')
    .eq('company_id', companyId)
    .eq('geographic_region', region)
    .gte('created_at', start.toISOString())
    .lte('created_at', end.toISOString())
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

  // Calculate metrics for each vertical using the same calculation methods as queries
  return Object.entries(verticalGroups).map(([vertical, items]) => {
    const queryAnalysis = items.map(item => ({
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
      vertical,
      metrics: aggregateMetrics(queryAnalysis.map(q => q.metrics)),
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
    if (item.rankingPosition > 0) {
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
  region: string,
  vertical: string,
  persona: string,
  timePeriod: TimePeriod,
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
  region: string,
  vertical: string,
  timePeriod: TimePeriod
): Promise<PersonaAnalysis[]> {
  const supabase = createClient()
  const { start, end } = getDateRangeForPeriod(timePeriod)

  // Get query analysis for each persona with date range filter
  const { data: analysisData, error } = await supabase
    .from('response_analysis')
    .select('*')
    .eq('company_id', companyId)
    .eq('geographic_region', region)
    .eq('icp_vertical', vertical)
    .gte('created_at', start.toISOString())
    .lte('created_at', end.toISOString())
    .order('created_at', { ascending: true })

  if (error) throw new Error(`Failed to fetch analysis data: ${error.message}`)
  if (!analysisData?.length) {
    throw new Error(`No analysis data found for the specified filters`)
  }

  const typedData = analysisData as Database['public']['Tables']['response_analysis']['Row'][]

  // Group by persona
  const personaGroups = typedData.reduce((acc, item) => {
    const persona = item.buyer_persona || 'Unknown'
    if (!acc[persona]) {
      acc[persona] = []
    }
    acc[persona].push(item)
    return acc
  }, {} as Record<string, Database['public']['Tables']['response_analysis']['Row'][]>)

  // Calculate metrics for each persona using the same calculation methods as queries
  return Object.entries(personaGroups).map(([persona, items]) => {
    const queryAnalysis = items.map(item => ({
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
      persona,
      metrics: aggregateMetrics(queryAnalysis.map(q => q.metrics)),
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

// Helper functions
function calculateSentimentScore(
  data: Database['public']['Tables']['response_analysis']['Row'][]
): number {
  // Filter out null/undefined values
  const validValues = data.filter(item => 
    item.sentiment_score !== null && 
    item.sentiment_score !== undefined
  );
  
  if (!validValues.length) return 0;
  
  // Calculate weighted average based on response length and context
  const weightedScores = validValues.map(item => {
    let weight = 1.0;
    
    // Add weight for responses with more context
    if (item.response_text) {
      weight *= Math.min(1.5, 1 + (item.response_text.length / 5000)); // Cap at 1.5x
    }
    
    // Add weight for responses with competitive analysis
    if (item.competitors_list && item.competitors_list.length > 0) {
      weight *= 1.2;
    }

    // Add weight for responses with solution analysis
    if (item.solution_analysis) {
      weight *= 1.1;
    }
    
    return {
      score: item.sentiment_score || 0,
      weight
    };
  });
  
  // Calculate weighted average
  const totalWeight = weightedScores.reduce((sum, item) => sum + item.weight, 0);
  const weightedSum = weightedScores.reduce((sum, item) => sum + (item.score * item.weight), 0);
  
  // Convert from -1:1 scale to 0:100 scale
  const normalizedScore = ((weightedSum / totalWeight) + 1) / 2;
  return Math.round(normalizedScore * 100);
}

function calculateRankingPosition(
  data: Database['public']['Tables']['response_analysis']['Row'][]
): number {
  // Only consider solution_comparison and final_research stages
  const validStages = ['solution_comparison', 'final_research']
  const relevantData = data.filter(item => 
    item.buying_journey_stage && 
    validStages.includes(item.buying_journey_stage)
  )
  
  if (!relevantData.length) return 0
  
  const positions = relevantData.map(item => {
    let position = 0;
    
    // First check direct ranking position
    if (item.ranking_position !== null && item.ranking_position !== undefined) {
      position = item.ranking_position;
    }
    // Then try to extract from rank_list if available
    else if (item.rank_list) {
      try {
        const rankings = parsePlatformRankings(item.rank_list);
        const companyName = item.company_name.toLowerCase();
        
        // Find the company's position in the rankings
        for (const [platform, rank] of Object.entries(rankings)) {
          if (platform.toLowerCase().includes(companyName)) {
            position = rank;
            break;
          }
        }
      } catch (e) {
        console.warn('Failed to parse rank list:', e);
      }
    }

    // Weight the position based on stage and context
    let weight = 1.0;

    // Weight final_research stage higher
    if (item.buying_journey_stage === 'final_research') {
      weight *= 1.3;
    }

    // Weight responses with competitive analysis higher
    if (item.competitors_list && item.competitors_list.length > 0) {
      weight *= 1.2;
    }

    // Weight responses with detailed analysis higher
    if (item.response_text && item.response_text.length > 1000) {
      weight *= 1.1;
    }

    return { position, weight };
  }).filter(result => result.position > 0); // Filter out invalid positions

  if (positions.length === 0) return 0;

  // Calculate weighted average
  const totalWeight = positions.reduce((sum, item) => sum + item.weight, 0);
  const weightedSum = positions.reduce((sum, item) => sum + (item.position * item.weight), 0);

  return Math.round((weightedSum / totalWeight) * 100) / 100; // Round to 2 decimal places
}

function calculateAverage(
  data: Database['public']['Tables']['response_analysis']['Row'][]
): number {
  return 0 // This function might not be needed anymore, but keeping for now
}

function calculateMentionedRate(
  data: Database['public']['Tables']['response_analysis']['Row'][]
): number {
  // Only consider problem_exploration and solution_education stages
  const validStages = ['problem_exploration', 'solution_education']
  const relevantData = data.filter(item => 
    item.buying_journey_stage && 
    validStages.includes(item.buying_journey_stage)
  )

  if (!relevantData.length) return 0

  const mentions = relevantData.map(item => {
    let weight = 1.0;
    let isMentioned = false;

    // Check direct company_mentioned flag
    if (item.company_mentioned === true) {
      isMentioned = true;
    }

    // Check mentioned_companies array
    if (item.mentioned_companies && item.mentioned_companies.length > 0) {
      const companyName = item.company_name.toLowerCase();
      if (item.mentioned_companies.some(mention => 
        mention.toLowerCase().includes(companyName) || 
        companyName.includes(mention.toLowerCase())
      )) {
        isMentioned = true;
      }
    }

    // Apply weights based on context
    if (isMentioned) {
      // Weight early stage mentions higher
      if (item.buying_journey_stage === 'problem_exploration') {
        weight *= 1.2; // Problem exploration mentions are more valuable
      }

      // Weight responses with more context higher
      if (item.response_text && item.response_text.length > 1000) {
        weight *= 1.1;
      }

      // Weight responses where company is mentioned multiple times higher
      if (item.mentioned_companies && item.mentioned_companies.length > 0) {
        const companyName = item.company_name.toLowerCase();
        const mentionCount = item.mentioned_companies.filter(mention => 
          mention.toLowerCase().includes(companyName) || 
          companyName.includes(mention.toLowerCase())
        ).length;
        if (mentionCount > 1) {
          weight *= Math.min(1.3, 1 + (mentionCount * 0.1)); // Cap at 1.3x
        }
      }

      // Weight responses with competitive context higher
      if (item.competitors_list && item.competitors_list.length > 0) {
        weight *= 1.15;
      }
    }

    return { isMentioned, weight };
  });

  if (mentions.length === 0) return 0;

  // Calculate weighted mention rate
  const totalWeight = mentions.reduce((sum, item) => sum + item.weight, 0);
  const weightedMentions = mentions.reduce((sum, item) => 
    sum + (item.isMentioned ? item.weight : 0), 0
  );

  return Math.round((weightedMentions / totalWeight) * 100);
}

function calculateFeatureScore(
  data: Database['public']['Tables']['response_analysis']['Row'][]
): number {
  // Only consider solution_evaluation stage
  const relevantData = data.filter(item => 
    item.buying_journey_stage === 'solution_evaluation' &&
    item.solution_analysis !== null
  );
  
  if (!relevantData.length) return 0;

  const featureScores = relevantData.map(item => {
    try {
      // Handle both string and JSONB formats
      const analysis = typeof item.solution_analysis === 'string' 
        ? JSON.parse(item.solution_analysis)
        : item.solution_analysis;

      if (!analysis || typeof analysis !== 'object') {
        return { score: 0, weight: 0 };
      }

      let totalFeatures = 0;
      let weightedYesCount = 0;
      let weight = 1.0;

      // Process each feature in the analysis
      for (const [feature, value] of Object.entries(analysis)) {
        // Skip if not a valid response
        if (typeof value !== 'string') continue;

        const normalizedValue = value.toLowerCase();
        totalFeatures++;

        // Weight different types of positive responses
        if (normalizedValue === 'yes') {
          weightedYesCount += 1;
        } else if (normalizedValue === 'partial' || normalizedValue === 'limited') {
          weightedYesCount += 0.5;
        } else if (normalizedValue === 'planned' || normalizedValue === 'upcoming') {
          weightedYesCount += 0.3;
        }
      }

      if (totalFeatures === 0) {
        return { score: 0, weight: 0 };
      }

      // Calculate base score
      const score = (weightedYesCount / totalFeatures) * 100;

      // Apply context-based weights
      if (item.response_text && item.response_text.length > 1000) {
        weight *= 1.1; // Detailed responses
      }

      if (item.competitors_list && item.competitors_list.length > 0) {
        weight *= 1.15; // Competitive context
      }

      // Weight based on feature coverage
      if (totalFeatures > 5) {
        weight *= Math.min(1.3, 1 + (totalFeatures * 0.05)); // More features = higher weight, capped at 1.3x
      }

      // Weight based on response confidence
      if (item.sentiment_score && item.sentiment_score > 0.5) {
        weight *= 1.1; // High confidence responses
      }

      return { score, weight };
    } catch (e) {
      console.warn('Failed to process solution analysis:', e);
      return { score: 0, weight: 0 };
    }
  });

  // Filter out invalid scores
  const validScores = featureScores.filter(item => item.weight > 0);
  
  if (validScores.length === 0) return 0;

  // Calculate weighted average
  const totalWeight = validScores.reduce((sum, item) => sum + item.weight, 0);
  const weightedSum = validScores.reduce((sum, item) => sum + (item.score * item.weight), 0);

  return Math.round(weightedSum / totalWeight);
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