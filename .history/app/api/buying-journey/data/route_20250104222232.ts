import { createClient } from '@/app/supabase/server'
import { NextResponse } from 'next/server'

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

    if (region) query = query.eq('geographic_region', region)
    if (vertical) query = query.eq('industry_vertical', vertical)
    if (persona) query = query.eq('buyer_persona', persona)

    const { data: currentData, error: currentError } = await query

    if (currentError) {
      return NextResponse.json(
        { error: 'Failed to fetch data' },
        { status: 500 }
      )
    }

    // Calculate metrics
    const metrics = {
      companyMentioned: currentData.filter(d => d.company_mentioned).length / currentData.length * 100 || 0,
      averagePosition: currentData.reduce((acc, d) => acc + (d.ranking_position || 0), 0) / currentData.filter(d => d.ranking_position).length || 0,
      featureScore: currentData.filter(d => d.solution_analysis?.has_feature === 'YES').length / currentData.length * 100 || 0,
      averageSentiment: currentData.reduce((acc, d) => acc + (d.sentiment_score || 0), 0) / currentData.filter(d => d.sentiment_score).length * 100 || 0
    }

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

    if (prevData?.length) {
      metrics.changeFromPrevious = {
        companyMentioned: metrics.companyMentioned - (prevData.filter(d => d.company_mentioned).length / prevData.length * 100 || 0),
        averagePosition: metrics.averagePosition - (prevData.reduce((acc, d) => acc + (d.ranking_position || 0), 0) / prevData.filter(d => d.ranking_position).length || 0),
        featureScore: metrics.featureScore - (prevData.filter(d => d.solution_analysis?.has_feature === 'YES').length / prevData.length * 100 || 0),
        averageSentiment: metrics.averageSentiment - (prevData.reduce((acc, d) => acc + (d.sentiment_score || 0), 0) / prevData.filter(d => d.sentiment_score).length * 100 || 0)
      }
    }

    // Prepare selection cards based on the current stage
    const cards = !region ? 
      // Group by region
      Object.entries(
        currentData.reduce((acc, item) => {
          const region = item.geographic_region || 'Unknown'
          if (!acc[region]) acc[region] = []
          acc[region].push(item)
          return acc
        }, {} as Record<string, typeof currentData>)
      ).map(([region, items]) => ({
        id: region,
        title: region,
        description: `${items.length} responses`,
        metrics: {
          companyMentioned: items.filter(d => d.company_mentioned).length / items.length * 100,
          averagePosition: items.reduce((acc, d) => acc + (d.ranking_position || 0), 0) / items.filter(d => d.ranking_position).length,
          featureScore: items.filter(d => d.solution_analysis?.has_feature === 'YES').length / items.length * 100,
          averageSentiment: items.reduce((acc, d) => acc + (d.sentiment_score || 0), 0) / items.filter(d => d.sentiment_score).length * 100
        }
      })) :
      !vertical ?
        // Group by vertical
        Object.entries(
          currentData.reduce((acc, item) => {
            const vertical = item.industry_vertical || 'Unknown'
            if (!acc[vertical]) acc[vertical] = []
            acc[vertical].push(item)
            return acc
          }, {} as Record<string, typeof currentData>)
        ).map(([vertical, items]) => ({
          id: vertical,
          title: vertical,
          description: `${items.length} responses`,
          metrics: {
            companyMentioned: items.filter(d => d.company_mentioned).length / items.length * 100,
            averagePosition: items.reduce((acc, d) => acc + (d.ranking_position || 0), 0) / items.filter(d => d.ranking_position).length,
            featureScore: items.filter(d => d.solution_analysis?.has_feature === 'YES').length / items.length * 100,
            averageSentiment: items.reduce((acc, d) => acc + (d.sentiment_score || 0), 0) / items.filter(d => d.sentiment_score).length * 100
          }
        })) :
        // Group by persona
        Object.entries(
          currentData.reduce((acc, item) => {
            const persona = item.buyer_persona || 'Unknown'
            if (!acc[persona]) acc[persona] = []
            acc[persona].push(item)
            return acc
          }, {} as Record<string, typeof currentData>)
        ).map(([persona, items]) => ({
          id: persona,
          title: persona,
          description: `${items.length} responses`,
          metrics: {
            companyMentioned: items.filter(d => d.company_mentioned).length / items.length * 100,
            averagePosition: items.reduce((acc, d) => acc + (d.ranking_position || 0), 0) / items.filter(d => d.ranking_position).length,
            featureScore: items.filter(d => d.solution_analysis?.has_feature === 'YES').length / items.length * 100,
            averageSentiment: items.reduce((acc, d) => acc + (d.sentiment_score || 0), 0) / items.filter(d => d.sentiment_score).length * 100
          }
        }))

    // Calculate trends
    const trends = currentData.reduce((acc, item) => {
      const date = new Date(item.created_at).toISOString().split('T')[0]
      const existing = acc.find(t => t.date === date)
      if (existing) {
        existing.responses = (existing.responses || 0) + 1
        existing.mentions = (existing.mentions || 0) + (item.company_mentioned ? 1 : 0)
        existing.sentiment = ((existing.sentiment || 0) + (item.sentiment_score || 0)) / 2
      } else {
        acc.push({
          date,
          responses: 1,
          mentions: item.company_mentioned ? 1 : 0,
          sentiment: item.sentiment_score || 0
        })
      }
      return acc
    }, [] as any[]).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

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