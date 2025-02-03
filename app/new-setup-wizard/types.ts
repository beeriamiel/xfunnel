export type WizardStep = 'company' | 'products' | 'competitors' | 'icps' | 'personas' | 'review'

export interface Persona {
  title: string
  seniority_level: string
  department: string
}

export interface ICP {
  vertical: string
  company_size: string
  region: string
  personas: Persona[]
}

export interface Product {
  name: string
  description: string
}

export interface Competitor {
  name: string
  description: string
}

export interface CompanyInfo {
  industry: string
  number_of_employees: number
  annual_revenue: string
  markets_operating_in: string[]
}

export interface GenerationProgress {
  step: string
  progress: number
  message: string
}

export interface GeneratedData {
  companyInfo: CompanyInfo
  products: Product[]
  competitors: Competitor[]
  icps: ICP[]
}

export interface WizardState {
  currentStep: WizardStep
  companyName: string
  products: Product[]
  competitors: Competitor[]
  icps: ICP[]
  isLoading: boolean
  error: string | null
  isTransitioning: boolean
  isGenerating: boolean
  generationProgress: GenerationProgress | null
  generatedData: GeneratedData | null
}

export type WizardAction =
  | { type: 'SET_STEP'; payload: WizardStep }
  | { type: 'START_TRANSITION'; payload: boolean }
  | { type: 'SET_COMPANY_NAME'; payload: string }
  | { type: 'SET_PRODUCTS'; payload: Product[] }
  | { type: 'SET_COMPETITORS'; payload: Competitor[] }
  | { type: 'SET_ICPS'; payload: ICP[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'START_GENERATION' }
  | { type: 'UPDATE_GENERATION_PROGRESS'; payload: GenerationProgress }
  | { type: 'SET_GENERATED_DATA'; payload: GeneratedData }

export interface WizardContextType extends WizardState {
  dispatch: React.Dispatch<WizardAction>
  nextStep: () => void
  prevStep: () => void
  isStepComplete: (step: WizardStep) => boolean
} 