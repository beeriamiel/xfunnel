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

// Remove external imports and keep all interfaces and components in this file
interface Props {
  companyId: number;
  currentBatchId?: string;
}

interface ResponseAnalysis {
  sentiment_score: number;
  ranking_position: number | null;
  company_mentioned: boolean;
  solution_analysis: any;
  buyer_persona: string;
  query_id: number;
  buying_journey_stage: string | null;
  answer_engine: string;
  rank_list: string | null;
  response_text: string | null;
  citations_parsed: { urls: string[] } | null;
  recommended?: boolean;
  mentioned_companies?: string[];
}

interface Metrics {
  avgSentiment: number
  avgPosition: number | null
  companyMentioned?: number
  featureScore?: number
  totalQueries?: number
}

interface Competitor {
  name: string
  percentage: number
}

interface Region {
  name: string
  metrics: Metrics
  competitors?: Competitor[]
}

interface Vertical {
  name: string
  metrics: Metrics
  icon?: string
  competitorCount?: number
  totalQueries?: number
}

interface Persona {
  id: number
  title: string
  seniorityLevel: string
  department: string
  metrics: Metrics
  queries: Query[]
}

interface Query {
  id: number;
  text: string;
  buyerJourneyPhase: string;
  engineResults: {
    [engine: string]: {
      rank: number | 'n/a';
      rankList?: string | null;
      responseText?: string;
      recommended?: boolean;
      citations?: string[];
      solutionAnalysis?: SolutionAnalysis;
      companyMentioned?: boolean;
      mentioned_companies?: string[];
    }
  };
  companyMentioned: boolean;
  companyMentionRate: number;
  companyName?: string;
}

interface RegionAnalytics {
  geographic_region: string;
  total_queries: number;
  avg_sentiment: number;
  avg_position: number | null;
  mention_percentage: number;
  feature_score: number;
  engines: string[];
}

interface VerticalAnalytics {
  icp_vertical: string; // Changed from industry_vertical
  total_queries: number;
  avg_sentiment: number;
  avg_position: number | null;
  mention_percentage: number;
  feature_score: number;
}

interface RankingContext {
  position: number;
  name: string;
}

interface EngineMetrics {
  rank: number | 'n/a';
  rankingContext?: RankingContext[];
  solutionAnalysis?: SolutionAnalysis;
}

// Add engine mapping constants at the top with other interfaces
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

// Add phase constants at the top level
const EARLY_PHASES = ['problem_exploration', 'solution_education'];
const POSITION_PHASES = ['solution_comparison', 'final_research'];
const EVALUATION_PHASE = 'solution_evaluation';

// Add isEarlyStage function
const isEarlyStage = (phase: string) => EARLY_PHASES.includes(phase);

// Add type guard function
function isValidPhase(phase: string | null): phase is string {
  return typeof phase === 'string' && EARLY_PHASES.includes(phase);
}

function isValidString(value: string | null): value is string {
  return typeof value === 'string';
}

function isValidDate(value: string | null): value is string {
  return typeof value === 'string' && !isNaN(Date.parse(value));
}

function formatMetricValue(label: string, value: number | null | undefined): string {
  if (value === null || value === undefined) return 'N/A';
  
  switch (label) {
    case 'Average Position':
      return value === 0 ? 'N/A' : `${value.toFixed(1)}`;
    case 'Average Sentiment':
    case 'Company Mentioned':
    case 'Feature Score':
      return `${Math.round(value)}%`;
    default:
      return `${Math.round(value)}%`;
  }
}

interface MetricStatus {
  color: 'red' | 'yellow' | 'green';
  icon: '🔴' | '🟡' | '🟢';
}

function getMetricStatus(value: number | null, metricType: 'sentiment' | 'position' | 'mentions' | 'features'): MetricStatus {
  if (value === null) return { color: 'red', icon: '🔴' };
  
  switch (metricType) {
    case 'mentions':
      return value >= 10 ? { color: 'green', icon: '🟢' } :
             value >= 5 ? { color: 'yellow', icon: '🟡' } :
             { color: 'red', icon: '🔴' };
    case 'position':
      return value < 3 ? { color: 'green', icon: '🟢' } :
             value <= 5 ? { color: 'yellow', icon: '🟡' } :
             { color: 'red', icon: '🔴' };
    case 'features':
      return value >= 60 ? { color: 'green', icon: '🟢' } :
             value >= 40 ? { color: 'yellow', icon: '🟡' } :
             { color: 'red', icon: '🔴' };
    case 'sentiment':
      return value >= 50 ? { color: 'green', icon: '🟢' } :
             value >= 30 ? { color: 'yellow', icon: '🟡' } :
             { color: 'red', icon: '🔴' };
  }
}

// Update MetricItem for cards
function MetricItem({ 
  label, 
  value, 
  change, 
  metricType 
}: { 
  label: string;
  value: number | null | undefined;
  change?: string;
  metricType?: 'sentiment' | 'position' | 'mentions' | 'features';
}) {
  // Convert undefined to null for consistent handling
  const normalizedValue = value === undefined ? null : value;
  const formattedValue = formatMetricValue(label, normalizedValue);
  
  // Only show status indicators for card metrics (when metricType is provided)
  const status = metricType ? getMetricStatus(normalizedValue, metricType) : null;
  
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">{formattedValue}</span>
        {status && (
          <span className="text-sm" title={`Status: ${status.color}`}>
            {status.icon}
          </span>
        )}
        {/* Only show change if no metricType (top-level metrics) */}
        {!metricType && change && (
          <span className={`text-xs ${change.includes('+') ? 'text-green-600' : 'text-red-600'}`}>
            {change}
          </span>
        )}
      </div>
    </div>
  );
}

const cardStyles = {
  base: "p-4 hover:bg-accent/10 cursor-pointer transition-all duration-200 border-[0.5px] border-border/40",
  expanded: "bg-accent/10 ring-1 ring-primary/5 shadow-[0_1px_3px_rgba(0,0,0,0.05)]",
  selected: "shadow-[0_0_15px_rgba(147,51,234,0.15)] border-purple-500/30 bg-purple-50/30",
  hover: "hover:bg-accent/5",
  header: "flex items-start gap-3 mb-3",
  iconWrapper: "p-2 rounded-lg shrink-0 mt-0.5",
  title: "text-base font-medium line-clamp-2",
  subtitle: "text-sm text-muted-foreground mt-0.5 line-clamp-1",
  metrics: "space-y-1 mt-4",
  progress: "border-t border-border/40 pt-3"
};

interface QueryCountProps {
  count: number;
  total?: number;
  className?: string;
}

const QueryCount = ({ count, total, className }: QueryCountProps) => {
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

function RegionOverview({ region, metrics, competitors }: { 
  region: string
  metrics: Metrics
  competitors?: Competitor[]
}) {
  // Use standardized region name for display
  const displayRegion = standardizeRegionName(region);

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Globe className="h-6 w-6 text-blue-500" />
        <div>
          <h2 className="text-xl font-semibold">{displayRegion}</h2>
          <p className="text-sm text-muted-foreground">Regional Overview</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <MetricItem 
            label="Average Sentiment" 
            value={metrics.avgSentiment * 100}
            change="+18%"
          />
          <MetricItem 
            label="Average Position" 
            value={metrics.avgPosition}
            change="+1.2"
          />
          <MetricItem 
            label="Company Mentioned" 
            value={metrics.companyMentioned}
            change="+15%"
          />
          <MetricItem 
            label="Feature Score" 
            value={metrics.featureScore}
            change="+20%"
          />
        </div>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Top Competitors (ranked by % mentioned)</h3>
          <div className="space-y-3">
            {(competitors || [
              { name: "Redgate", percentage: 32 },
              { name: "Liquibase", percentage: 28 },
              { name: "Flyway", percentage: 24 }
            ]).map((competitor, index) => (
              <div key={competitor.name} className="flex items-center justify-between">
                <span className="text-sm">#{index + 1} {competitor.name}</span>
                <span className="text-blue-500">{competitor.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}

function RegionCard({ 
  region, 
  metrics,
  isExpanded,
  onClick,
  totalRegionQueries,
  isSelected 
}: { 
  region: string
  metrics: Metrics
  isExpanded: boolean
  onClick: (region: string) => void
  totalRegionQueries: number
  isSelected: boolean
}) {
  // Get theme color based on standardized region name
  const getThemeColor = (region: string) => {
    const standardizedRegion = standardizeRegionName(region);
    switch (standardizedRegion) {
      case 'North America':
        return 'bg-purple-100/80';
      case 'LATAM':
        return 'bg-blue-100/80';
      case 'EMEA':
        return 'bg-emerald-100/80';
      case 'Europe':
        return 'bg-amber-100/80';
      default:
        return 'bg-blue-100/80';
    }
  };

  // Use standardized region name only for display
  const displayRegion = standardizeRegionName(region);

  return (
    <Card 
      className={cn(
        cardStyles.base,
        isExpanded && cardStyles.expanded,
        isSelected && cardStyles.selected,
        !isExpanded && !isSelected && cardStyles.hover
      )}
      onClick={() => onClick(region)}
    >
      <div className="space-y-3">
        <div className={cardStyles.header}>
          <div className={`${cardStyles.iconWrapper} bg-blue-50`}>
            <Globe className="h-5 w-5 text-blue-500" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className={cardStyles.title}>{displayRegion}</h3>
            <p className={cardStyles.subtitle}>Regional Overview</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className={cn(
            "px-2 py-0.5 rounded-full flex items-center gap-1.5",
            getThemeColor(region)
          )}>
            <span className="text-xs font-medium">{metrics.totalQueries || 0}</span>
            <span className="text-xs text-muted-foreground">/</span>
            <span className="text-xs text-muted-foreground">{totalRegionQueries}</span>
            <span className="text-xs text-muted-foreground">queries</span>
          </div>
          <div className="h-1.5 w-32 bg-primary/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${((metrics.totalQueries || 0) / totalRegionQueries) * 100}%` }}
            />
          </div>
        </div>

        <div className={cardStyles.metrics}>
          <MetricItem 
            label="Company Mentioned" 
            value={metrics.companyMentioned}
            metricType="mentions"
          />
          <MetricItem 
            label="Average Position" 
            value={metrics.avgPosition}
            metricType="position"
          />
          <MetricItem 
            label="Feature Score" 
            value={metrics.featureScore}
            metricType="features"
          />
          <MetricItem 
            label="Average Sentiment" 
            value={metrics.avgSentiment * 100}
            metricType="sentiment"
          />
        </div>

        <div className="flex items-center text-sm text-muted-foreground hover:text-foreground">
          <span>View Details</span>
          <ChevronRight className="h-4 w-4 ml-1" />
        </div>
      </div>
    </Card>
  )
}

function VerticalCard({ 
  vertical, 
  isExpanded,
  onClick,
  totalRegionQueries,
  isSelected
}: { 
  vertical: Vertical
  isExpanded: boolean
  onClick: () => void
  totalRegionQueries?: number
  isSelected: boolean
}) {
  return (
    <Card 
      className={cn(
        cardStyles.base,
        isExpanded && cardStyles.expanded,
        isSelected && cardStyles.selected,
        !isExpanded && !isSelected && cardStyles.hover
      )}
      onClick={onClick}
    >
      <div className="space-y-3">
        <div className={cardStyles.header}>
          <div className={`${cardStyles.iconWrapper} bg-violet-50`}>
            <Building2 className="h-5 w-5 text-violet-500" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className={cardStyles.title}>{vertical.name}</h3>
            <p className={cardStyles.subtitle}>Industry Analysis</p>
          </div>
        </div>

        <div className={cardStyles.progress}>
          <QueryCount 
            count={vertical.metrics.totalQueries || 0} 
            total={totalRegionQueries}
            className="w-full"
          />
        </div>

        <div className={cardStyles.metrics}>
          <MetricItem 
            label="Company Mentioned" 
            value={vertical.metrics.companyMentioned}
            metricType="mentions"
          />
          <MetricItem 
            label="Average Position" 
            value={vertical.metrics.avgPosition}
            metricType="position"
          />
          <MetricItem 
            label="Feature Score" 
            value={vertical.metrics.featureScore}
            metricType="features"
          />
          <MetricItem 
            label="Average Sentiment" 
            value={vertical.metrics.avgSentiment * 100}
            metricType="sentiment"
          />
        </div>

        <div className="flex items-center text-sm text-muted-foreground hover:text-foreground">
          <span>View Buyer Personas</span>
          <ChevronRight className="h-4 w-4 ml-1" />
        </div>
      </div>
    </Card>
  )
}

// Add these constants at the top level
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

// Add this utility function before the QueryCard component
function transformQueryText(text: string): string {
  // Updated pattern to handle comma after region and other variations
  const pattern = /^As\s+a\s+[^,]+\s+at\s+a\s+[^,]+\s+company\s+in\s+[^,]+,?\s+operating\s+in\s+the\s+[^,]+\s+sector,\s*/i;
  
  // If the pattern is found, return everything after it, otherwise return the original text
  const match = text.match(pattern);
  if (!match) return text;
  
  // Get the text after the pattern and trim any whitespace
  const transformedText = text.slice(match[0].length).trim();
  
  // Capitalize the first letter if the string is not empty
  if (transformedText.length === 0) return transformedText;
  return transformedText.charAt(0).toUpperCase() + transformedText.slice(1);
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

function PersonasSection({ 
  region, 
  vertical, 
  companyId,
  totalVerticalQueries,
  currentSegment 
}: { 
  region: string, 
  vertical: string, 
  companyId: number,
  totalVerticalQueries?: number,
  currentSegment: TimeSegment | null
}) {
  const [expandedPersona, setExpandedPersona] = useState<string | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const { data: personaData, isLoading, error } = usePersonaAnalytics(companyId, vertical, region, currentSegment);

  const handlePersonaClick = (personaName: string) => {
    setExpandedPersona(expandedPersona === personaName ? null : personaName);
    if (expandedPersona !== personaName && sectionRef.current) {
      setTimeout(() => {
        const element = sectionRef.current;
        if (!element) return;
        
        const yOffset = -150;
        const elementRect = element.getBoundingClientRect();
        const absoluteY = elementRect.top + window.pageYOffset + yOffset;
        
        window.scrollTo({ top: absoluteY, behavior: 'smooth' });
      }, 300);
    }
  };

  return (
    <div className="mt-8 space-y-6">
      <BreadcrumbPath region={region} vertical={vertical} />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {personaData.map((persona) => (
          <PersonaCard
            key={persona.buyer_persona}
            persona={persona}
            isExpanded={expandedPersona === persona.buyer_persona}
            onClick={() => handlePersonaClick(persona.buyer_persona)}
            totalVerticalQueries={totalVerticalQueries}
            isSelected={expandedPersona === persona.buyer_persona}
          />
        ))}
      </div>

      <div ref={sectionRef}>
        <AnimatePresence mode="wait">
          {expandedPersona && (
            <motion.div
              key={expandedPersona}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <QueriesSection 
                region={region}
                vertical={vertical}
                persona={expandedPersona}
                queries={personaData.find(p => p.buyer_persona === expandedPersona)?.queries || []}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Add at the top with other constants
const REGION_MAPPING: Record<string, string> = {
  // North America variations
  'north_america': 'North America',
  'northamerica': 'North America',
  'na': 'North America',
  'n_america': 'North America',
  'north america': 'North America',
  
  // Europe variations
  'europe': 'Europe',
  'eu': 'Europe',
  'eur': 'Europe',
  
  // LATAM variations
  'latam': 'LATAM',
  'latin_america': 'LATAM',
  'latinamerica': 'LATAM',
  'latin america': 'LATAM',
  'la': 'LATAM',
  
  // EMEA variations
  'emea': 'EMEA',
  'europe_middle_east_africa': 'EMEA',
  'europe middle east africa': 'EMEA',
  'europe_me_africa': 'EMEA'
};

function standardizeRegionName(region: string): string {
  const normalizedRegion = region.toLowerCase().trim();
  return REGION_MAPPING[normalizedRegion] || region;
}

function useRegionAnalytics(companyId: number, timeSegment: TimeSegment | null) {
  const [data, setData] = useState<RegionAnalytics[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRegionData() {
      if (!companyId || !timeSegment) {
        setError('Company ID and time segment are required');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        let query = createClient()
          .from('response_analysis')
          .select(`
            geographic_region,
            sentiment_score,
            ranking_position,
            company_mentioned,
            solution_analysis,
            answer_engine,
            query_id,
            buying_journey_stage
          `)
          .eq('company_id', companyId)
          .not('geographic_region', 'is', null);

        // Apply appropriate time-based filtering
        if (timeSegment.type === 'BATCH') {
          query = query.eq('analysis_batch_id', timeSegment.id);
        } else {
          query = query
            .gte('created_at', timeSegment.startDate)
            .lte('created_at', timeSegment.endDate);
        }

        const { data: rawData, error: supabaseError } = await query;

        if (supabaseError) throw supabaseError;

        // Process the data to group by region
        const processedData = (rawData || []).reduce((acc: { [key: string]: any }, curr) => {
          // Keep the original region name in the data
          const region = curr.geographic_region || 'unknown';
          
          if (!acc[region]) {
            acc[region] = {
              geographic_region: region, // Keep original format
              sentiment_scores: [],
              ranking_positions: [],
              query_mentions: new Map(),
              early_stage_queries: new Set(),
              feature_yes_count: 0,
              feature_total_count: 0,
              total_count: 0,
              engines: new Set<string>()
            };
          }

          // Always process sentiment
          if (curr.sentiment_score !== null) {
            acc[region].sentiment_scores.push(curr.sentiment_score);
          }

          const phase = curr.buying_journey_stage || 'unknown';
          if (isValidPhase(phase)) {
            // Add query to early stage set
            const queryId = curr.query_id;
            if (queryId !== null) {
              acc[region].early_stage_queries.add(queryId);
              
              // Update query mentions tracking
              const queryIdStr = queryId.toString();
              if (!acc[region].query_mentions.has(queryIdStr)) {
                acc[region].query_mentions.set(queryIdStr, {
                  total_engines: 0,
                  engines_with_mention: 0
                });
              }
              
              const queryStats = acc[region].query_mentions.get(queryIdStr);
              if (queryStats) {
                queryStats.total_engines++;
                if (curr.company_mentioned) {
                  queryStats.engines_with_mention++;
                }
              }
            }
          }
          
          if (POSITION_PHASES.includes(phase)) {
            if (curr.ranking_position && curr.ranking_position > 0) {
              acc[region].ranking_positions.push(curr.ranking_position);
            }
          }
          
          if (phase === EVALUATION_PHASE && curr.solution_analysis) {
            try {
              const analysis = typeof curr.solution_analysis === 'string'
                ? JSON.parse(curr.solution_analysis)
                : curr.solution_analysis;
              
              acc[region].feature_total_count++;
              if (analysis.has_feature === 'YES') {
                acc[region].feature_yes_count++;
              }
            } catch (e) {
              console.warn('Failed to parse solution analysis:', e);
            }
          }
          
          acc[region].total_count++;
          if (curr.answer_engine) acc[region].engines.add(curr.answer_engine);

          return acc;
        }, {});

        // Convert the processed data to final format
        const finalData: RegionAnalytics[] = Object.entries(processedData).map(([region, data]: [string, any]) => {
          // Calculate company mention percentage based on per-query rates
          let totalMentionRate = 0;
          let queryCount = 0;
          
          data.query_mentions.forEach((stats: { total_engines: number; engines_with_mention: number }) => {
            const queryMentionRate = stats.engines_with_mention / stats.total_engines;
            totalMentionRate += queryMentionRate;
            queryCount++;
          });

          const mentionPercentage = queryCount > 0 ? (totalMentionRate / queryCount) * 100 : 0;

          return {
            geographic_region: region, // Keep original format
            total_queries: data.total_count,
            avg_sentiment: data.sentiment_scores.length > 0 
              ? data.sentiment_scores.reduce((a: number, b: number) => a + b, 0) / data.sentiment_scores.length 
              : 0,
            avg_position: data.ranking_positions.length > 0
              ? data.ranking_positions.reduce((a: number, b: number) => a + b, 0) / data.ranking_positions.length
              : null,
            mention_percentage: mentionPercentage,
            feature_score: (data.feature_yes_count * 100) / (data.feature_total_count || 1),
            engines: Array.from(data.engines) as string[]
          };
        });

        setData(finalData);
      } catch (err) {
        console.error('Error fetching region data:', err);
        setError('Failed to load region data');
      } finally {
        setIsLoading(false);
      }
    }

    fetchRegionData();
  }, [companyId, timeSegment]);

  return { data, isLoading, error };
}

// Add filter type definition at the top with other interfaces
interface ResponseAnalysisFilters {
  company_id: number;
  geographic_region?: string;
  icp_vertical?: string;
  analysis_batch_id?: string;
  created_at?: string;
}

function useVerticalAnalytics(companyId: number, region: string | null, timeSegment: TimeSegment | null) {
  const [data, setData] = useState<VerticalAnalytics[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVerticalData() {
      if (!companyId || !region || !timeSegment) {
        setData([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        let query = createClient()
          .from('response_analysis')
          .select(`
            icp_vertical,
            sentiment_score,
            ranking_position,
            company_mentioned,
            solution_analysis,
            answer_engine,
            query_id,
            buying_journey_stage
          `)
          .eq('company_id', companyId);

        // Add region filter if region is not null
        if (region) {
          query = query.eq('geographic_region', region);
        }

        // Add batch filter if applicable
        if (timeSegment.type === 'BATCH') {
          query = query.eq('analysis_batch_id', timeSegment.id);
        } else {
          query = query
            .gte('created_at', timeSegment.startDate)
            .lte('created_at', timeSegment.endDate);
        }

        // Add not null filter for icp_vertical
        query = query.not('icp_vertical', 'is', null);

        const { data: rawData, error: supabaseError } = await query;

        if (supabaseError) throw supabaseError;

        // Process the data to group by vertical
        const processedData = (rawData || []).reduce((acc: { [key: string]: any }, curr) => {
          const vertical = curr.icp_vertical || 'unknown';
          
          if (!acc[vertical]) {
            acc[vertical] = {
              icp_vertical: vertical,
              sentiment_scores: [],
              ranking_positions: [],
              query_mentions: new Map(),
              early_stage_queries: new Set(),
              feature_yes_count: 0,
              feature_total_count: 0,
              total_count: 0,
              engines: new Set<string>()
            };
          }

          // Always process sentiment
          if (curr.sentiment_score !== null) {
            acc[vertical].sentiment_scores.push(curr.sentiment_score);
          }

          const phase = curr.buying_journey_stage || 'unknown';
          if (isValidPhase(phase)) {
            // Add query to early stage set
            acc[vertical].early_stage_queries.add(curr.query_id);
            
            // Update query mentions tracking
            if (!acc[vertical].query_mentions.has(curr.query_id)) {
              acc[vertical].query_mentions.set(curr.query_id, {
                total_engines: 0,
                engines_with_mention: 0
              });
            }
            
            const queryStats = acc[vertical].query_mentions.get(curr.query_id);
            queryStats.total_engines++;
            if (curr.company_mentioned) {
              queryStats.engines_with_mention++;
            }
          }
          
          if (POSITION_PHASES.includes(phase)) {
            if (curr.ranking_position && curr.ranking_position > 0) {
              acc[vertical].ranking_positions.push(curr.ranking_position);
            }
          }
          
          if (phase === EVALUATION_PHASE && curr.solution_analysis) {
            try {
              const analysis = typeof curr.solution_analysis === 'string'
                ? JSON.parse(curr.solution_analysis)
                : curr.solution_analysis;
              
              acc[vertical].feature_total_count++;
              if (analysis.has_feature === 'YES') {
                acc[vertical].feature_yes_count++;
              }
            } catch (e) {
              console.warn('Failed to parse solution analysis:', e);
            }
          }
          
          acc[vertical].total_count++;
          if (curr.answer_engine) acc[vertical].engines.add(curr.answer_engine);

          return acc;
        }, {});

        // Convert to final format
        const finalData: VerticalAnalytics[] = Object.entries(processedData).map(([vertical, data]: [string, any]) => {
          // Calculate company mention percentage based on per-query rates
          let totalMentionRate = 0;
          let queryCount = 0;
          
          data.query_mentions.forEach((stats: { total_engines: number; engines_with_mention: number }) => {
            const queryMentionRate = stats.engines_with_mention / stats.total_engines;
            totalMentionRate += queryMentionRate;
            queryCount++;
          });

          const mentionPercentage = queryCount > 0 ? (totalMentionRate / queryCount) * 100 : 0;

          return {
            icp_vertical: vertical,
            total_queries: data.total_count,
            avg_sentiment: data.sentiment_scores.length > 0 
              ? data.sentiment_scores.reduce((a: number, b: number) => a + b, 0) / data.sentiment_scores.length 
              : 0,
            avg_position: data.ranking_positions.length > 0
              ? data.ranking_positions.reduce((a: number, b: number) => a + b, 0) / data.ranking_positions.length
              : null,
            mention_percentage: mentionPercentage,
            feature_score: (data.feature_yes_count * 100) / (data.feature_total_count || 1)
          };
        });

        setData(finalData);
      } catch (err) {
        console.error('Error fetching vertical data:', err);
        setError('Failed to load vertical data');
      } finally {
        setIsLoading(false);
      }
    }

    fetchVerticalData();
  }, [companyId, region, timeSegment]);

  return { data, isLoading, error };
}

function usePersonaAnalytics(companyId: number, vertical: string | null, region: string | null, timeSegment: TimeSegment | null) {
  const [data, setData] = useState<PersonaAnalytics[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!vertical) {
      setData([]);
      setIsLoading(false);
      return;
    }

    async function fetchPersonaData() {
      try {
        setIsLoading(true);
        const supabase = createClient();

        // Build initial query
        let query = supabase
          .from('response_analysis')
          .select('query_id, query_text, buying_journey_stage, company_name')
          .eq('company_id', companyId);

        // Add vertical filter if vertical is not null
        if (vertical) {
          query = query.eq('icp_vertical', vertical);
        }

        // Add region filter if region is not null
        if (region) {
          query = query.eq('geographic_region', region);
        }

        query = query.not('query_id', 'is', null);

        // Add batch filter if applicable
        if (timeSegment?.type === 'BATCH') {
          query = query.eq('analysis_batch_id', timeSegment.id);
        } else if (timeSegment) {
          query = query
            .gte('created_at', timeSegment.startDate)
            .lte('created_at', timeSegment.endDate);
        }

        const { data: queryData, error: queryError } = await query;

        if (queryError) {
          console.error('Query error:', queryError);
          throw queryError;
        }

        // Get unique query IDs
        const queryIds = Array.from(new Set((queryData || []).map(q => q.query_id)));
        
        if (queryIds.length === 0) {
          setData([]);
          return;
        }

        // Build response query
        let responseQuery = supabase
          .from('response_analysis')
          .select(`
            sentiment_score,
            ranking_position,
            company_mentioned,
            solution_analysis,
            buyer_persona,
            query_id,
            buying_journey_stage,
            answer_engine,
            rank_list,
            response_text,
            citations_parsed,
            recommended,
            mentioned_companies
          `)
          .eq('company_id', companyId);

        // Add vertical filter if vertical is not null
        if (vertical) {
          responseQuery = responseQuery.eq('icp_vertical', vertical);
        }

        // Add region filter if region is not null
        if (region) {
          responseQuery = responseQuery.eq('geographic_region', region);
        }

        responseQuery = responseQuery.in('query_id', queryIds);

        // Add time filters to response query
        if (timeSegment?.type === 'BATCH') {
          responseQuery = responseQuery.eq('analysis_batch_id', timeSegment.id);
        } else if (timeSegment) {
          responseQuery = responseQuery
            .gte('created_at', timeSegment.startDate)
            .lte('created_at', timeSegment.endDate);
        }

        const { data: responseData, error: responseError } = await responseQuery;

        if (responseError) {
          console.error('Response error:', responseError);
          throw responseError;
        }

        // Group responses by persona
        const processedData = (responseData as ResponseAnalysis[]).reduce((acc: { [key: string]: any }, curr) => {
          const persona = curr.buyer_persona;
          if (!acc[persona]) {
            acc[persona] = {
              buyer_persona: persona,
              sentiment_scores: [],
              ranking_positions: [],
              query_mentions: new Map(), // Track mentions per query
              early_stage_queries: new Set(),
              feature_yes_count: 0,
              feature_total_count: 0,
              total_count: 0,
              queries: new Map<string, Query>()
            };
          }

          // Process sentiment scores
          if (curr.sentiment_score !== null) {
            acc[persona].sentiment_scores.push(curr.sentiment_score);
          }

          // Process other metrics based on phase
          const phase = curr.buying_journey_stage || 'unknown';
          
          if (EARLY_PHASES.includes(phase as string)) {
            // Track early stage queries and mentions
            acc[persona].early_stage_queries.add(curr.query_id);
            
            if (!acc[persona].query_mentions.has(curr.query_id)) {
              acc[persona].query_mentions.set(curr.query_id, {
                total_engines: 0,
                engines_with_mention: 0
              });
            }
            
            const queryStats = acc[persona].query_mentions.get(curr.query_id);
            queryStats.total_engines++;
            if (curr.company_mentioned) {
              queryStats.engines_with_mention++;
            }
          }
          
          if (POSITION_PHASES.includes(phase)) {
            if (curr.ranking_position && curr.ranking_position > 0) {
              acc[persona].ranking_positions.push(curr.ranking_position);
            }
          }
          
          if (phase === EVALUATION_PHASE && curr.solution_analysis) {
            try {
              const analysis = typeof curr.solution_analysis === 'string'
                ? JSON.parse(curr.solution_analysis)
                : curr.solution_analysis;
              
              acc[persona].feature_total_count++;
              if (analysis.has_feature === 'YES') {
                acc[persona].feature_yes_count++;
              }
            } catch (e) {
              console.warn('Failed to parse solution analysis:', e);
            }
          }
          
          // Process query data
          const queryInfo = queryData?.find(q => q.query_id === curr.query_id);
          if (queryInfo) {
            const queryKey = `${curr.query_id}-${curr.buying_journey_stage}`;
            
            if (!acc[persona].queries.has(queryKey)) {
              acc[persona].queries.set(queryKey, {
                id: curr.query_id,
                text: queryInfo.query_text,
                buyerJourneyPhase: curr.buying_journey_stage,
                engineResults: {},
                companyMentioned: false,
                companyMentionRate: 0,
                companyName: queryInfo.company_name
              });
            }

            const query = acc[persona].queries.get(queryKey);
            
            if (curr.answer_engine) {
              const frontendEngineKey = engineMapping[curr.answer_engine];
              
              if (frontendEngineKey) {
                let solutionAnalysis;
                if (curr.solution_analysis && curr.buying_journey_stage === EVALUATION_PHASE) {
                  try {
                    const parsedAnalysis = typeof curr.solution_analysis === 'string'
                      ? JSON.parse(curr.solution_analysis)
                      : curr.solution_analysis;
                    
                    solutionAnalysis = {
                      has_feature: parsedAnalysis.has_feature
                    };
                  } catch (e) {
                    console.warn('Failed to parse solution analysis:', e);
                    solutionAnalysis = {
                      has_feature: 'N/A'
                    };
                  }
                }

                query.engineResults[frontendEngineKey] = {
                  rank: curr.ranking_position || 'n/a',
                  rankList: curr.rank_list || undefined,
                  responseText: curr.response_text || undefined,
                  recommended: curr.recommended || false,
                  citations: curr.citations_parsed?.urls,
                  solutionAnalysis: solutionAnalysis,
                  companyMentioned: curr.company_mentioned || false,
                  mentioned_companies: curr.mentioned_companies || []
                };

                if (curr.company_mentioned) {
                  query.companyMentioned = true;
                }
              }
            }
          }

          acc[persona].total_count++;
          return acc;
        }, {});

        // Calculate mention rates for each query
        Object.values(processedData).forEach((personaData: any) => {
          personaData.queries.forEach((query: Query) => {
            const engineCount = Object.keys(query.engineResults).length;
            const mentionCount = Object.values(query.engineResults)
              .filter(result => result.companyMentioned).length;
            query.companyMentionRate = engineCount > 0 ? (mentionCount / engineCount) * 100 : 0;
          });
        });

        // Convert to final format
        const finalData: PersonaAnalytics[] = Object.entries(processedData).map(([persona, data]: [string, any]) => {
          // Calculate company mention percentage based on per-query rates
          let totalMentionRate = 0;
          let queryCount = 0;
          
          data.query_mentions.forEach((stats: { total_engines: number; engines_with_mention: number }) => {
            const queryMentionRate = stats.engines_with_mention / stats.total_engines;
            totalMentionRate += queryMentionRate;
            queryCount++;
          });

          const mentionPercentage = queryCount > 0 ? (totalMentionRate / queryCount) * 100 : 0;

          return {
            buyer_persona: persona,
            total_queries: data.total_count,
            avg_sentiment: data.sentiment_scores.length > 0
              ? data.sentiment_scores.reduce((sum: number, val: number) => sum + val, 0) / data.sentiment_scores.length
              : 0,
            avg_position: data.ranking_positions.length > 0
              ? data.ranking_positions.reduce((a: number, b: number) => a + b, 0) / data.ranking_positions.length
              : null,
            mention_percentage: mentionPercentage,
            feature_score: (data.feature_yes_count * 100) / (data.feature_total_count || 1),
            queries: Array.from(data.queries.values())
          };
        });

        setData(finalData);
      } catch (err) {
        console.error('Error fetching persona data:', err);
        setError('Failed to load persona data');
      } finally {
        setIsLoading(false);
      }
    }

    fetchPersonaData();
  }, [companyId, vertical, region, timeSegment]); // Add timeSegment to dependencies

  return { data, isLoading, error };
}

interface PersonaAnalytics {
  buyer_persona: string;
  total_queries: number;
  avg_sentiment: number;
  avg_position: number | null;
  mention_percentage: number;
  feature_score: number;
  queries: Query[];
}

function PersonaCard({ 
  persona,
  isExpanded,
  onClick,
  totalVerticalQueries,
  isSelected
}: { 
  persona: PersonaAnalytics
  isExpanded: boolean
  onClick: () => void
  totalVerticalQueries?: number
  isSelected: boolean
}) {
  const [title, seniority, department] = persona.buyer_persona.split(' | ');

  return (
    <Card 
      className={cn(
        cardStyles.base,
        isExpanded && cardStyles.expanded,
        isSelected && cardStyles.selected,
        !isExpanded && !isSelected && cardStyles.hover
      )}
      onClick={onClick}
    >
      <div className="space-y-3">
        <div className={cardStyles.header}>
          <div className={`${cardStyles.iconWrapper} bg-emerald-50`}>
            <svg
              className="h-5 w-5 text-emerald-500"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className={cardStyles.title}>{title}</h3>
            <p className={cardStyles.subtitle}>Industry Analysis</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <span className="truncate">{seniority}</span>
              <span className="shrink-0">•</span>
              <span className="truncate">{department}</span>
            </div>
          </div>
        </div>

        <div className={cardStyles.progress}>
          <QueryCount 
            count={persona.total_queries} 
            total={totalVerticalQueries}
            className="w-full"
          />
        </div>

        <div className={cardStyles.metrics}>
          <MetricItem 
            label="Company Mentioned" 
            value={persona.mention_percentage}
            metricType="mentions"
          />
          <MetricItem 
            label="Average Position" 
            value={persona.avg_position}
            metricType="position"
          />
          <MetricItem 
            label="Feature Score" 
            value={persona.feature_score}
            metricType="features"
          />
          <MetricItem 
            label="Average Sentiment" 
            value={persona.avg_sentiment * 100}
            metricType="sentiment"
          />
        </div>

        <div className="flex items-center text-sm text-muted-foreground hover:text-foreground">
          <span>View Queries</span>
          <ChevronRight className="h-4 w-4 ml-1" />
        </div>
      </div>
    </Card>
  )
}

function countUniqueQueries(queries: Query[]): number {
  // Count unique query IDs
  const uniqueQueryIds = new Set(queries.map(q => q.id));
  return uniqueQueryIds.size;
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
        if (value >= 70) return { icon: '✨', color: 'text-green-600' };
        if (value >= 30) return { icon: '⚡', color: 'text-orange-500' };
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
              <div className="text-green-600"> Present: {Math.round(featurePercentage)}%</div>
              <div className="text-red-600">✗ Missing: {Math.round((featureAnalysis.no / total) * 100)}%)</div>
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

function RegionsView({ companyId, currentSegment }: { 
  companyId: number;
  currentSegment: TimeSegment | null;
}) {
  const [expandedRegion, setExpandedRegion] = useState<string | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const { data: regionData, isLoading, error } = useRegionAnalytics(companyId, currentSegment);

  // Calculate total queries across all regions
  const totalQueries = regionData.reduce((sum, region) => sum + region.total_queries, 0);

  const handleRegionClick = (regionName: string) => {
    // Use the original region name for state
    setExpandedRegion(expandedRegion === regionName ? null : regionName);
    if (expandedRegion !== regionName && sectionRef.current) {
      setTimeout(() => {
        const element = sectionRef.current;
        if (!element) return;
        
        const yOffset = -150;
        const elementRect = element.getBoundingClientRect();
        const absoluteY = elementRect.top + window.pageYOffset + yOffset;
        
        window.scrollTo({ top: absoluteY, behavior: 'smooth' });
      }, 300);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Buying Journey Analysis</h2>
          <p className="text-muted-foreground">Loading region data...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-6">
              <div className="space-y-4">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[220px]" />
                <Skeleton className="h-4 w-[180px]" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Buying Journey Analysis</h2>
          <p className="text-muted-foreground text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Buying Journey Analysis</h2>
        <p className="text-muted-foreground">Click on a region to explore verticals and personas</p>
      </div>

      <div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {regionData.map((region) => (
            <RegionCard 
              key={region.geographic_region}
              region={region.geographic_region}
              metrics={{
                avgSentiment: region.avg_sentiment,
                avgPosition: region.avg_position,
                companyMentioned: region.mention_percentage,
                featureScore: region.feature_score,
                totalQueries: region.total_queries
              }}
              totalRegionQueries={totalQueries}
              isExpanded={expandedRegion === region.geographic_region}
              onClick={handleRegionClick}
              isSelected={expandedRegion === region.geographic_region}
            />
          ))}
        </div>

        <div ref={sectionRef}>
          <AnimatePresence mode="wait">
            {expandedRegion && (
              <motion.div
                key={expandedRegion}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <VerticalsSection 
                  region={expandedRegion}
                  companyId={companyId}
                  totalRegionQueries={regionData.find(r => r.geographic_region === expandedRegion)?.total_queries}
                  currentSegment={currentSegment}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function VerticalsSection({ 
  region, 
  companyId, 
  totalRegionQueries,
  currentSegment 
}: { 
  region: string;
  companyId: number;
  totalRegionQueries?: number;
  currentSegment: TimeSegment | null;
}) {
  const [expandedVertical, setExpandedVertical] = useState<string | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const { data: verticalData, isLoading, error } = useVerticalAnalytics(companyId, region, currentSegment);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();
  const shouldScrollRef = useRef(false);

  // Handle scroll after data is loaded
  useEffect(() => {
    if (!isLoading && shouldScrollRef.current && sectionRef.current && expandedVertical) {
      const handleScroll = () => {
        const element = sectionRef.current;
        if (!element) return;
        
        const yOffset = -150;
        const elementRect = element.getBoundingClientRect();
        const absoluteY = elementRect.top + window.pageYOffset + yOffset;
        
        window.scrollTo({ top: absoluteY, behavior: 'smooth' });
      };

      // Clear any existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Set a new timeout with a longer delay to ensure content is rendered
      scrollTimeoutRef.current = setTimeout(handleScroll, 600);
      shouldScrollRef.current = false;
    }
  }, [isLoading, expandedVertical]);

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  const handleVerticalClick = (verticalName: string) => {
    const isExpanding = expandedVertical !== verticalName;
    setExpandedVertical(isExpanding ? verticalName : null);
    
    if (isExpanding) {
      shouldScrollRef.current = true;
    }
  };

  if (isLoading) {
    return (
      <div className="mt-8 space-y-6">
        <BreadcrumbPath region={region} />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2].map((i) => (
            <Card key={i} className="p-6">
              <div className="space-y-4">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-6">
      <BreadcrumbPath region={region} />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {verticalData.map((vertical) => (
          <VerticalCard
            key={vertical.icp_vertical}
            vertical={{
              name: vertical.icp_vertical,
              metrics: {
                avgSentiment: vertical.avg_sentiment,
                avgPosition: vertical.avg_position,
                companyMentioned: vertical.mention_percentage,
                featureScore: vertical.feature_score,
                totalQueries: vertical.total_queries
              }
            }}
            isExpanded={expandedVertical === vertical.icp_vertical}
            onClick={() => handleVerticalClick(vertical.icp_vertical)}
            totalRegionQueries={totalRegionQueries}
            isSelected={expandedVertical === vertical.icp_vertical}
          />
        ))}
      </div>

      <div ref={sectionRef}>
        <AnimatePresence mode="wait">
          {expandedVertical && (
            <motion.div
              key={expandedVertical}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <PersonasSection 
                region={region} 
                vertical={expandedVertical} 
                companyId={companyId}
                totalVerticalQueries={verticalData.find(v => v.icp_vertical === expandedVertical)?.total_queries}
                currentSegment={currentSegment}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-[300px]" />
        <Skeleton className="h-4 w-[200px] mt-2" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6">
            <Skeleton className="h-6 w-[120px] mb-4" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

function Citations({ 
  engineResults 
}: { 
  engineResults: Query['engineResults']
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  console.log('Citations component engineResults:', engineResults);
  
  const totalCitations = Object.values(engineResults).reduce((total, result) => {
    console.log('Processing engine result:', result);
    return total + (result.citations?.length || 0);
  }, 0);
  
  console.log('Total citations calculated:', totalCitations);

  if (totalCitations === 0) {
    console.log('No citations found, not rendering component');
    return null;
  }

  return (
    <div className="mt-4 border-t pt-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-4 h-4"
        >
          <path d="M15.5 4h-11A1.5 1.5 0 003 5.5v9A1.5 1.5 0 004.5 16h11a1.5 1.5 0 001.5-1.5v-9A1.5 1.5 0 0015.5 4zM5 7h2v2H5V7zm4 0h2v2H9V7zm4 0h2v2h-2V7z" />
        </svg>
        <span>Citations ({totalCitations})</span>
        <div className={`ml-auto transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
          <ChevronDown className="h-4 w-4" />
        </div>
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

interface SolutionAnalysis {
  has_feature: 'YES' | 'NO' | 'N/A';
}

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

// Add TimeSegment interface at the top with other interfaces
interface TimeSegment {
  id: string;
  type: 'BATCH' | 'WEEK' | 'MONTH';
  startDate: string;
  endDate: string;
  displayName: string;
}

interface TimeMetrics {
  sentiment: number;
  position: number | null;
  mentions: number;
  features: number;
  totalResponses: number;
}

interface MetricsData {
  current: TimeMetrics;
  previous?: TimeMetrics;
  changes?: {
    sentiment: number;
    position: number;
    mentions: number;
    features: number;
  };
}

// Add TimeNavigation component
function TimeNavigation({ 
  viewType,
  currentSegment,
  segments,
  onViewTypeChange,
  onSegmentChange 
}: { 
  viewType: 'batch' | 'week' | 'month';
  currentSegment: TimeSegment;
  segments: TimeSegment[];
  onViewTypeChange: (type: string) => void;
  onSegmentChange: (segment: TimeSegment) => void;
}) {
  // Find current segment index
  const currentIndex = segments.findIndex(s => s.id === currentSegment.id);
  const hasPrevious = currentIndex < segments.length - 1;
  const hasNext = currentIndex > 0;

  const handlePrevious = () => {
    if (hasPrevious) {
      onSegmentChange(segments[currentIndex + 1]);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      onSegmentChange(segments[currentIndex - 1]);
    }
  };

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-accent/5 p-1 rounded-lg">
          {(['batch', 'week', 'month'] as const).map((type) => (
            <Button
              key={type}
              variant={viewType === type ? "secondary" : "ghost"}
              size="sm"
              onClick={() => onViewTypeChange(type)}
              className="capitalize"
            >
              {type}
            </Button>
          ))}
        </div>
        <div className="text-sm text-muted-foreground">
          {currentSegment.displayName}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePrevious}
          disabled={!hasPrevious}
          className={cn(!hasPrevious && "opacity-50")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleNext}
          disabled={!hasNext}
          className={cn(!hasNext && "opacity-50")}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// Add MetricsSummary component
function MetricsSummary({ metrics }: { metrics: MetricsData }) {
  return (
    <div className="grid grid-cols-4 gap-4 mb-8">
      <MetricCard
        title="Company Mentions"
        value={metrics.current.mentions}
        previousValue={metrics.previous?.mentions}
        change={metrics.changes?.mentions}
        format="percentage"
      />
      <MetricCard
        title="Average Position"
        value={metrics.current.position}
        previousValue={metrics.previous?.position}
        change={metrics.changes?.position}
        format="number"
        lowerIsBetter
      />
      <MetricCard
        title="Feature Score"
        value={metrics.current.features}
        previousValue={metrics.previous?.features}
        change={metrics.changes?.features}
        format="percentage"
      />
      <MetricCard
        title="Sentiment Score"
        value={metrics.current.sentiment}
        previousValue={metrics.previous?.sentiment}
        change={metrics.changes?.sentiment}
        format="percentage"
      />
    </div>
  );
}

// Add MetricCard component
function MetricCard({ 
  title,
  value,
  previousValue,
  change,
  format,
  lowerIsBetter = false
}: { 
  title: string;
  value: number | null;
  previousValue?: number | null;
  change?: number;
  format: 'percentage' | 'number';
  lowerIsBetter?: boolean;
}) {
  const formatValue = (val: number | null) => {
    if (val === null) return 'N/A';
    return format === 'percentage' 
      ? `${Math.round(val * 100)}%`
      : val.toFixed(1);
  };

  const getTrendColor = () => {
    if (!change) return 'text-muted-foreground';
    const isPositive = lowerIsBetter ? change < 0 : change > 0;
    return isPositive ? 'text-green-600' : 'text-red-600';
  };

  const getChangeDescription = () => {
    if (!change) return 'No previous data available';
    if (previousValue === 0 || previousValue === null) {
      return value === 0 ? 'No change from zero' : 'First recorded value';
    }
    const direction = change > 0 ? 'increase' : 'decrease';
    return `${Math.abs(Math.round(change * 100))}% ${direction} from ${formatValue(previousValue ?? null)}`;
  };

  return (
    <Card className="p-4 group relative">
      <h3 className="text-sm font-medium text-muted-foreground mb-2">{title}</h3>
      <div className="text-2xl font-bold mb-2">{formatValue(value)}</div>
      {change !== undefined && (
        <>
          <div className={cn("text-sm flex items-center gap-1", getTrendColor())}>
            {change > 0 ? '+' : ''}{Math.round(change * 100)}%
            {change !== 0 && (
              <span className="text-xs">
                {lowerIsBetter ? (change < 0 ? '↓' : '↑') : (change > 0 ? '↑' : '↓')}
              </span>
            )}
          </div>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-popover/95 rounded-lg p-3">
            <div className="h-full flex items-center justify-center text-center">
              <p className="text-sm text-popover-foreground">
                {getChangeDescription()}
              </p>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}

// Add hooks
function useTimeSegments(companyId: number, type: 'batch' | 'week' | 'month') {
  const [segments, setSegments] = useState<TimeSegment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSegments() {
      if (!companyId) return;

      try {
        setIsLoading(true);
        const supabase = createClient();

        // Get all responses for the company
        const { data: responses, error: fetchError } = await supabase
          .from('response_analysis')
          .select('analysis_batch_id, created_at')
          .eq('company_id', companyId)
          .order('created_at', { ascending: false })
          .order('analysis_batch_id', { ascending: false });

        if (fetchError) throw fetchError;

        if (type === 'batch') {
          // Group by batch with timestamp info
          const batchMap = new Map<string, { 
            start: string; 
            end: string; 
            count: number;
            timestamp: string;
          }>();
          
          responses?.forEach(response => {
            const batchId = response.analysis_batch_id || 'unknown';
            const date = new Date(response.created_at || Date.now());
            
            if (!batchMap.has(batchId)) {
              batchMap.set(batchId, {
                start: response.created_at || new Date().toISOString(),
                end: response.created_at || new Date().toISOString(),
                count: 0,
                timestamp: response.created_at || new Date().toISOString()
              });
            }
            
            const batch = batchMap.get(batchId)!;
            batch.count++;
            
            if (new Date(response.created_at || Date.now()) < new Date(batch.start)) {
              batch.start = response.created_at || new Date().toISOString();
            }
            if (new Date(response.created_at || Date.now()) > new Date(batch.end)) {
              batch.end = response.created_at || new Date().toISOString();
              batch.timestamp = response.created_at || new Date().toISOString();
            }
          });

          // Convert to array and sort by date and batch ID
          const batchSegments = Array.from(batchMap.entries())
            .map(([id, data]) => {
              const date = new Date(data.timestamp);
              const sameDayBatches = Array.from(batchMap.entries()).filter(([_, b]) => 
                new Date(b.timestamp).toDateString() === date.toDateString()
              );

              return {
                id,
                type: 'BATCH' as const,
                startDate: data.start,
                endDate: data.end,
                timestamp: data.timestamp,
                displayName: sameDayBatches.length > 1
                  ? `Batch ${date.toLocaleDateString()} ${date.toLocaleTimeString()} (${data.count} responses)`
                  : `Batch ${date.toLocaleDateString()} (${data.count} responses)`
              };
            })
            .sort((a, b) => {
              // Sort by date first
              const dateCompare = new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
              if (dateCompare !== 0) return dateCompare;
              // Then by batch ID
              return b.id.localeCompare(a.id);
            });

          setSegments(batchSegments);
        } else {
          // Group by week or month
          const periodMap = new Map<string, { start: Date; end: Date; count: number }>();
          
          responses?.forEach(response => {
            const date = new Date(response.created_at || Date.now());
            let periodKey: string;
            let periodStart: Date;
            let periodEnd: Date;

            if (type === 'week') {
              // Get the Monday of the week
              const day = date.getDay();
              const diff = date.getDate() - day + (day === 0 ? -6 : 1);
              periodStart = new Date(date.setDate(diff));
              periodStart.setHours(0, 0, 0, 0);
              
              periodEnd = new Date(periodStart);
              periodEnd.setDate(periodStart.getDate() + 6);
              periodEnd.setHours(23, 59, 59, 999);

              periodKey = `${periodStart.getFullYear()}-W${String(Math.ceil(periodStart.getDate() / 7)).padStart(2, '0')}`;
            } else {
              // Month view
              periodStart = new Date(date.getFullYear(), date.getMonth(), 1);
              periodEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
              periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            }

            if (!periodMap.has(periodKey)) {
              periodMap.set(periodKey, { start: periodStart, end: periodEnd, count: 0 });
            }
            
            periodMap.get(periodKey)!.count++;
          });

          const periodSegments = Array.from(periodMap.entries()).map(([id, data]) => ({
            id,
            type: type.toUpperCase() as 'WEEK' | 'MONTH',
            startDate: data.start.toISOString(),
            endDate: data.end.toISOString(),
            displayName: type === 'week'
              ? `Week of ${data.start.toLocaleDateString()} (${data.count} responses)`
              : `${data.start.toLocaleString('default', { month: 'long' })} ${data.start.getFullYear()} (${data.count} responses)`
          }));

          setSegments(periodSegments.sort((a, b) => 
            new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
          ));
        }
      } catch (err) {
        console.error('Error fetching time segments:', err);
        setError('Failed to load time segments');
      } finally {
        setIsLoading(false);
      }
    }

    fetchSegments();
  }, [companyId, type]);

  return { segments, isLoading, error };
}

function useTimeMetrics(companyId: number, segment: TimeSegment, segments: TimeSegment[]) {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMetrics() {
      if (!companyId || !segment) return;

      try {
        setIsLoading(true);
        const supabase = createClient();

        // Function to calculate metrics for a time range
        const getMetricsForRange = async (startDate: string, endDate: string): Promise<TimeMetrics> => {
          const { data: responses, error: fetchError } = await supabase
            .from('response_analysis')
            .select('*')
            .eq('company_id', companyId)
            .gte('created_at', startDate)
            .lte('created_at', endDate);

          if (fetchError) throw fetchError;

          const metrics = {
            sentiment: 0,
            position: null as number | null,
            mentions: 0,
            features: 0,
            totalResponses: responses?.length || 0
          };

          if (!responses?.length) return metrics;

          // Calculate sentiment score (all stages)
          const validSentiments = responses.filter(r => r.sentiment_score !== null);
          if (validSentiments.length) {
            metrics.sentiment = validSentiments.reduce((sum, r) => sum + (r.sentiment_score || 0), 0) / validSentiments.length;
          }

          // Calculate position score (comparison and feedback stages)
          const positionResponses = responses.filter(r => 
            r.buying_journey_stage && ['solution_comparison', 'user_feedback'].includes(r.buying_journey_stage) &&
            r.ranking_position !== null && r.ranking_position > 0
          );
          if (positionResponses.length) {
            metrics.position = positionResponses.reduce((sum, r) => sum + (r.ranking_position || 0), 0) / positionResponses.length;
          }

          // Calculate mention rate (early stages)
          const earlyStageResponses = responses.filter(r => 
            r.buying_journey_stage && ['problem_exploration', 'solution_education'].includes(r.buying_journey_stage)
          );
          if (earlyStageResponses.length) {
            metrics.mentions = earlyStageResponses.filter(r => r.company_mentioned).length / earlyStageResponses.length;
          }

          // Calculate feature score (evaluation stage)
          const evaluationResponses = responses.filter(r => 
            r.buying_journey_stage === 'solution_evaluation' && r.solution_analysis
          );
          if (evaluationResponses.length) {
            const featureYesCount = evaluationResponses.filter(r => {
              try {
                const analysis = typeof r.solution_analysis === 'string'
                  ? JSON.parse(r.solution_analysis)
                  : r.solution_analysis;
                return analysis.has_feature === 'YES';
              } catch (e) {
                console.warn('Failed to parse solution analysis:', e);
                return false;
              }
            }).length;
            metrics.features = featureYesCount / evaluationResponses.length;
          }

          return metrics;
        };

        // Get current period metrics
        const currentMetrics = await getMetricsForRange(segment.startDate, segment.endDate);

        // Find previous segment
        const currentIndex = segments.findIndex(s => s.id === segment.id);
        const previousSegment = segments[currentIndex + 1];

        // Get previous period metrics
        const previousMetrics = previousSegment
          ? await getMetricsForRange(previousSegment.startDate, previousSegment.endDate)
          : null;

        // Calculate changes with proper handling of zero values and first segment
        const calculateChange = (current: number, previous: number | null) => {
          if (previous === null || previous === 0) {
            return current > 0 ? 1 : 0; // 100% increase from zero/null
          }
          return (current - previous) / previous;
        };

        const changes = previousMetrics ? {
          sentiment: calculateChange(currentMetrics.sentiment, previousMetrics.sentiment),
          position: currentMetrics.position !== null && previousMetrics.position !== null
            ? calculateChange(currentMetrics.position, previousMetrics.position)
            : 0,
          mentions: calculateChange(currentMetrics.mentions, previousMetrics.mentions),
          features: calculateChange(currentMetrics.features, previousMetrics.features)
        } : undefined;

        setMetrics({
          current: currentMetrics,
          previous: previousMetrics || undefined,
          changes
        });
      } catch (err) {
        console.error('Error fetching metrics:', err);
        setError('Failed to load metrics');
      } finally {
        setIsLoading(false);
      }
    }

    fetchMetrics();
  }, [companyId, segment, segments]);

  return { metrics, isLoading, error };
}

export function BuyingJourneyAnalysis({ companyId }: Props) {
  const selectedCompanyId = useDashboardStore(state => state.selectedCompanyId)
  const effectiveCompanyId = companyId ?? selectedCompanyId
  const [viewType, setViewType] = useState<'batch' | 'week' | 'month'>('batch');
  const { segments, isLoading: segmentsLoading } = useTimeSegments(effectiveCompanyId, viewType);
  const [currentSegment, setCurrentSegment] = useState<TimeSegment | null>(null);
  const { metrics, isLoading: metricsLoading } = useTimeMetrics(effectiveCompanyId, currentSegment!, segments);

  // Set initial segment
  useEffect(() => {
    if (segments.length > 0 && !currentSegment) {
      setCurrentSegment(segments[0]);
    }
  }, [segments]);

  const handleViewTypeChange = (type: string) => {
    setViewType(type as 'batch' | 'week' | 'month');
    setCurrentSegment(null); // Reset segment when changing view type
  };

  const handleSegmentChange = (segment: TimeSegment) => {
    setCurrentSegment(segment);
  };

  if (segmentsLoading) {
    return (
      <Card className="p-6">
        <LoadingSkeleton />
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Buying Journey Analysis</h2>
          <p className="text-muted-foreground">Analyze your performance across different time periods</p>
        </div>

        {currentSegment && (
          <TimeNavigation
            viewType={viewType}
            currentSegment={currentSegment}
            segments={segments}
            onViewTypeChange={handleViewTypeChange}
            onSegmentChange={handleSegmentChange}
          />
        )}

        {metricsLoading ? (
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="p-4">
                <Skeleton className="h-4 w-[100px] mb-2" />
                <Skeleton className="h-8 w-[120px] mb-2" />
                <Skeleton className="h-4 w-[80px]" />
              </Card>
            ))}
          </div>
        ) : metrics ? (
          <MetricsSummary metrics={metrics} />
        ) : null}

        <Suspense fallback={<LoadingSkeleton />}>
          <RegionsView 
            companyId={effectiveCompanyId} 
            currentSegment={currentSegment}
          />
        </Suspense>
      </div>
    </Card>
  );
} 