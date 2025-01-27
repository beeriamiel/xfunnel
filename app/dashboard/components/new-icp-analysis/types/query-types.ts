// Engine mapping constants
export const engineMapping: Record<string, string> = {
  perplexity: 'perplexity',
  claude: 'claude',
  gemini: 'gemini',
  openai: 'searchgpt'
};

export const engineDisplayNames: Record<string, string> = {
  perplexity: 'Perplexity',
  claude: 'Claude',
  gemini: 'Gemini',
  searchgpt: 'SearchGPT'
};

// Phase constants
export const PHASE_ORDER = [
  'problem_exploration',
  'solution_education',
  'solution_comparison',
  'solution_evaluation',
  'final_research'
] as const;

export const PHASE_LABELS: Record<typeof PHASE_ORDER[number], string> = {
  problem_exploration: 'Problem Exploration',
  solution_education: 'Solution Education',
  solution_comparison: 'Solution Comparison',
  solution_evaluation: 'Solution Evaluation',
  final_research: 'User Feedback'
};

export const EARLY_PHASES = ['problem_exploration', 'solution_education'];
export const POSITION_PHASES = ['solution_comparison', 'final_research'];
export const EVALUATION_PHASE = 'solution_evaluation';

// Query interfaces
export interface EngineResult {
  rank: number | 'n/a';
  rankList?: string | null;
  responseText?: string;
  recommended?: boolean;
  citations?: string[];
  solutionAnalysis?: SolutionAnalysis;
  companyMentioned?: boolean;
  mentioned_companies?: string[];
}

export interface Query {
  id: number;
  text: string;
  buyerJourneyPhase: string;
  engineResults: {
    [engine: string]: EngineResult;
  };
  companyMentioned: boolean;
  companyMentionRate: number;
  companyName?: string;
}

export interface SolutionAnalysis {
  has_feature: 'YES' | 'NO' | 'N/A';
}

// Helper functions
export function isEarlyStage(phase: string): boolean {
  return EARLY_PHASES.includes(phase);
}

export function transformQueryText(text: string): string {
  const pattern = /^As\s+a\s+[^,]+\s+at\s+a\s+[^,]+\s+company\s+in\s+[^,]+,?\s+operating\s+in\s+the\s+[^,]+\s+sector,\s*/i;
  const match = text.match(pattern);
  if (!match) return text;
  const transformedText = text.slice(match[0].length).trim();
  if (transformedText.length === 0) return transformedText;
  return transformedText.charAt(0).toUpperCase() + transformedText.slice(1);
} 