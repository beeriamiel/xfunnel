export interface Question {
  id: string;
  text: string;
  status: 'pending' | 'analyzed';
  createdAt: string;
  combinationId: string;
}

export interface QuestionFormData {
  text: string;
}

export interface ICPPersonaCombination {
  id: string;
  region: string;
  vertical: string;
  companySize: string;
  title: string;
  seniority: string;
  department: string;
  questions: Question[];
  responseCount: number;
  lastUpdated: string | null;
} 