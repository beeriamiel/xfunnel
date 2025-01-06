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

// Add phase constants
const EARLY_PHASES = ['problem_exploration', 'solution_education'];
const POSITION_PHASES = ['solution_comparison', 'final_research'];
const EVALUATION_PHASE = 'solution_evaluation';

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

function isEarlyStage(phase: string) {
  return EARLY_PHASES.includes(phase);
}

function transformQueryText(text: string) {
  return text.replace(/\[company\]/gi, '').trim();
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

function Citations({ engineResults }: { engineResults: Query['engineResults'] }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasCitations = Object.values(engineResults).some(result => result.citations?.length > 0);

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
                if (!result.citations?.length) return null;
                
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

function EngineCard({
  engineName,
  rank,
  rankList,
  companyName,
  queryText,
  engineResult,
  isEvaluationPhase,
  phase,
  hasData
}: {
  engineName: string;
  rank: number | 'n/a';
  rankList?: any;
  companyName: string;
  queryText: string;
  engineResult?: any;
  isEvaluationPhase: boolean;
  phase: string;
  hasData: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!hasData) {
  return (
      <div className="p-3 border rounded-lg bg-muted/30">
        <div className="text-sm font-medium text-muted-foreground mb-2">{engineName}</div>
        <div className="text-xs text-muted-foreground">No data available</div>
          </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="p-3">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-medium">{engineName}</div>
          {engineResult?.companyMentioned && (
            <div className="px-1.5 py-0.5 bg-green-50 text-green-600 text-xs rounded-full">
              Mentioned ✨
            </div>
          )}
        </div>

        {isEvaluationPhase && engineResult?.solutionAnalysis && (
          <div className="mb-3">
          <div className={cn(
              "text-xs font-medium px-2 py-1 rounded-full inline-flex items-center gap-1",
              engineResult.solutionAnalysis.has_feature === 'YES' 
                ? "bg-green-50 text-green-600"
                : engineResult.solutionAnalysis.has_feature === 'NO'
                ? "bg-red-50 text-red-600"
                : "bg-gray-50 text-gray-600"
            )}>
              {engineResult.solutionAnalysis.has_feature === 'YES' && '✓'}
              {engineResult.solutionAnalysis.has_feature === 'NO' && '✗'}
              {engineResult.solutionAnalysis.has_feature === 'UNKNOWN' && '?'}
              {engineResult.solutionAnalysis.has_feature}
          </div>
          </div>
        )}

        {POSITION_PHASES.includes(phase) && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Rank</span>
              <span className="text-xs font-medium">
                {typeof rank === 'number' ? `#${rank}` : rank}
              </span>
        </div>
            {rankList && rankList.length > 0 && (
              <div className="space-y-1">
                {rankList.slice(0, isExpanded ? undefined : 3).map((item: any, index: number) => (
                  <div
                    key={index}
                    className={cn(
                      "text-xs px-2 py-1 rounded",
                      item.name === companyName
                        ? "bg-purple-50 text-purple-600 font-medium"
                        : "text-muted-foreground"
                    )}
                  >
                    #{item.position} {item.name}
        </div>
                ))}
                {!isExpanded && rankList.length > 3 && (
                  <button
                    onClick={() => setIsExpanded(true)}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Show {rankList.length - 3} more...
                  </button>
                )}
        </div>
            )}
      </div>
        )}

        {engineResult?.responseText && (
          <div className="mt-3 pt-3 border-t">
            <div className="text-xs text-muted-foreground whitespace-pre-wrap">
              {engineResult.responseText}
      </div>
          </div>
        )}
      </div>
    </div>
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

function QueriesSection({ region, vertical, persona, queries }: { 
  region: string;
  vertical: string;
  persona: string;
  queries: Query[];
}) {
  const [expandedPhase, setExpandedPhase] = useState<string | null>(null);

  const togglePhase = (phase: string) => {
    setExpandedPhase(currentPhase => currentPhase === phase ? null : phase);
  };

  // Group queries by buying journey phase
  const groupQueriesByPhase = (queries: Query[]) => {
    return queries.reduce((acc, query) => {
      const phase = query.buyerJourneyPhase;
      if (!acc[phase]) {
        acc[phase] = [];
      }
      acc[phase].push(query);
      return acc;
    }, {} as Record<string, Query[]>);
  };

  // Sort phases according to the journey order
  const sortedPhases = (phases: Record<string, Query[]>) => {
    return PHASE_ORDER.filter(phase => phases[phase]?.length > 0);
  };

  const phases = sortedPhases(groupQueriesByPhase(queries));
  const phaseCount = phases.length;

  // Calculate total responses (all queries × their engines)
  const totalResponses = queries.reduce((total, query) => {
    return total + Object.keys(query.engineResults).length;
  }, 0);

  return (
    <div className="mt-8 space-y-6">
      <BreadcrumbPath 
        region={region}
        vertical={vertical}
        persona={persona}
        showQueries={true}
      />

      <div className="space-y-4">
        {phases.map((phase, index) => {
          const phaseQueries = queries.filter(q => q.buyerJourneyPhase === phase);
          // Count actual responses for this phase (queries × their engines)
          const phaseResponses = phaseQueries.reduce((total, query) => {
            return total + Object.keys(query.engineResults).length;
          }, 0);

          return (
            <Card key={phase} className="overflow-hidden">
              <button
                onClick={() => togglePhase(phase)}
                className="w-full flex items-center gap-4 p-3 text-left hover:bg-accent/30 transition-colors"
              >
                <div className="relative flex items-center">
                  <div className={cn(
                    "h-6 w-6 rounded-full flex items-center justify-center text-xs font-medium transition-colors duration-200",
                    expandedPhase === phase
                      ? "bg-primary text-primary-foreground"
                      : "bg-primary/20 text-primary"
                  )}>
                    {index + 1}
                  </div>
                  {index < phaseCount - 1 && (
                    <div 
                      className="absolute left-1/2 top-6 h-8 w-[2px] bg-primary/20"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <h3 className="text-sm font-semibold">
                        {PHASE_LABELS[phase as keyof typeof PHASE_LABELS]}
                      </h3>
                      <PhaseMetrics phase={phase} queries={phaseQueries} />
                    </div>
                    <div className="flex items-center gap-4">
                      <QueryCount 
                        count={phaseResponses}
                        total={totalResponses}
                      />
                      <div className="shrink-0">
                        {expandedPhase === phase ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </button>

              <AnimatePresence mode="wait">
                {expandedPhase === phase && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="p-3 pt-0 space-y-2">
                      {phaseQueries.map((query) => (
                        <QueryCard 
                          key={`${query.id}-${query.buyerJourneyPhase}`} 
                          query={query}
                          showCompanyMention={isEarlyStage(phase)}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ... existing code ... 