import { TimePeriod } from "@/app/dashboard/store"
import { Database } from "@/types/supabase"

type ResponseAnalysis = Database['public']['Tables']['response_analysis']['Row']

export function getStartOfPeriod(date: Date, period: TimePeriod): Date {
  const d = new Date(date)
  if (period === 'weekly') {
    // Set to the start of the week (Sunday)
    const day = d.getDay()
    d.setDate(d.getDate() - day)
  } else {
    // Set to the start of the month
    d.setDate(1)
  }
  d.setHours(0, 0, 0, 0)
  return d
}

export function formatPeriodLabel(date: Date, period: TimePeriod): string {
  if (period === 'weekly') {
    const end = new Date(date)
    end.setDate(end.getDate() + 6)
    return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
  } else {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }
}

export function groupDataByPeriod<T extends ResponseAnalysis>(
  data: T[],
  period: TimePeriod
): Map<string, T[]> {
  const groups = new Map<string, T[]>()
  
  data.forEach(item => {
    const date = new Date(item.created_at)
    const periodStart = getStartOfPeriod(date, period)
    const key = formatPeriodLabel(periodStart, period)
    
    if (!groups.has(key)) {
      groups.set(key, [])
    }
    groups.get(key)!.push(item)
  })
  
  return groups
}

export function getDateRangeForPeriod(period: TimePeriod): { start: Date; end: Date } {
  const end = new Date()
  const start = new Date()
  
  if (period === 'weekly') {
    // Last 12 weeks
    start.setDate(start.getDate() - (12 * 7))
  } else {
    // Last 12 months
    start.setMonth(start.getMonth() - 12)
  }
  
  return { start, end }
} 