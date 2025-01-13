'use client'

import { useState, useEffect, useMemo, memo, useCallback } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { createClient } from '@/app/supabase/client';
import { Activity, Users, Building2, Globe2, Search, MessageSquare, Brain, Target, Route, FileText, Calendar, Info } from 'lucide-react';
import { motion, AnimatePresence, useSpring, useMotionValue, useTransform } from 'framer-motion';
import { useDashboardStore } from '@/app/dashboard/store';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ResponseAnalysis {
  id: number;
  response_id: number | null;
  citations_parsed: any;
  recommended: boolean | null;
  cited: boolean | null;
  created_at: string;
  sentiment_score: number | null;
  ranking_position: number | null;
  company_mentioned: boolean | null;
  geographic_region: string | null;
  icp_vertical: string | null;
  buyer_persona: string | null;
  buying_journey_stage: string | null;
  response_text: string | null;
  rank_list: string | null;
  company_id: number;
  answer_engine: string;
  query_text: string | null;
  query_id: number | null;
  company_name: string;
  prompt_id: number | null;
  prompt_name: string | null;
  competitors_list: string[] | null;
  mentioned_companies: string[] | null;
  solution_analysis: string | { has_feature: 'YES' | 'NO' | 'N/A' };
  analysis_batch_id: string | null;
  created_by_batch: boolean | null;
}

interface EngineMetricsData {
  date: string;
  unique_queries: number;
  [engine: string]: number | string | undefined;
}

interface EngineMetricsChartProps {
  companyId: number;
  accountId: string;
}

// Updated ExtendedResponseAnalysis interface
interface ExtendedResponseAnalysis extends ResponseAnalysis {
  id: number;
  response_id: number | null;
  citations_parsed: any;
  recommended: boolean | null;
  cited: boolean | null;
  created_at: string;
  sentiment_score: number | null;
  ranking_position: number | null;
  company_mentioned: boolean | null;
  geographic_region: string | null;
  icp_vertical: string | null;
  buyer_persona: string | null;
  buying_journey_stage: string | null;
  response_text: string | null;
  rank_list: string | null;
  company_id: number;
  answer_engine: string;
  query_text: string | null;
  query_id: number | null;
  company_name: string;
  prompt_id: number | null;
  prompt_name: string | null;
  competitors_list: string[] | null;
  mentioned_companies: string[] | null;
  solution_analysis: string | { has_feature: 'YES' | 'NO' | 'N/A' };
  analysis_batch_id: string | null;
  created_by_batch: boolean | null;
}

// Updated group types with discriminated union
interface MetricValues {
  sentiment: number;
  position: number;
  company_mentioned: number;
  feature_score: number;
  count: number;
}

interface BaseGroup {
  type: 'batch' | 'time';
  metrics: {
    [engine: string]: MetricValues;
  }
}

// Update the BatchGroup interface to include label
interface BatchGroup {
  type: 'batch';
  batchId: string;
  date: string;
  label?: string;
  metrics: {
    [engine: string]: MetricValues;
  };
  records: ExtendedResponseAnalysis[];
}

interface TimeGroup extends BaseGroup {
  type: 'time';
  startDate: string;
  endDate: string;
  label: string;
  records: ExtendedResponseAnalysis[];
}

type Group = BatchGroup | TimeGroup;

interface ProcessedDataByMode {
  batch: BatchGroup[];
  week: TimeGroup[];
  month: TimeGroup[];
}

// Type guard functions
function isBatchGroup(group: Group): group is BatchGroup {
  return group.type === 'batch';
}

function isTimeGroup(group: Group): group is TimeGroup {
  return group.type === 'time';
}

// Add a mapping for database engine names to our internal keys
const DB_ENGINE_MAP: { [key: string]: string } = {
  'openai': 'searchgpt',
  'gpt-4': 'searchgpt',
  'gpt-3.5-turbo': 'searchgpt',
  'google_search': 'aio',
  'google-search': 'aio',
  'perplexity': 'perplexity',
  'claude': 'claude',
  'claude-2': 'claude',
  'gemini': 'gemini',
  'gemini-pro': 'gemini'
};

const ENGINE_COLORS: { [key: string]: string } = {
  perplexity: '#9333ea',     // Bright purple
  claude: '#2563eb',         // Royal blue
  gemini: '#db2777',         // Deep pink
  searchgpt: '#4f46e5',      // Indigo
  aio: '#06b6d4',           // Cyan
  default: '#94a3b8'        // Slate gray
};

const ENGINE_NAMES: { [key: string]: string } = {
  perplexity: 'Perplexity',
  claude: 'Claude',
  gemini: 'Gemini',
  searchgpt: 'SearchGPT',  // Will display for openai
  aio: 'AIO'              // Will display for google_search
};

type MetricKey = 'sentiment' | 'position' | 'company_mentioned' | 'feature_score';

interface MetricConfig {
  label: string;
  description: string;
  valueFormatter: (value: number) => string;
  field: keyof ExtendedResponseAnalysis;
  domain?: [number, number];
  yAxisConfig?: { ticks: number[] };
  allowedPhases?: string[];
  processValue: (record: ExtendedResponseAnalysis) => number | null;
}

// Add stage-specific constants
const PROBLEM_EXPLORATION_STAGE = 'problem_exploration';
const SOLUTION_EDUCATION_STAGE = 'solution_education';
const SOLUTION_COMPARISON_STAGE = 'solution_comparison';
const SOLUTION_EVALUATION_STAGE = 'solution_evaluation';
const FINAL_RESEARCH_STAGE = 'final_research';

// Update METRICS configuration with proper stage filtering
const METRICS: Record<MetricKey, MetricConfig> = {
  company_mentioned: {
    label: 'Company Mentioned',
    description: 'Frequency of company mentions in early exploration phases',
    valueFormatter: (value: number) => `${(value * 100).toFixed(0)}%`,
    field: 'company_mentioned',
    domain: [0, 1],
    yAxisConfig: { ticks: [0, 0.2, 0.4, 0.6, 0.8, 1.0] },
    allowedPhases: [PROBLEM_EXPLORATION_STAGE, SOLUTION_EDUCATION_STAGE],
    processValue: (record: ExtendedResponseAnalysis) => 
      record.company_mentioned ? 1 : 0
  },
  position: {
    label: 'Average Position',
    description: 'Average ranking position in solution comparison and user feedback phases',
    valueFormatter: (value: number) => value.toFixed(1),
    field: 'ranking_position',
    domain: [0, 7],
    yAxisConfig: { 
      ticks: [0, 1, 2, 3, 4, 5, 6, 7]
    },
    allowedPhases: [SOLUTION_COMPARISON_STAGE, FINAL_RESEARCH_STAGE],
    processValue: (record: ExtendedResponseAnalysis) => 
      typeof record.ranking_position === 'number' ? record.ranking_position : null
  },
  feature_score: {
    label: 'Feature Score',
    description: 'Percentage of positive feature evaluations in solution evaluation phase',
    valueFormatter: (value: number) => `${(value * 100).toFixed(0)}%`,
    field: 'solution_analysis',
    domain: [0, 1],
    yAxisConfig: { ticks: [0, 0.2, 0.4, 0.6, 0.8, 1.0] },
    allowedPhases: [SOLUTION_EVALUATION_STAGE],
    processValue: (record: ExtendedResponseAnalysis) => {
      if (!record.solution_analysis) return null;
      try {
        const analysis = typeof record.solution_analysis === 'string'
          ? JSON.parse(record.solution_analysis)
          : record.solution_analysis;
        return analysis?.has_feature === 'YES' ? 1 : 0;
      } catch {
        console.warn('Failed to parse solution analysis:', record.solution_analysis);
        return null;
      }
    }
  },
  sentiment: {
    label: 'Average Sentiment',
    description: 'Average sentiment score across all phases',
    valueFormatter: (value: number) => `${(value * 100).toFixed(0)}%`,
    field: 'sentiment_score',
    domain: [0, 1],
    yAxisConfig: { ticks: [0, 0.2, 0.4, 0.6, 0.8, 1.0] },
    processValue: (record: ExtendedResponseAnalysis) => 
      typeof record.sentiment_score === 'number' ? record.sentiment_score : null
  }
};

// Update date handling utilities with validation
function isValidDate(date: Date): boolean {
  return date instanceof Date && !isNaN(date.getTime());
}

function parseDate(dateString: string | null | undefined): Date | null {
  if (!dateString) return null;
  const date = new Date(dateString);
  return isValidDate(date) ? date : null;
}

const DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  year: 'numeric',
  day: 'numeric'
});

const MONTH_FORMATTER = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  year: 'numeric'
});

const SHORT_MONTH_FORMATTER = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  year: 'numeric'
});

// Update the date formatting functions with validation
const formatDate = (dateString: string) => {
  const date = parseDate(dateString);
  if (!date) return 'N/A';
  return SHORT_MONTH_FORMATTER.format(date);
};

const formatTooltipDate = (dateString: string) => {
  const date = parseDate(dateString);
  if (!date) return 'N/A';
  return DATE_FORMATTER.format(date);
};

// Add a function to get the start of the week with validation
function getWeekStart(date: Date): Date {
  if (!isValidDate(date)) {
    throw new Error('Invalid date provided to getWeekStart');
  }
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Add a function to get the end of the week with validation
function getWeekEnd(date: Date): Date {
  if (!isValidDate(date)) {
    throw new Error('Invalid date provided to getWeekEnd');
  }
  const d = new Date(getWeekStart(date));
  d.setDate(d.getDate() + 6);
  d.setHours(23, 59, 59, 999);
  return d;
}

// Update the week number calculation with validation
const getWeekNumber = (date: Date) => {
  if (!isValidDate(date)) {
    throw new Error('Invalid date provided to getWeekNumber');
  }
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNumber = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return weekNumber;
};

// Add function to get week of month
function getWeekOfMonth(date: Date): number {
  if (!isValidDate(date)) {
    throw new Error('Invalid date provided to getWeekOfMonth');
  }
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const dayOfMonth = date.getDate();
  return Math.ceil((dayOfMonth + firstDayOfMonth.getDay()) / 7);
}

// Add ISO week calculation utilities
function getISOWeek(date: Date): { year: number; week: number; } {
  if (!isValidDate(date)) {
    throw new Error('Invalid date provided to getISOWeek');
  }
  
  // Create new date object and set to nearest Thursday (current date + 4 - current day number)
  // current day number = 0 (Sunday) to 6 (Saturday)
  const target = new Date(date.valueOf());
  const dayNumber = (date.getDay() + 6) % 7; // Convert Sunday (0) to 6, and Monday (1) to 0
  target.setDate(target.getDate() - dayNumber + 3);
  
  // Get first Thursday of the year
  const firstThursday = new Date(target.getFullYear(), 0, 4);
  const firstDay = (firstThursday.getDay() + 6) % 7;
  firstThursday.setDate(firstThursday.getDate() - firstDay + 3);
  
  // Get week number: Number of weeks between target and first Thursday
  const weekNumber = 1 + Math.ceil((target.valueOf() - firstThursday.valueOf()) / (7 * 24 * 60 * 60 * 1000));
  
  return {
    year: target.getFullYear(),
    week: weekNumber
  };
}

// Get the month that owns the majority of days in a week
function getWeekOwnerMonth(date: Date): Date {
  if (!isValidDate(date)) {
    throw new Error('Invalid date provided to getWeekOwnerMonth');
  }
  
  // Get Monday of the week
  const monday = new Date(date.valueOf());
  const daysSinceMonday = (date.getDay() + 6) % 7; // Convert Sunday (0) to 6, Monday (1) to 0
  monday.setDate(monday.getDate() - daysSinceMonday);
  
  // Get all days of the week
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(monday.valueOf());
    day.setDate(monday.getDate() + i);
    return day;
  });
  
  // Count days per month
  const monthCounts = weekDays.reduce((acc, day) => {
    const monthKey = `${day.getFullYear()}-${day.getMonth()}`;
    acc[monthKey] = (acc[monthKey] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Find month with most days
  const [maxMonthKey] = Object.entries(monthCounts)
    .reduce((max, curr) => curr[1] > max[1] ? curr : max);
  
  const [year, month] = maxMonthKey.split('-').map(Number);
  return new Date(year, month, 1);
}

// Add function to get relative week number within a month
function getRelativeWeekOfMonth(date: Date): number {
  if (!isValidDate(date)) {
    throw new Error('Invalid date provided to getRelativeWeekOfMonth');
  }
  
  // Get the first day of the month
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  
  // Get Monday of the first week
  const firstMonday = new Date(firstDay);
  const firstDayWeekday = firstDay.getDay();
  const daysUntilMonday = firstDayWeekday === 0 ? 1 : (8 - firstDayWeekday);
  firstMonday.setDate(firstDay.getDate() + daysUntilMonday - 7);
  
  // Calculate the number of weeks since the first Monday
  const diffInDays = Math.floor((date.getTime() - firstMonday.getTime()) / (1000 * 60 * 60 * 24));
  return Math.ceil((diffInDays + 1) / 7);
}

// Update week label formatting to use relative week numbers
const getWeekLabel = (date: Date) => {
  if (!isValidDate(date)) {
    return 'Invalid Week';
  }
  
  try {
    const monthDate = getWeekOwnerMonth(date);
    const relativeWeek = getRelativeWeekOfMonth(date);
    return `${SHORT_MONTH_FORMATTER.format(monthDate)} Week ${relativeWeek}`;
  } catch (error) {
    console.error('Error generating week label:', error);
    return 'Invalid Week';
  }
};

// Update the month label formatting with validation
const getMonthLabel = (date: Date) => {
  if (!isValidDate(date)) {
    return 'Invalid Month';
  }
  return MONTH_FORMATTER.format(date);
};

interface ResearchSummaryData {
  uniqueQueries: number;
  totalResponses: number;
  uniquePersonas: number;
  uniqueVerticals: number;
  uniqueRegions: number;
  analyzedCompanies: number;
  avgSentiment: number;
  recommendationRate: number;
  journeyStagesCovered: number;
  uniqueCitations: number;
}

interface MetricCardProps {
  value: number;
  label: string;
  icon: React.ReactNode;
  formatter?: (value: number) => string;
}

// Custom hook for research data
function useResearchData(companyId: number | null | undefined) {
  const [data, setData] = useState<ResearchSummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchResearchSummary() {
      if (!companyId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const { data: summaryData, error: supabaseError } = await createClient()
          .from('response_analysis')
          .select(`
            query_id,
            response_id,
            buyer_persona,
            icp_vertical,
            geographic_region,
            sentiment_score,
            recommended,
            citations_parsed
          `)
          .eq('company_id', companyId);

        if (supabaseError) throw supabaseError;

        if (!summaryData) {
          setData(null);
          return;
        }

        const summary: ResearchSummaryData = {
          uniqueQueries: new Set(summaryData.map(d => d.query_id)).size,
          totalResponses: new Set(summaryData.map(d => d.response_id)).size,
          uniquePersonas: new Set(summaryData.map(d => d.buyer_persona)).size,
          uniqueVerticals: new Set(summaryData.map(d => d.icp_vertical)).size,
          uniqueRegions: new Set(summaryData.map(d => d.geographic_region)).size,
          analyzedCompanies: 0, // Default value
          avgSentiment: summaryData.reduce((acc, curr) => acc + (curr.sentiment_score || 0), 0) / summaryData.length,
          recommendationRate: summaryData.filter(d => d.recommended).length / summaryData.length,
          journeyStagesCovered: 0, // Default value
          uniqueCitations: summaryData.reduce((acc, curr) => acc + (curr.citations_parsed ? 1 : 0), 0)
        };

        setData(summary);
      } catch (err) {
        console.error('Error fetching research summary:', err);
        setError('Failed to load research summary');
      } finally {
        setIsLoading(false);
      }
    }

    fetchResearchSummary();
  }, [companyId]);

  return { data, isLoading, error };
}

// Memoized MetricCard
const MetricCard = memo(function MetricCard({ value, label, icon, formatter = (v) => v.toLocaleString(), index }: MetricCardProps & { index: number }) {
  const count = useSpring(0, {
    mass: 1,
    stiffness: 45,
    damping: 25,
    restDelta: 0.1
  });

  useEffect(() => {
    const timeout = setTimeout(() => {
      count.set(value);
    }, 500 + index * 200);

    return () => clearTimeout(timeout);
  }, [value, count, index]);

  const displayValue = useTransform(count, (latest) => formatter(Math.round(latest)));

  return (
    <Card className="p-4 flex flex-col items-center justify-center space-y-2 hover:shadow-md transition-shadow">
      <div className="text-primary/80">{icon}</div>
      <motion.div 
        className="text-2xl font-bold"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ 
          duration: 0.5,
          delay: 0.5 + index * 0.2,
          ease: [0, 0.71, 0.2, 1.01]
        }}
      >
        <motion.span>
          {displayValue}
        </motion.span>
      </motion.div>
      <div className="text-sm text-muted-foreground text-center">{label}</div>
    </Card>
  );
});

function ResearchSummaryPlaceholder() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {[...Array(5)].map((_, i) => (
        <Card key={i} className="p-4 flex flex-col items-center justify-center space-y-2">
          <div className="w-6 h-6 rounded-full bg-muted animate-pulse" />
          <div className="h-8 w-16 bg-muted rounded animate-pulse" />
          <div className="h-4 w-24 bg-muted rounded animate-pulse" />
        </Card>
      ))}
    </div>
  );
}

function ChartPlaceholder() {
  return (
    <div>
      <div className="mb-4">
        <div className="h-6 w-64 bg-muted rounded animate-pulse mb-2" />
        <div className="h-4 w-full bg-muted rounded animate-pulse" />
      </div>
      <div className="h-[400px] w-full bg-muted/50 rounded animate-pulse" />
    </div>
  );
}

// Memoized ResearchSummary
const ResearchSummary = memo(function ResearchSummary({ 
  companyId, 
  data, 
  isLoading, 
  error 
}: { 
  companyId: number | null;
  data: ResearchSummaryData | null;
  isLoading: boolean;
  error: string | null;
}) {
  if (!companyId || isLoading) {
    return <ResearchSummaryPlaceholder />;
  }

  if (error || !data) {
    return (
      <div className="text-sm text-muted-foreground text-red-500">
        {error || 'No data available'}
      </div>
    );
  }

  const metrics = [
    { value: data.uniqueQueries, label: 'Unique Queries', icon: <Search className="w-6 h-6" /> },
    { value: data.totalResponses, label: 'AI Responses', icon: <MessageSquare className="w-6 h-6" /> },
    { value: data.uniquePersonas, label: 'Personas Analyzed', icon: <Users className="w-6 h-6" /> },
    { value: data.uniqueVerticals, label: 'Industry Verticals', icon: <Building2 className="w-6 h-6" /> },
    { value: data.uniqueRegions, label: 'Geographic Regions', icon: <Globe2 className="w-6 h-6" /> }
  ];

  return (
    <AnimatePresence>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 + index * 0.2 }}
          >
            <MetricCard {...metric} index={index} />
          </motion.div>
        ))}
      </div>
    </AnimatePresence>
  );
});

// Add new interfaces for processed data
interface ProcessedMetricData {
  date: string;
  label: string;
  metrics: { [engine: string]: MetricValues };
  records: ExtendedResponseAnalysis[];
  activeMetric: MetricKey;
  [engine: string]: number | string | any; // Update type to handle new fields
}

interface ProcessedData {
  sentiment: ProcessedMetricData[];
  position: ProcessedMetricData[];
  company_mentioned: ProcessedMetricData[];
  feature_score: ProcessedMetricData[];
}

// Add back the CustomTooltip interface and component
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    color: string;
    name: string;
    dataKey: string;
    payload: ProcessedMetricData;
  }>;
  label?: string;
  formatter: (value: number) => string;
}

// Add helper for response count formatting
function formatResponseCount(count: number): string {
  return `${count} ${count === 1 ? 'response' : 'responses'}`;
}

// Calculate total responses for a group
function getTotalResponses(metrics: { [engine: string]: MetricValues }): number {
  return Object.values(metrics).reduce((sum, engineMetrics) => sum + (engineMetrics.count || 0), 0);
}

// Add stage constants for clarity
const PROBLEM_EXPLORATION = 'problem_exploration';
const SOLUTION_EDUCATION = 'solution_education';
const SOLUTION_COMPARISON = 'solution_comparison';
const FINAL_RESEARCH = 'final_research';
const SOLUTION_EVALUATION = 'solution_evaluation';

// Update response count calculation to be metric-specific
function getMetricSpecificResponses(
  metrics: { [engine: string]: MetricValues },
  activeMetric: MetricKey,
  records: ExtendedResponseAnalysis[]
): number {
  // Filter records based on metric type
  const filteredRecords = records.filter(record => {
    const stage = record.buying_journey_stage;
    
    switch (activeMetric) {
      case 'company_mentioned':
        return stage === PROBLEM_EXPLORATION || stage === SOLUTION_EDUCATION;
      
      case 'position':
        return stage === SOLUTION_COMPARISON || stage === FINAL_RESEARCH;
      
      case 'feature_score':
        return stage === SOLUTION_EVALUATION;
      
      case 'sentiment':
        return true; // All stages count for sentiment
      
      default:
        return false;
    }
  });

  // Count responses per engine and sum them up
  return Object.entries(metrics).reduce((total, [engine, engineMetrics]) => {
    const engineRecords = filteredRecords.filter(
      record => DB_ENGINE_MAP[record.answer_engine?.toLowerCase() || ''] === engine
    );
    return total + engineRecords.length;
  }, 0);
}

// Update CustomTooltip to use metric-specific counting
const CustomTooltip = ({ active, payload, label, formatter }: CustomTooltipProps) => {
  if (!active || !payload || !payload.length || !label) return null;

  const firstPayload = payload[0]?.payload;
  const metrics = firstPayload?.metrics || {};
  const records = firstPayload?.records || [];
  const activeMetric = firstPayload?.activeMetric as MetricKey;
  
  const totalResponses = getMetricSpecificResponses(metrics, activeMetric, records);

  return (
    <div className="rounded-lg border bg-white px-3 py-2 shadow-md max-w-[280px]">
      <div className="flex flex-col gap-1 mb-2 border-b pb-2">
        <p className="text-sm font-medium text-foreground truncate">
          {label}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatResponseCount(totalResponses)}
        </p>
      </div>
      <div className="space-y-1.5">
        {payload?.map((entry: any) => (
          entry.value !== null && (
            <div key={entry.dataKey} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 min-w-0">
                <div 
                  className="w-2 h-2 shrink-0 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm text-muted-foreground truncate">{entry.name}</span>
              </div>
              <span className="text-sm font-medium tabular-nums shrink-0">
                {formatter(entry.value)}
              </span>
            </div>
          )
        ))}
      </div>
    </div>
  );
};

// New types for sorting functionality
type SortingMode = 'batch' | 'week' | 'month';

const METRIC_ICONS = {
  sentiment: <Brain className="w-4 h-4" />,
  position: <Target className="w-4 h-4" />,
  company_mentioned: <Building2 className="w-4 h-4" />,
  feature_score: <Activity className="w-4 h-4" />
};

const TIME_PERIOD_OPTIONS = [
  { value: 'batch', label: 'By Batch', icon: <Route className="w-4 h-4" /> },
  { value: 'week', label: 'By Week', icon: <FileText className="w-4 h-4" /> },
  { value: 'month', label: 'By Month', icon: <Calendar className="w-4 h-4" /> }
];

// Add hierarchical data types
interface HierarchicalMetrics {
  total: MetricValues;
  byRegion: { [region: string]: MetricValues };
  byVertical: { [vertical: string]: MetricValues };
  byPersona: { [persona: string]: MetricValues };
  byQuery: { [queryId: string]: MetricValues };
}

interface GroupMetrics {
  [engine: string]: HierarchicalMetrics;
}

// Add helper function for hierarchical metric processing
function processHierarchicalMetrics(
  records: ExtendedResponseAnalysis[],
  engine: string
): HierarchicalMetrics {
  const metrics: HierarchicalMetrics = {
    total: {
      sentiment: 0,
      position: 0,
      company_mentioned: 0,
      feature_score: 0,
      count: 0
    },
    byRegion: {},
    byVertical: {},
    byPersona: {},
    byQuery: {}
  };

  // Process each metric at each level
  Object.keys(METRICS).forEach(metricKey => {
    const metric = METRICS[metricKey as MetricKey];
    const validRecords = records.filter(record => {
      const isValidPhase = !metric.allowedPhases || metric.allowedPhases.includes(record.buying_journey_stage || '');
      const isValidEngine = record.answer_engine && 
        DB_ENGINE_MAP[record.answer_engine.toLowerCase()] === engine;
      return isValidPhase && isValidEngine;
    });

    // Process by query
    const queryGroups = groupBy(validRecords, r => r.query_id?.toString() || 'unknown');
    Object.entries(queryGroups).forEach(([queryId, queryRecords]) => {
      if (!metrics.byQuery[queryId]) {
        metrics.byQuery[queryId] = createEmptyMetricValues();
      }
      const { value, count } = calculateMetricValue(queryRecords, metricKey as MetricKey);
      if (count > 0) {
        metrics.byQuery[queryId][metricKey as keyof MetricValues] = value / count;
        metrics.byQuery[queryId].count = Math.max(metrics.byQuery[queryId].count, count);
      }
    });

    // Process by persona
    const personaGroups = groupBy(validRecords, r => r.buyer_persona || 'unknown');
    Object.entries(personaGroups).forEach(([persona, personaRecords]) => {
      if (!metrics.byPersona[persona]) {
        metrics.byPersona[persona] = createEmptyMetricValues();
      }
      const { value, count } = calculateMetricValue(personaRecords, metricKey as MetricKey);
      if (count > 0) {
        metrics.byPersona[persona][metricKey as keyof MetricValues] = value / count;
        metrics.byPersona[persona].count = Math.max(metrics.byPersona[persona].count, count);
      }
    });

    // Process by vertical
    const verticalGroups = groupBy(validRecords, r => r.icp_vertical || 'unknown');
    Object.entries(verticalGroups).forEach(([vertical, verticalRecords]) => {
      if (!metrics.byVertical[vertical]) {
        metrics.byVertical[vertical] = createEmptyMetricValues();
      }
      const { value, count } = calculateMetricValue(verticalRecords, metricKey as MetricKey);
      if (count > 0) {
        metrics.byVertical[vertical][metricKey as keyof MetricValues] = value / count;
        metrics.byVertical[vertical].count = Math.max(metrics.byVertical[vertical].count, count);
      }
    });

    // Process by region
    const regionGroups = groupBy(validRecords, r => r.geographic_region || 'unknown');
    Object.entries(regionGroups).forEach(([region, regionRecords]) => {
      if (!metrics.byRegion[region]) {
        metrics.byRegion[region] = createEmptyMetricValues();
      }
      const { value, count } = calculateMetricValue(regionRecords, metricKey as MetricKey);
      if (count > 0) {
        metrics.byRegion[region][metricKey as keyof MetricValues] = value / count;
        metrics.byRegion[region].count = Math.max(metrics.byRegion[region].count, count);
      }
    });

    // Calculate total metrics
    const { value, count } = calculateMetricValue(validRecords, metricKey as MetricKey);
    if (count > 0) {
      metrics.total[metricKey as keyof MetricValues] = value / count;
      metrics.total.count = Math.max(metrics.total.count, count);
    }
  });

  return metrics;
}

// Helper function to create empty metric values
function createEmptyMetricValues(): MetricValues {
  return {
    sentiment: 0,
    position: 0,
    company_mentioned: 0,
    feature_score: 0,
    count: 0
  };
}

// Helper function to group records
function groupBy<T>(array: T[], key: (item: T) => string): { [key: string]: T[] } {
  return array.reduce((groups, item) => {
    const groupKey = key(item);
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {} as { [key: string]: T[] });
}

// Helper function to calculate metric value
function calculateMetricValue(
  records: ExtendedResponseAnalysis[],
  metricKey: MetricKey
): { value: number; count: number } {
  const metric = METRICS[metricKey];
  const values = records
    .map(record => metric.processValue(record))
    .filter((value): value is number => value !== null);

  return {
    value: values.reduce((sum, val) => sum + val, 0),
    count: values.length
  };
}

// Update the group processing function to use hierarchical metrics
function processGroup(
  records: ExtendedResponseAnalysis[],
  engines: string[]
): { [engine: string]: MetricValues } {
  console.log('--- Debug: Processing Group ---');
  console.log('Total records:', records.length);
  
  const hierarchicalMetrics: { [engine: string]: HierarchicalMetrics } = {};

  engines.forEach(engine => {
    console.log(`\nProcessing engine: ${engine}`);
    const engineRecords = records.filter(record => 
      DB_ENGINE_MAP[record.answer_engine?.toLowerCase() || ''] === engine
    );
    console.log(`Records for ${engine}:`, engineRecords.length);
    
    // Debug position values for this engine
    const positionValues = engineRecords
      .map(r => r.ranking_position)
      .filter(p => p !== null);
    console.log(`Position values for ${engine}:`, positionValues);
    
    hierarchicalMetrics[engine] = processHierarchicalMetrics(engineRecords, engine);
    console.log(`Processed metrics for ${engine}:`, hierarchicalMetrics[engine].total);
  });

  // Convert hierarchical metrics to flat metrics for chart display
  const result = Object.entries(hierarchicalMetrics).reduce((acc, [engine, metrics]) => {
    if (metrics.total.count > 0) {
      acc[engine] = metrics.total;
    }
    return acc;
  }, {} as { [engine: string]: MetricValues });

  console.log('Final processed metrics:', result);
  return result;
}

// Add batch date formatter
const BATCH_DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  hour12: true
});

// Update getCurrentMetricData to include records for response counting
function getCurrentMetricData(
  data: ProcessedDataByMode,
  sortingMode: SortingMode,
  activeMetric: MetricKey
): ProcessedMetricData[] {
  const groups = data[sortingMode];
  if (!groups.length) return [];

  return groups.map(group => {
    let label: string;
    if (isBatchGroup(group)) {
      const date = parseDate(group.date);
      label = date ? BATCH_DATE_FORMATTER.format(date) : 'N/A';
    } else {
      label = group.label || 'N/A';
    }

    const result: ProcessedMetricData = {
      date: isBatchGroup(group) ? group.date : group.startDate,
      label,
      metrics: group.metrics,
      records: group.records, // Include the raw records
      activeMetric, // Include the active metric type
    };

    Object.entries(group.metrics).forEach(([engine, metrics]) => {
      if (metrics[activeMetric] !== undefined && metrics[activeMetric] !== null) {
        result[engine] = metrics[activeMetric];
      }
    });

    return result;
  });
}

function isValidMetricValue(value: number | undefined | null): value is number {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

const METRIC_DESCRIPTIONS = {
  company_mentioned: "Measures how frequently your company is mentioned in general product/solution queries. A higher percentage indicates stronger AI recognition and relevance of your product.",
  position: "When AI engines compare and rank solutions, this shows your average ranking position. Lower numbers are better, indicating your solution ranks higher in competitive comparisons.",
  feature_score: "Percentage of 'YES' responses when AI is asked about specific features of your product. Higher scores indicate better feature recognition and coverage by AI engines.",
  sentiment: "A sophisticated analysis of how positively AI discusses your product, considering context, comparisons, and technical evaluations. Factors include praise strength, technical recognition, market positioning, and comparative advantages. Scores range from -1 (very negative) to 1 (very positive)."
};

const METRICS_INFO = {
  company_mentioned: {
    title: "Company Mentioned",
    description: "Measures how frequently your company is mentioned in general product/solution queries. A higher percentage indicates stronger AI recognition and relevance of your product."
  },
  position: {
    title: "Average Position",
    description: "When AI engines compare and rank solutions, this shows your average ranking position. Lower numbers are better, indicating your solution ranks higher in competitive comparisons."
  },
  feature_score: {
    title: "Feature Score",
    description: "Percentage of 'YES' responses when AI is asked about specific features of your product. Higher scores indicate better feature recognition and coverage by AI engines."
  },
  sentiment: {
    title: "Average Sentiment",
    description: "A sophisticated analysis of how positively AI discusses your product, considering context, comparisons, and technical evaluations. Factors include praise strength, technical recognition, market positioning, and comparative advantages. Scores range from -1 (very negative) to 1 (very positive)."
  }
};

export function EngineMetricsChart({ 
  companyId, 
  accountId
}: EngineMetricsChartProps) {
  const selectedCompanyId = useDashboardStore(state => state.selectedCompanyId)
  const effectiveCompanyId = companyId ?? selectedCompanyId
  const [activeMetric, setActiveMetric] = useState<MetricKey>('company_mentioned');
  const [visibleEngines, setVisibleEngines] = useState<string[]>(Object.keys(ENGINE_NAMES));
  const [rawData, setRawData] = useState<ExtendedResponseAnalysis[]>([]);
  const [processedData, setProcessedData] = useState<ProcessedData>({
    sentiment: [],
    position: [],
    company_mentioned: [],
    feature_score: []
  });
  
  const [sortingMode, setSortingMode] = useState<SortingMode>('batch');
  const [processedDataByMode, setProcessedDataByMode] = useState<ProcessedDataByMode>({
    batch: [],
    week: [],
    month: []
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use the custom hook for research data
  const researchData = useResearchData(effectiveCompanyId);

  // Move processDataByMode inside the component as a memoized callback
  const processDataByMode = useCallback((data: ExtendedResponseAnalysis[]) => {
    if (!data.length) return;

    const batchGroups: { [key: string]: BatchGroup } = {};
    const weekGroups: { [key: string]: TimeGroup } = {};
    const monthGroups: { [key: string]: TimeGroup } = {};

    const uniqueEngines = Array.from(
      new Set(
        data.map(record => DB_ENGINE_MAP[record.answer_engine?.toLowerCase() || ''])
          .filter(Boolean)
      )
    );

    // Sort data chronologically
    const sortedData = [...data].sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateA - dateB;
    });

    // Process each record
    sortedData.forEach((record: ExtendedResponseAnalysis) => {
      const recordDate = new Date(record.created_at);
      
      // Process batch groups
      if (record.analysis_batch_id) {
        const batchKey = record.analysis_batch_id;
        if (!batchGroups[batchKey]) {
          const batchRecords = data.filter(r => r.analysis_batch_id === batchKey);
          batchGroups[batchKey] = {
            type: 'batch',
            batchId: batchKey,
            date: record.created_at,
            metrics: processGroup(batchRecords, uniqueEngines),
            records: batchRecords
          };
        }
      }

      // Process week groups
      const weekStart = new Date(recordDate);
      weekStart.setUTCHours(0, 0, 0, 0);
      weekStart.setUTCDate(weekStart.getUTCDate() - weekStart.getUTCDay() + 1); // Start from Monday
      const weekEnd = new Date(weekStart);
      weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
      weekEnd.setUTCHours(23, 59, 59, 999);
      
      const weekKey = weekStart.toISOString();

      if (!weekGroups[weekKey]) {
        const weekRecords = data.filter((r: ExtendedResponseAnalysis) => {
          const rDate = new Date(r.created_at);
          return rDate >= weekStart && rDate <= weekEnd;
        });
        
        if (weekRecords.length > 0) {
          weekGroups[weekKey] = {
            type: 'time',
            startDate: weekStart.toISOString(),
            endDate: weekEnd.toISOString(),
            label: getWeekLabel(recordDate),
            metrics: processGroup(weekRecords, uniqueEngines),
            records: weekRecords
          };
        }
      }

      // Process month groups
      const monthStart = new Date(recordDate.getUTCFullYear(), recordDate.getUTCMonth(), 1);
      monthStart.setUTCHours(0, 0, 0, 0);
      const monthEnd = new Date(recordDate.getUTCFullYear(), recordDate.getUTCMonth() + 1, 0);
      monthEnd.setUTCHours(23, 59, 59, 999);
      
      const monthKey = monthStart.toISOString();

      if (!monthGroups[monthKey]) {
        const monthRecords = data.filter((r: ExtendedResponseAnalysis) => {
          const rDate = new Date(r.created_at);
          return rDate >= monthStart && rDate <= monthEnd;
        });
        
        if (monthRecords.length > 0) {
          monthGroups[monthKey] = {
            type: 'time',
            startDate: monthStart.toISOString(),
            endDate: monthEnd.toISOString(),
            label: getMonthLabel(monthStart),
            metrics: processGroup(monthRecords, uniqueEngines),
            records: monthRecords
          };
        }
      }
    });

    // Update state with processed data
    setProcessedDataByMode({
      batch: Object.values(batchGroups)
        .sort((a: BatchGroup, b: BatchGroup) => new Date(a.date).getTime() - new Date(b.date).getTime()),
      week: Object.values(weekGroups)
        .sort((a: TimeGroup, b: TimeGroup) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()),
      month: Object.values(monthGroups)
        .sort((a: TimeGroup, b: TimeGroup) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    });
  }, []);

  // Fetch raw data only when companyId changes
  useEffect(() => {
    async function fetchData() {
      if (!effectiveCompanyId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const { data, error: supabaseError } = await createClient()
          .from('response_analysis')
          .select(`
            created_at,
            sentiment_score,
            ranking_position,
            company_mentioned,
            solution_analysis,
            answer_engine,
            buying_journey_stage,
            query_id,
            analysis_batch_id,
            icp_vertical,
            geographic_region,
            buyer_persona
          `)
          .eq('company_id', effectiveCompanyId)
          .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
          .order('created_at', { ascending: true });

        if (supabaseError) throw supabaseError;
        setRawData(data as ExtendedResponseAnalysis[] || []);
        
        // Process data for all modes
        processDataByMode(data as ExtendedResponseAnalysis[] || []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data');
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [effectiveCompanyId, processDataByMode]);

  // Get current data for chart
  const currentData = useMemo(() => {
    return getCurrentMetricData(processedDataByMode, sortingMode, activeMetric);
  }, [processedDataByMode, sortingMode, activeMetric]);

  // Get current metric config
  const currentMetric = METRICS[activeMetric];

  if (!effectiveCompanyId) {
    return (
      <div className="space-y-6">
        <Card className="w-full bg-white shadow-sm">
          <div className="p-6">
            <h3 className="text-lg font-semibold">Research Coverage</h3>
            <div className="h-[200px] w-full flex items-center justify-center text-muted-foreground">
              Please select a company to view metrics
            </div>
          </div>
        </Card>
        <Card className="w-full bg-white shadow-sm">
          <div className="p-6">
            <h3 className="text-lg font-semibold">AI Engine Performance Over Time</h3>
            <div className="h-[400px] w-full flex items-center justify-center text-muted-foreground">
              Please select a company to view metrics
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Research Coverage Card */}
      <Card className="w-full bg-white shadow-sm">
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-2xl font-semibold tracking-tight">Research Coverage</h3>
            <p className="text-sm text-muted-foreground mt-1">Analysis scope for your company across AI platforms</p>
          </div>
          <ResearchSummary 
            companyId={effectiveCompanyId}
            data={researchData.data}
            isLoading={researchData.isLoading}
            error={researchData.error}
          />
        </div>
      </Card>

      {/* AI Engine Performance Card */}
      <Card className="w-full bg-white shadow-sm">
        <div className="p-6">
          {isLoading ? (
            <ChartPlaceholder />
          ) : error ? (
            <div className="h-[400px] w-full flex items-center justify-center text-muted-foreground">
              {error}
            </div>
          ) : currentData.length > 0 ? (
            <>
              <div className="flex flex-col space-y-6 mb-8">
                <div className="flex items-center justify-between">
                  <div className="space-y-1.5">
                    <h3 className="text-2xl font-semibold tracking-tight">AI Engine Performance Over Time</h3>
                    <p className="text-sm text-muted-foreground">{currentMetric.description}</p>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <button
                        type="button"
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 w-9"
                      >
                        <Info className="h-4 w-4" />
                        <span className="sr-only">View metrics information</span>
                      </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle className="text-xl font-semibold tracking-tight">Understanding Your Metrics</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-6 pt-4">
                        {Object.entries(METRICS_INFO).map(([key, { title, description }]) => (
                          <div key={key} className="space-y-2">
                            <div className="flex items-center gap-2">
                              {METRIC_ICONS[key as MetricKey]}
                              <h4 className="font-medium leading-none tracking-tight">{title}</h4>
                            </div>
                            <p className="text-sm text-muted-foreground">{description}</p>
                          </div>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="flex items-center justify-between">
                  {/* Metric Selection */}
                  <Tabs
                    value={activeMetric}
                    onValueChange={(value) => setActiveMetric(value as MetricKey)}
                    className="w-auto"
                  >
                    <TabsList className="bg-muted/10 p-1 h-9 rounded-lg">
                      {Object.entries(METRICS).map(([key, { label }]) => (
                        <TabsTrigger
                          key={key}
                          value={key}
                          className={cn(
                            "px-3 h-7 rounded-md transition-all duration-200",
                            "text-sm font-medium",
                            "data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm",
                            "data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:bg-muted/5",
                            "flex items-center gap-1.5"
                          )}
                        >
                          {METRIC_ICONS[key as MetricKey]}
                          {label}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>

                  {/* Time Period Selection */}
                  <Tabs
                    value={sortingMode}
                    onValueChange={(value) => setSortingMode(value as SortingMode)}
                    className="w-auto"
                  >
                    <TabsList className="bg-muted/10 p-1 h-9 rounded-lg">
                      {TIME_PERIOD_OPTIONS.map(({ value, label, icon }) => (
                        <TabsTrigger
                          key={value}
                          value={value}
                          className={cn(
                            "px-3 h-7 rounded-md transition-all duration-200",
                            "text-sm font-medium",
                            "data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm",
                            "data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:bg-muted/5",
                            "flex items-center gap-1.5"
                          )}
                        >
                          {icon}
                          {label}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                </div>
              </div>

              {/* Chart Area with adjusted padding */}
              <div className="w-full rounded-lg border bg-gradient-to-b from-white to-muted/5 p-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${activeMetric}-${sortingMode}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="w-full aspect-[21/9] max-h-[500px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={currentData}
                        margin={{ top: 20, right: 20, left: 40, bottom: 20 }}
                      >
                        <CartesianGrid 
                          strokeDasharray="3 3" 
                          stroke="hsl(var(--muted))" 
                          horizontal={true}
                          vertical={false}
                          opacity={0.1}
                        />
                        <XAxis
                          dataKey="label"
                          stroke="hsl(var(--muted-foreground))"
                          axisLine={false}
                          tickLine={false}
                          dy={10}
                          tick={{ 
                            fill: "hsl(var(--muted-foreground))",
                            fontSize: 12 
                          }}
                          padding={{ left: 20, right: 20 }}
                        />
                        <YAxis
                          tickFormatter={currentMetric.valueFormatter}
                          domain={currentMetric.domain}
                          ticks={currentMetric.yAxisConfig?.ticks}
                          reversed={activeMetric === 'position'}
                          stroke="hsl(var(--muted-foreground))"
                          axisLine={false}
                          tickLine={false}
                          dx={-10}
                          tick={{ 
                            fill: "hsl(var(--muted-foreground))",
                            fontSize: 12 
                          }}
                          width={35}
                          tickMargin={12}
                          scale="linear"
                          orientation="left"
                          interval={0}
                          allowDataOverflow={false}
                          allowDecimals={false}
                          minTickGap={5}
                        />
                        <RechartsTooltip
                          content={<CustomTooltip formatter={currentMetric.valueFormatter} />}
                          cursor={{ 
                            stroke: 'hsl(var(--muted))',
                            strokeWidth: 1,
                            strokeDasharray: '3 3',
                            opacity: 0.2
                          }}
                        />
                        <Legend
                          content={({ payload }) => (
                            <div className="flex items-center justify-center gap-6 mt-6">
                              {payload?.map((entry: any) => (
                                <div 
                                  key={entry.value} 
                                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/5 hover:bg-muted/10 transition-colors"
                                >
                                  <div 
                                    className="w-2 h-2 rounded-full" 
                                    style={{ backgroundColor: entry.color }}
                                  />
                                  <span className="text-sm font-medium text-muted-foreground">
                                    {entry.value}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        />
                        {Object.keys(ENGINE_NAMES)
                          .filter(engine => visibleEngines.includes(engine))
                          .map((engine, index) => (
                            <Line
                              key={engine}
                              type="monotoneX"
                              dataKey={engine}
                              name={ENGINE_NAMES[engine]}
                              stroke={ENGINE_COLORS[engine] || ENGINE_COLORS.default}
                              strokeWidth={2}
                              dot={{ 
                                r: 3,
                                strokeWidth: 2,
                                fill: '#fff',
                                stroke: ENGINE_COLORS[engine] || ENGINE_COLORS.default,
                                opacity: 0.8
                              }}
                              activeDot={{ 
                                r: 6, 
                                strokeWidth: 2,
                                fill: ENGINE_COLORS[engine] || ENGINE_COLORS.default,
                                stroke: '#fff'
                              }}
                              connectNulls={true}
                              animationBegin={index * 200}
                              animationDuration={1500}
                              animationEasing="ease-out"
                            />
                          ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </motion.div>
                </AnimatePresence>
              </div>
            </>
          ) : (
            <div className="h-[400px] w-full flex items-center justify-center text-muted-foreground">
              No data available for the selected company
            </div>
          )}
        </div>
      </Card>
    </div>
  );
} 