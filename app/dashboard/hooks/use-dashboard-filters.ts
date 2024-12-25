import { useQueryState } from 'nuqs'
import type { DashboardFilters } from '../types'

export function useDashboardFilters() {
  const [dateRange] = useQueryState<'day' | 'week' | 'month' | 'year'>('dateRange', {
    parse: (value: string) => {
      const validRanges = ['day', 'week', 'month', 'year'] as const
      return validRanges.includes(value as any) ? value as 'day' | 'week' | 'month' | 'year' : 'week'
    }
  })

  const [competitors] = useQueryState<string[]>('competitors', {
    parse: (value: string) => value ? value.split(',') : [],
    serialize: (value: string[]) => value.join(',')
  })

  const [engines] = useQueryState<string[]>('engines', {
    parse: (value: string) => value ? value.split(',') : [],
    serialize: (value: string[]) => value.join(',')
  })

  const [journeyStages] = useQueryState<string[]>('journeyStages', {
    parse: (value: string) => value ? value.split(',') : [],
    serialize: (value: string[]) => value.join(',')
  })

  return {
    filters: {
      dateRange: dateRange || 'week',
      competitors: competitors || [],
      engines: engines || [],
      journeyStages: journeyStages || []
    } as DashboardFilters,
    setDateRange: (value: 'day' | 'week' | 'month' | 'year') => {
      const searchParams = new URLSearchParams(window.location.search)
      searchParams.set('dateRange', value)
      window.history.pushState(null, '', `?${searchParams.toString()}`)
    },
    setCompetitors: (value: string[]) => {
      const searchParams = new URLSearchParams(window.location.search)
      searchParams.set('competitors', value.join(','))
      window.history.pushState(null, '', `?${searchParams.toString()}`)
    },
    setEngines: (value: string[]) => {
      const searchParams = new URLSearchParams(window.location.search)
      searchParams.set('engines', value.join(','))
      window.history.pushState(null, '', `?${searchParams.toString()}`)
    },
    setJourneyStages: (value: string[]) => {
      const searchParams = new URLSearchParams(window.location.search)
      searchParams.set('journeyStages', value.join(','))
      window.history.pushState(null, '', `?${searchParams.toString()}`)
    }
  }
} 