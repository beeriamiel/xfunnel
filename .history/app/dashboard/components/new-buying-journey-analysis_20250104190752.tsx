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

function BreadcrumbPath({ 
  region, 
  vertical, 
  persona, 
  showQueries 
}: { 
  region?: string;
  vertical?: string;
  persona?: string;
  showQueries?: boolean;
}) {
  const parts = [
    { text: region ? standardizeRegionName(region) : undefined, icon: Globe },
    { text: vertical, icon: Building2 },
    { text: persona, icon: User },
    { text: showQueries ? 'Queries' : null, icon: Search }
  ].filter(part => part.text);
  
  // Calculate width based on number of items (icons + lines)
  const itemWidth = 32; // 8rem for each icon
  const lineWidth = 16; // 4rem for each connecting line
  const totalWidth = (parts.length * itemWidth) + ((parts.length - 1) * lineWidth);
  
  return (
    <div className="flex items-center">
      <div 
        className="flex items-center bg-accent/5 rounded-lg"
        style={{ width: `${totalWidth}px` }}
      >
        {parts.map((part, index) => {
          if (!part.text) return null;
          const Icon = part.icon;
          return (
            <Fragment key={part.text}>
              <div 
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-md",
                  index === parts.length - 1 ? "bg-background shadow-sm" : "",
                  "group relative"
                )}
              >
                <Icon className="h-4 w-4 text-muted-foreground" />
                <span className="absolute left-1/2 -translate-x-1/2 -bottom-6 opacity-0 group-hover:opacity-100 transition-opacity bg-popover px-2 py-1 rounded text-[10px] whitespace-nowrap shadow-sm z-10">
                  {part.text}
                </span>
              </div>
              {index < parts.length - 1 && (
                <div className="w-4 h-[1px] bg-muted-foreground/10" />
              )}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
} 

function Citations({ engineResults }: { engineResults: Query['engineResults'] }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasCitations = Object.values(engineResults).some(result => 
    result?.citations && result.citations.length > 0
  );

  if (!hasCitations) return null;

  return (
    <div className="mt-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <span>View Citations</span>
        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-4 space-y-4">
              {Object.entries(engineResults).map(([engine, result]) => {
                if (!result?.citations?.length) return null;
                
                return (
                  <div key={engine} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {engineDisplayNames[engine]}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({result.citations.length})
                      </span>
                    </div>
                    <div className="space-y-1.5 pl-4">
                      {result.citations.map((citation, index) => (
                        <a
                          key={index}
                          href={citation}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-sm text-blue-500 hover:text-blue-600 hover:underline break-all max-w-full"
                        >
                          {citation}
                        </a>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 

function PhaseSolutionStats({ queries }: { queries: Query[] }) {
  const counts = queries.reduce(
    (acc, query) => {
      let hasValidResponse = false;
      Object.values(query.engineResults).forEach(result => {
        if (result?.solutionAnalysis?.has_feature) {
          hasValidResponse = true;
          const response = result.solutionAnalysis.has_feature;
          if (response === 'YES') acc.yes++;
          else if (response === 'NO') acc.no++;
          else acc.unknown++;
        }
      });
      // Only count queries that had at least one valid response
      if (!hasValidResponse) {
        acc.unknown++;
      }
      return acc;
    },
    { yes: 0, no: 0, unknown: 0 }
  );

  const total = counts.yes + counts.no + counts.unknown;
  if (total === 0) return null;

  return (
    <div className="flex items-center gap-4 text-xs">
      <div className="flex items-center gap-2">
        <span className="text-green-600 font-medium">
          Yes {((counts.yes / total) * 100).toFixed(0)}%
        </span>
        <span className="text-red-600 font-medium">
          No {((counts.no / total) * 100).toFixed(0)}%
        </span>
        <span className="text-gray-500 font-medium">
          Unknown {((counts.unknown / total) * 100).toFixed(0)}%
        </span>
      </div>
    </div>
  );
}

function PhaseMetrics({ phase, queries }: { phase: string; queries: Query[] }) {
  if (!queries.length) return null;

  // Helper to calculate company mention percentage
  const calculateMentionPercentage = () => {
    // Use the average of companyMentionRate across queries
    const totalRate = queries.reduce((sum, query) => sum + query.companyMentionRate, 0);
    return totalRate / queries.length;
  };

  // Helper to calculate average ranking
  const calculateAverageRanking = () => {
    const validRankings = queries.flatMap(query => 
      Object.values(query.engineResults)
        .map(result => result.rank)
        .filter((rank): rank is number => typeof rank === 'number' && rank > 0)
    );

    if (!validRankings.length) return null;
    return validRankings.reduce((sum, rank) => sum + rank, 0) / validRankings.length;
  };

  // Helper to get status indicator
  const getStatusIndicator = (value: number, type: 'mention' | 'rank' | 'feature') => {
    switch (type) {
      case 'mention':
        if (value >= 40) return { icon: '✨', color: 'text-green-600' };
        if (value >= 15) return { icon: '⚡', color: 'text-orange-500' };
        return { icon: '⚠️', color: 'text-red-500' };
      case 'rank':
        if (value <= 3) return { icon: '🏆', color: 'text-amber-500' };
        if (value <= 7) return { icon: '🥈', color: 'text-zinc-400' };
        return { icon: '🥉', color: 'text-orange-400' };
      case 'feature':
        if (value >= 70) return { icon: '⭐⭐⭐', color: 'text-green-600' };
        if (value >= 40) return { icon: '⭐⭐', color: 'text-orange-500' };
        return { icon: '⭐', color: 'text-red-500' };
      default:
        return { icon: '', color: '' };
    }
  };

  switch (phase) {
    case 'problem_exploration':
    case 'solution_education': {
      const mentionPercentage = calculateMentionPercentage();
      const status = getStatusIndicator(mentionPercentage, 'mention');
      
      return (
        <div className="flex items-center gap-2 text-xs">
          <div className={cn(
            "flex items-center gap-1.5 px-2 py-0.5 rounded-full",
            "bg-background border border-border/50"
          )}>
            <span className="text-muted-foreground">Company Mentioned</span>
            <span className={status.color}>{Math.round(mentionPercentage)}%</span>
            <span className="ml-1">{status.icon}</span>
          </div>
        </div>
      );
    }

    case 'solution_comparison':
    case 'final_research': {
      const avgRanking = calculateAverageRanking();
      if (!avgRanking) return null;
      const status = getStatusIndicator(avgRanking, 'rank');

      return (
        <div className="flex items-center gap-2 text-xs">
          <div className={cn(
            "flex items-center gap-1.5 px-2 py-0.5 rounded-full",
            "bg-background border border-border/50"
          )}>
            <span className="text-muted-foreground">Avg Rank</span>
            <span className={status.color}>#{avgRanking.toFixed(1)}</span>
            <span className="ml-1">{status.icon}</span>
          </div>
        </div>
      );
    }

    case 'solution_evaluation': {
      const featureAnalysis = queries.reduce((acc, query) => {
        let hasValidResponse = false;
        Object.values(query.engineResults).forEach(result => {
          if (result?.solutionAnalysis?.has_feature) {
            hasValidResponse = true;
            const response = result.solutionAnalysis.has_feature;
            if (response === 'YES') acc.yes++;
            else if (response === 'NO') acc.no++;
            else acc.unknown++;
          }
        });
        if (!hasValidResponse) acc.unknown++;
        return acc;
      }, { yes: 0, no: 0, unknown: 0 });

      const total = featureAnalysis.yes + featureAnalysis.no + featureAnalysis.unknown;
      const featurePercentage = (featureAnalysis.yes / total) * 100;
      const status = getStatusIndicator(featurePercentage, 'feature');

      return (
        <div className="flex items-center gap-2 text-xs">
          <div className={cn(
            "flex items-center gap-1.5 px-2 py-0.5 rounded-full",
            "bg-background border border-border/50",
            "group relative"
          )}>
            <span className="text-muted-foreground">Features Present</span>
            <span className={status.color}>{Math.round(featurePercentage)}%</span>
            <span className="ml-1">{status.icon}</span>
            
            {/* Tooltip */}
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 
                          opacity-0 group-hover:opacity-100 transition-opacity
                          bg-popover text-popover-foreground rounded-md shadow-md
                          p-2 text-xs whitespace-nowrap">
              <div className="text-green-600">✓ Present: {Math.round(featurePercentage)}%</div>
              <div className="text-red-600">✗ Missing: {Math.round((featureAnalysis.no / total) * 100)}%</div>
              <div className="text-muted-foreground">? Unknown: {Math.round((featureAnalysis.unknown / total) * 100)}%</div>
            </div>
          </div>
        </div>
      );
    }

    default:
      return null;
  }
} 