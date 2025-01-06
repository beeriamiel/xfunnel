'use client'

import { Card } from "@/components/ui/card"
import { useSearchParams, useRouter } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"
import { Suspense, useState, useRef, useEffect, Fragment } from "react"
import { ChevronRight, ChevronDown, Globe, Building2, ArrowLeft, User, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { createClient } from '@/app/supabase/client';
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useDashboardStore } from '@/app/dashboard/store'

// Add engine mapping constants
const engineMapping: Record<string, string> = {
  perplexity: 'perplexity',
  claude: 'claude',
  gemini: 'gemini',
  openai: 'searchgpt',
  google_search: 'aio'
};

const reverseEngineMapping: Record<string, string> = {
  perplexity: 'perplexity',
  claude: 'claude',
  gemini: 'gemini',
  searchgpt: 'openai',
  aio: 'google_search'
};

const engineDisplayNames: Record<string, string> = {
  perplexity: 'Perplexity',
  claude: 'Claude',
  gemini: 'Gemini',
  searchgpt: 'SearchGPT',
  aio: 'AIO'
};

// Add phase constants
const EARLY_PHASES = ['problem_exploration', 'solution_education'];
const POSITION_PHASES = ['solution_comparison', 'final_research'];
const EVALUATION_PHASE = 'solution_evaluation';

// Add phase order constants
const PHASE_ORDER = [
  'problem_exploration',
  'solution_education',
  'solution_comparison',
  'solution_evaluation',
  'final_research'
] as const;

const PHASE_LABELS: Record<typeof PHASE_ORDER[number], string> = {
  problem_exploration: 'Problem Exploration',
  solution_education: 'Solution Education',
  solution_comparison: 'Solution Comparison',
  solution_evaluation: 'Solution Evaluation',
  final_research: 'User Feedback'
};

// Helper functions
export function standardizeRegionName(region: string): string {
  const standardizedRegion = region.toLowerCase().trim();
  switch (standardizedRegion) {
    case 'north_america':
    case 'na':
      return 'North America';
    case 'latam':
    case 'latin_america':
      return 'LATAM';
    case 'emea':
      return 'EMEA';
    case 'europe':
      return 'Europe';
    default:
      return region;
  }
}

export function isEarlyStage(phase: string) {
  return EARLY_PHASES.includes(phase);
}

export function transformQueryText(text: string) {
  return text.replace(/\[company\]/gi, '').trim();
}

// Add interfaces
interface ResponseAnalysis {
  sentiment_score: number | null;
  ranking_position: number | null;
  company_mentioned: boolean | null;
  solution_analysis: any;
  buyer_persona: string | null;
  query_id: number | null;
  buying_journey_stage: string | null;
  answer_engine: string | null;
  rank_list?: any;
  response_text?: string;
  citations_parsed?: { urls: string[] } | null;
  recommended?: boolean;
  mentioned_companies?: string[] | null;
}

interface Query {
  id: number | string;
  text: string;
  buyerJourneyPhase: string;
  engineResults: Record<string, {
    rank: number | 'n/a';
    rankList?: any;
    responseText?: string;
    recommended?: boolean;
    citations?: string[];
    solutionAnalysis?: {
      has_feature: 'YES' | 'NO' | 'UNKNOWN';
    };
    companyMentioned: boolean;
    mentioned_companies?: string[];
  }>;
  companyMentioned: boolean;
  companyMentionRate: number;
  companyName: string;
}

interface RankingContext {
  position: number;
  name: string;
}

interface EngineMetrics {
  rank: number | 'n/a';
  rankingContext?: RankingContext[];
  solutionAnalysis?: {
    has_feature: 'YES' | 'NO' | 'UNKNOWN';
  };
}

interface Props {
  companyId: number;
  currentBatchId?: string;
}

interface QueryCountProps {
  count: number;
  total?: number;
  className?: string;
}

interface EngineCardProps {
  engineName: string;
  rank: number | 'n/a';
  rankList?: string | null;
  companyName?: string;
  className?: string;
  queryText: string;
  engineResult: Query['engineResults'][string] & {
    mentioned_companies?: string[];
  };
  isEvaluationPhase: boolean;
  phase: string;
  hasData: boolean;
}

export const QueryCount = ({ count, total, className }: QueryCountProps) => {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      <div className="px-2 py-0.5 bg-primary/10 rounded-full flex items-center gap-1.5">
        <span className="text-xs font-medium">{count}</span>
        {total && (
          <>
            <span className="text-xs text-muted-foreground">/</span>
            <span className="text-xs text-muted-foreground">{total}</span>
          </>
        )}
        <span className="text-xs text-muted-foreground">queries</span>
      </div>
      {total && (
        <div className="h-1.5 w-32 bg-primary/10 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${(count / total) * 100}%` }}
          />
        </div>
      )}
    </div>
  );
}; 