import { TimeFilter } from './types'
import { startOfWeek, startOfMonth, endOfWeek, endOfMonth } from 'date-fns'

function buildTimeFilterQuery(filter: TimeFilter): string {
  if (filter.type === 'batch') {
    return `analysis_batch_id = '${filter.batchId}'`
  }

  if (!filter.timePeriod?.value) {
    return ''
  }

  const date = new Date(filter.timePeriod.value)
  const isWeek = filter.timePeriod.type === 'week'
  const start = isWeek ? startOfWeek(date) : startOfMonth(date)
  const end = isWeek ? endOfWeek(date) : endOfMonth(date)

  return `created_at >= '${start.toISOString()}' AND created_at <= '${end.toISOString()}'`
}

export async function fetchResponseAnalysis(params: {
  companyId: number
  region?: string
  vertical?: string
  persona?: string
  filter: TimeFilter
}) {
  const { companyId, region, vertical, persona, filter } = params
  const timeFilter = buildTimeFilterQuery(filter)

  const conditions = [
    `company_id = ${companyId}`,
    timeFilter,
    region && `geographic_region = '${region}'`,
    vertical && `industry_vertical = '${vertical}'`,
    persona && `buyer_persona = '${persona}'`,
  ].filter(Boolean)

  const query = `
    SELECT *
    FROM response_analysis
    WHERE ${conditions.join(' AND ')}
    ORDER BY created_at DESC
  `

  // TODO: Replace with actual API call
  const response = await fetch('/api/response-analysis', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  })

  if (!response.ok) {
    throw new Error('Failed to fetch response analysis')
  }

  return response.json()
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
    // TODO: Get previous batch ID based on created_at
    previousFilter = filter
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
  const query = `
    SELECT DISTINCT
      analysis_batch_id,
      MIN(created_at) as created_at
    FROM response_analysis
    WHERE company_id = ${companyId}
    GROUP BY analysis_batch_id
    ORDER BY created_at DESC
  `

  // TODO: Replace with actual API call
  const response = await fetch('/api/batches', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  })

  if (!response.ok) {
    throw new Error('Failed to fetch batches')
  }

  return response.json()
} 