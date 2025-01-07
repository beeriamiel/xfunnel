import { type LucideIcon } from 'lucide-react'
import type {
  CompanyData,
  ICP,
  Persona,
  Query,
  Product,
  Competitor,
  CompletedStep,
  StepId,
  ICPPersonaCombination
} from '../types'

export interface DialogState {
  competitor: boolean;
  icp: boolean;
  persona: boolean;
  product: boolean;
}

export interface CompanySetupState {
  step: StepId;
  isLoading: boolean;
  companyName: string;
  products: Product[];
  editingProduct: Product | null;
  newProduct: Partial<Product>;
  competitors: Competitor[];
  editingCompetitor: Competitor | null;
  newCompetitor: Partial<Competitor>;
  icps: ICP[];
  personas: Persona[];
  completedSteps: CompletedStep[];
  editingStep: StepId | null;
  editingICP: ICP | null;
  newICP: Partial<ICP>;
  newPersona: Partial<Persona>;
  editingPersona: Persona | null;
  dialogOpen: DialogState;
  competitorNames: string[];
}

export interface ResponseTableState {
  combinations: ICPPersonaCombination[];
  newQuery: string;
  searchQuery: string;
  filteredCombinations: ICPPersonaCombination[];
}

export interface ResponseAnalysisState {
  icps: ICP[];
  personas: Persona[];
  isTransitioning: boolean;
  showSuccessAnimation: boolean;
}

export interface QueryGenerationState {
  selectedICP: ICP | null;
  selectedPersona: Persona | null;
  queries: Query[];
  isGenerating: boolean;
  isAnalyzing: boolean;
}

export interface AnalysisHistoryEntry {
  runDate: string;
  status: 'completed' | 'failed';
}

export interface QueryWithId {
  id: string;
  text: string;
} 