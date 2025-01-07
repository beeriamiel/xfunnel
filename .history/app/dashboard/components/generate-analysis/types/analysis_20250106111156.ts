export interface ICP {
  id: number;
  region: string;
  vertical: string;
  company_size: string;
  personas: Persona[];
}

export interface Persona {
  id: number;
  title: string;
  seniority_level: string;
  department: string;
}

export interface Query {
  id: number;
  text: string;
  icp: ICP;
  persona: Persona;
  status: 'pending' | 'analyzing' | 'complete';
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