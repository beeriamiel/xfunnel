import type { ICP, Persona } from './analysis'
import type { Company } from './company'

export type Step = 'initial' | 'product' | 'competitors' | 'icps' | 'personas';

export interface SetupStepProps {
  step: Step;
  onStepChange: (step: Step) => void;
}

export interface CompanySetupProps {
  accountId: string;
  onCompanyCreate: (name: string) => Promise<Company>;
  onComplete: () => void;
  onTransitionStart: () => void;
}

export interface Product {
  id: string
  name: string
  description?: string
  businessModel: 'B2B' | 'B2C'
}

export interface Competitor {
  id: string
  name: string
  description?: string
}

export interface InitialFormData {
  companyName: string;
  industry?: string;
} 