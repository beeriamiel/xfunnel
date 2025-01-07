import type { ICP, Persona } from './analysis'

export interface CompletedStep {
  type: 'company' | 'product' | 'data' | 'icps' | 'personas';
  title: string;
  summary: string;
}

export type StepId = 'initial' | 'product' | 'companyData' | 'icps' | 'personas' | 'complete'

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