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

export interface Competitor {
  id: string;
  name: string;
  website?: string;
}

export interface Query {
  id: string;
  text: string;
  icp: ICP;
  persona: Persona;
  status: 'pending' | 'completed' | 'failed';
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
  queries: Query[];
  isGeneratingQueries: boolean;
  isExpanded: boolean;
  lastAnalysisRun: string | null;
  isAnalyzing: boolean;
  hasAnalysis: boolean;
  analysisHistory: Array<{
    runDate: string;
    status: 'completed' | 'failed';
  }>;
} 