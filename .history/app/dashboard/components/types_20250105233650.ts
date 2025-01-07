import type { LucideIcon } from 'lucide-react'

export interface CompanyData {
  name: string;
  industry: string;
  mainProducts: string[];
  category: string;
  employees: string;
  revenue: string;
  markets: string[];
}

export interface ICP {
  id: string;
  region: string;
  vertical: string;
  company_size: string;
  personas: Persona[];
}

export interface Persona {
  id: string;
  title: string;
  seniority_level: string;
  department: string;
}

export interface Query {
  id: string;
  text: string;
  icp?: ICP;
  persona?: Persona;
  status: 'pending' | 'analyzing' | 'complete';
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
  setShowSuccessAnimation: React.Dispatch<React.SetStateAction<boolean>>;
  setIsTransitioning: React.Dispatch<React.SetStateAction<boolean>>;
  setHasCompletedOnboarding: (value: boolean) => void;
  setCompanyProfile: (profile: { icps: ICP[]; personas: Persona[]; products: Product[]; competitors: Competitor[] } | null) => void;
}

export interface ICPPersonaCombination {
  id: string;
  region: string;
  vertical: string;
  company_size: string;
  title: string;
  seniority_level: string;
  department: string;
  lastUpdated: string | null;
  queries: {
    id: string;
    text: string;
    status: 'pending' | 'analyzing' | 'complete';
  }[];
  isGeneratingQueries: boolean;
  isExpanded: boolean;
  hasAnalysis: boolean;
  lastAnalysisRun: string | null;
  isAnalyzing: boolean;
  analysisHistory: Array<{
    runDate: string;
    status: 'completed' | 'failed';
  }>;
}

export interface SelectableCardProps {
  isSelected: boolean;
  onClick: () => void;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  className?: string;
} 