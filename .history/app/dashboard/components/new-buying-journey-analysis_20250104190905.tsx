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

function EngineCard({ 
  engineName, 
  rank, 
  rankList, 
  companyName, 
  className,
  queryText,
  engineResult,
  isEvaluationPhase,
  phase,
  hasData
}: EngineCardProps) {
  const showRankingContext = rankList && typeof rank === 'number' && !isEvaluationPhase && !isEarlyStage(phase);
  const solutions = showRankingContext ? rankList.split(/\d+\.\s*/).map(s => s.trim()).filter(Boolean) : [];

  const getAnswerColor = (answer: string) => {
    switch (answer) {
      case 'YES':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'NO':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getAnswerEmoji = (answer: string) => {
    switch (answer) {
      case 'YES':
        return '✨';
      case 'NO':
        return '❌';
      default:
        return '❓';
    }
  };

  const CompanyMentionIndicator = ({ 
    isMentioned, 
    hasData,
    mentionedCompanies
  }: { 
    isMentioned: boolean, 
    hasData: boolean,
    mentionedCompanies?: string[]
  }) => (
    <div className="flex flex-col items-center justify-center py-6 space-y-4">
      <div className={cn(
        "h-12 w-12 rounded-full flex items-center justify-center text-2xl",
        hasData 
          ? isMentioned 
            ? "bg-green-100 text-green-700" 
            : "bg-red-100 text-red-700"
          : "bg-gray-100 text-gray-500"
      )}>
        {hasData ? (isMentioned ? '✓' : '×') : '?'}
      </div>
      <div className={cn(
        "px-5 py-2 rounded-full border text-sm font-medium",
        hasData 
          ? isMentioned 
            ? "bg-green-100 text-green-700 border-green-200" 
            : "bg-red-100 text-red-700 border-red-200"
          : "bg-gray-100 text-gray-500 border-gray-200"
      )}>
        {hasData ? (isMentioned ? "Company Mentioned" : "Not Mentioned") : "No Data Available"}
      </div>
      {hasData && mentionedCompanies && mentionedCompanies.length > 0 && (
        <div className="w-full space-y-3">
          <div className="h-px bg-border/50 w-full" />
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground text-center font-medium">
              {mentionedCompanies.length} {mentionedCompanies.length === 1 ? 'Company' : 'Companies'} {isMentioned ? 'Also ' : ''}Detected
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {mentionedCompanies.slice(0, 3).map((company, index) => (
                <div
                  key={index}
                  className="group relative"
                >
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-b from-muted/30 to-muted/50 hover:from-muted/40 hover:to-muted/60 transition-colors rounded-full">
                    <Building2 className="h-3.5 w-3.5 text-muted-foreground/70" />
                    <span className="text-sm truncate max-w-[120px]" title={company}>
                      {company}
                    </span>
                  </div>
                </div>
              ))}
              {mentionedCompanies.length > 3 && (
                <div className="px-3 py-1.5 bg-primary/5 hover:bg-primary/10 transition-colors text-sm rounded-full font-medium text-primary">
                  +{mentionedCompanies.length - 3} more
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Card 
      className={cn(
        "p-4 h-full relative group flex flex-col",
        className
      )}
    >
      <div className="flex-1">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium">{engineName}</span>
          {!isEvaluationPhase && !isEarlyStage(phase) && hasData && (
            <div className="flex items-center gap-2">
              {engineResult?.recommended && (
                <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                  Recommended
                </span>
              )}
              <span className={cn(
                "text-sm",
                typeof rank === 'number' 
                  ? 'text-orange-500 font-medium' 
                  : 'text-muted-foreground'
              )}>
                {typeof rank === 'number' ? `#${rank}` : '-'}
              </span>
            </div>
          )}
        </div>
        
        {isEvaluationPhase ? (
          <div className="flex flex-col items-center justify-center py-6 space-y-3">
            <div className="text-3xl">
              {hasData ? getAnswerEmoji(engineResult?.solutionAnalysis?.has_feature || 'N/A') : '❓'}
            </div>
            <div className={cn(
              "px-4 py-2 rounded-full border text-sm font-medium",
              hasData 
                ? getAnswerColor(engineResult?.solutionAnalysis?.has_feature || 'N/A')
                : "bg-gray-100 text-gray-500 border-gray-200"
            )}>
              {hasData 
                ? engineResult?.solutionAnalysis?.has_feature === 'YES' 
                  ? "Yes, it does!"
                  : engineResult?.solutionAnalysis?.has_feature === 'NO' 
                    ? "No, it doesn't"
                    : "I'm not sure"
                : "No Data Available"}
            </div>
          </div>
        ) : isEarlyStage(phase) ? (
          <CompanyMentionIndicator 
            isMentioned={engineResult?.companyMentioned || false} 
            hasData={hasData}
            mentionedCompanies={engineResult?.mentioned_companies}
          />
        ) : showRankingContext ? (
          <>
            <div className="h-[1px] bg-border mb-3" />
            <div className="space-y-2">
              <span className="text-sm text-muted-foreground">Ranking Context:</span>
              <div className="text-sm text-muted-foreground space-y-1">
                {solutions.map((solution, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className={solution === companyName ? 'text-primary font-medium' : ''}>
                      {solution}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : !hasData ? (
          <div className="text-sm text-muted-foreground mt-2">
            Not currently ranked in this platform
          </div>
        ) : null}
      </div>

      {engineResult?.responseText && hasData && (
        <div className="mt-auto pt-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className="w-full text-muted-foreground hover:text-primary hover:bg-primary/5 hover:border-primary/20 transition-colors"
              >
                View Response
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{engineName} Response</DialogTitle>
              </DialogHeader>
              <div className="mt-4 space-y-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm font-medium">Query</p>
                  <p className="text-sm text-muted-foreground mt-1">{queryText}</p>
                </div>
                <div className="space-y-4 text-sm">
                  {engineResult.responseText.split(/(?:\r?\n){2,}/).map((paragraph, i) => (
                    <p key={i} className="text-muted-foreground">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </Card>
  );
} 

function QueryCard({ query, showCompanyMention }: { 
  query: Query;
  showCompanyMention: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isEvaluationPhase = query.buyerJourneyPhase === 'solution_evaluation';

  // Always show all engines in the same order
  const orderedEngines = ['perplexity', 'claude', 'gemini', 'searchgpt', 'aio'];

  // Transform the query text for display
  const displayText = transformQueryText(query.text);

  return (
    <Card className={cn(
      "overflow-hidden border-[0.5px] border-border/40 transition-all duration-200 w-full",
      isExpanded && "shadow-[0_1px_3px_rgba(0,0,0,0.05)] ring-1 ring-primary/5 border-l border-l-primary/50"
    )}>
      <div 
        className={cn(
          "px-3 py-2 flex items-center justify-between cursor-pointer transition-colors w-full",
          isExpanded ? "bg-accent/10" : "hover:bg-accent/5"
        )}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className={cn(
              "text-sm tracking-tight line-clamp-2 break-words",
              isExpanded ? "font-medium text-foreground" : "text-muted-foreground"
            )}>
              {displayText}
            </span>
            {showCompanyMention && (
              <div className={cn(
                "px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1.5",
                query.companyMentionRate >= 70 ? "bg-green-100 text-green-700" :
                query.companyMentionRate >= 30 ? "bg-orange-100 text-orange-700" :
                "bg-red-100 text-red-700"
              )}>
                {Math.round(query.companyMentionRate)}%
                <span className="text-xs">
                  {query.companyMentionRate >= 70 ? '✨' :
                   query.companyMentionRate >= 30 ? '⚡' : '⚠️'}
                </span>
              </div>
            )}
          </div>
          {isEvaluationPhase && (
            <div className="flex items-center gap-2 mt-1">
              <PhaseSolutionStats queries={[query]} />
            </div>
          )}
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn(
            "h-6 w-6 shrink-0 ml-2 transition-transform duration-200",
            isExpanded && "text-primary"
          )}
        >
          {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        </Button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 border-t">
              <div className="overflow-x-auto">
                <div className="grid grid-cols-5 gap-4 min-w-[1000px]">
                  {orderedEngines.map((engineKey) => {
                    const engineResult = query.engineResults[engineKey];
                    const hasData = engineResult && Object.keys(engineResult).length > 0;
                    return (
                      <EngineCard
                        key={engineKey}
                        engineName={engineDisplayNames[engineKey]}
                        rank={engineResult?.rank || 'n/a'}
                        rankList={engineResult?.rankList}
                        companyName={query.companyName}
                        queryText={query.text}
                        engineResult={engineResult}
                        isEvaluationPhase={isEvaluationPhase}
                        phase={query.buyerJourneyPhase}
                        hasData={hasData}
                      />
                    );
                  })}
                </div>
              </div>
              <Citations engineResults={query.engineResults} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
} 