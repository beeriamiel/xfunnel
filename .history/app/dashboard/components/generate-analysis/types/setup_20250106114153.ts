import type { ICP, Persona } from './analysis'

export type StepId = 'initial' | 'product' | 'companyData' | 'icps' | 'personas'

export interface StepIndicatorProps {
  currentStep: StepId
  isLoading: boolean
}

export interface CompanySetupProps {
  onComplete: (completedICPs: ICP[], completedPersonas: Persona[]) => void
  onTransitionStart: () => void
}

export interface Product {
  id: string
  name: string
  description?: string
}

export interface Competitor {
  id: string
  name: string
  description?: string
} 