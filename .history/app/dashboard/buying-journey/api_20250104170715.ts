import { TimeFilter } from './types'
import { startOfWeek, startOfMonth, endOfWeek, endOfMonth } from 'date-fns'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function buildTimeFilter(filter: TimeFilter) {
  if (filter.type === 'batch') {
    return { analysis_batch_id: filter.batchId }
  }

  if (!filter.timePeriod?.value) {
    return {}
  }

  const date = new Date(filter.timePeriod.value)
  const isWeek = filter.timePeriod.type === 'week'
  const start = isWeek ? startOfWeek(date) : startOfMonth(date)
  const end = isWeek ? endOfWeek(date) : endOfMonth(date)

  return {
    created_at: {
      gte: start.toISOString(),
      lte: end.toISOString(),
    },
  }
}

export async function fetchResponseAnalysis(params: {
  companyId: number
  region?: string
  vertical?: string
  persona?: string
  filter: TimeFilter
}) {
  const { companyId, region, vertical, persona, filter } = params
  const timeFilter = buildTimeFilter(filter)

  let query = supabase
    .from('response_analysis')
    .select('*')
    .eq('company_id', companyId)

  // Apply filters
  if (filter.type === 'batch') {
    query = query.eq('analysis_batch_id', filter.batchId)
  } else if (timeFilter.created_at) {
    query = query
      .gte('created_at', timeFilter.created_at.gte)
      .lte('created_at', timeFilter.created_at.lte)
  }

  if (region) {
    query = query.eq('geographic_region', region)
  }
  if (vertical) {
    query = query.eq('industry_vertical', vertical)
  }
  if (persona) {
    query = query.eq('buyer_persona', persona)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) {
    throw new Error('Failed to fetch response analysis')
  }

  return data
}

export async function fetchPreviousPeriodAnalysis(params: {
  companyId: number
  region?: string
  vertical?: string
  persona?: string
  filter: TimeFilter
}) {
  const { filter, ...rest } = params
  let previousFilter: TimeFilter

  if (filter.type === 'batch') {
    // Get previous batch based on created_at
    const { data: batches } = await supabase
      .from('response_analysis')
      .select('analysis_batch_id, created_at')
      .eq('company_id', params.companyId)
      .eq('analysis_batch_id', filter.batchId)
      .limit(1)

    if (batches?.[0]) {
      const { data: prevBatch } = await supabase
        .from('response_analysis')
        .select('analysis_batch_id')
        .eq('company_id', params.companyId)
        .lt('created_at', batches[0].created_at)
        .order('created_at', { ascending: false })
        .limit(1)

      previousFilter = {
        type: 'batch',
        batchId: prevBatch?.[0]?.analysis_batch_id || filter.batchId,
      }
    } else {
      previousFilter = filter
    }
  } else if (filter.timePeriod) {
    const currentDate = new Date(filter.timePeriod.value)
    let previousDate: Date

    if (filter.timePeriod.type === 'week') {
      previousDate = new Date(currentDate)
      previousDate.setDate(previousDate.getDate() - 7)
    } else {
      previousDate = new Date(currentDate)
      previousDate.setMonth(previousDate.getMonth() - 1)
    }

    previousFilter = {
      type: 'time',
      timePeriod: {
        type: filter.timePeriod.type,
        value: previousDate.toISOString(),
      },
    }
  } else {
    return []
  }

  return fetchResponseAnalysis({
    ...rest,
    filter: previousFilter,
  })
}

export async function fetchBatches(companyId: number) {
  const { data, error } = await supabase
    .from('response_analysis')
    .select('analysis_batch_id, created_at')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })
    .not('analysis_batch_id', 'is', null)

  if (error) {
    throw new Error('Failed to fetch batches')
  }

  // Group by batch_id and get earliest created_at
  const batchMap = new Map()
  data.forEach((row) => {
    if (!batchMap.has(row.analysis_batch_id) || 
        row.created_at < batchMap.get(row.analysis_batch_id)) {
      batchMap.set(row.analysis_batch_id, row.created_at)
    }
  })

  return Array.from(batchMap.entries()).map(([analysis_batch_id, created_at]) => ({
    analysis_batch_id,
    created_at,
  }))
} 