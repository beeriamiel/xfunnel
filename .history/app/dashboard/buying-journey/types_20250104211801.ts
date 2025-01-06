export type Stage = 'company' | 'region' | 'vertical' | 'persona' | 'query'

export type Phase = 'problem-exploration' | 'solution-education' | 'solution-comparison' | 'solution-evaluation' | 'user-feedback'

export interface Metrics {
  companyMentioned: number
  averagePosition: number
  featureScore: number
  averageSentiment: number
  changeFromPrevious?: {
    companyMentioned: number
    averagePosition: number
    featureScore: number
    averageSentiment: number
  }
}

export interface SelectionCard {
  id: string
  title: string
  description: string
  metrics: Metrics
  icon?: React.ComponentType<{ className?: string }>
  phase?: Phase
}

export interface ViewProps {
  metrics: Metrics
  onSelect: (id: string) => void
  isLoading?: boolean
}

export type SortOption = 'batch' | 'time'
export type TimeFrame = 'week' | 'month'

export interface ChartData {
  date: string
  [key: string]: string | number
} 