import type { StepId } from './shared'
import type { ICP, Persona } from './analysis'

export interface StepIndicatorProps {
  currentStep: StepId;
  isLoading: boolean;
}

export interface CompanySetupProps {
  onComplete: (completedICPs: ICP[], completedPersonas: Persona[]) => void;
  onTransitionStart: () => void;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
}

export interface Competitor {
  id: string;
  name: string;
} 