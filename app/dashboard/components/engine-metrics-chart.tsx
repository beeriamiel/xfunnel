'use client'

import { useState, useEffect, useMemo, memo, useCallback } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { createClient } from '@/app/supabase/client';
import { Activity, Users, Building2, Globe2, Search, MessageSquare, Brain, Target, Route, FileText, Calendar } from 'lucide-react';
import { motion, AnimatePresence, useSpring, useMotionValue, useTransform } from 'framer-motion';

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
  industry_vertical: string | null;
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
  companyId?: number | null;
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
  industry_vertical: string | null;
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

interface BatchGroup extends BaseGroup {
  type: 'batch';
  batchId: string;
  date: string;
}

interface TimeGroup extends BaseGroup {
  type: 'time';
  startDate: string;
  endDate: string;
  label: string;
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
  perplexity: '#ff6b6b',     // Brighter coral
  claude: '#12b886',         // Mint
  gemini: '#4c6ef5',         // Indigo
  searchgpt: '#fcc419',      // Yellow
  aio: '#ff922b',           // Orange
  default: '#adb5bd'        // Gray
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

// Add proper date handling utilities
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

// Update the date formatting functions
const formatDate = (date: string) => {
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) {
      console.warn('Invalid date:', date);
      return 'Invalid Date';
    }
    return SHORT_MONTH_FORMATTER.format(d);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

const formatTooltipDate = (date: string) => {
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) {
      console.warn('Invalid date:', date);
      return 'Invalid Date';
    }
    return DATE_FORMATTER.format(d);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

// Add a function to get the start of the week
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Add a function to get the end of the week
function getWeekEnd(date: Date): Date {
  const d = new Date(getWeekStart(date));
  d.setDate(d.getDate() + 6);
  d.setHours(23, 59, 59, 999);
  return d;
}

// Update the week number calculation
const getWeekNumber = (date: Date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNumber = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return weekNumber;
};

// Update the week label formatting
const getWeekLabel = (date: Date) => {
  const weekStart = getWeekStart(date);
  const weekEnd = getWeekEnd(date);
  return `${SHORT_MONTH_FORMATTER.format(weekStart)} Week ${getWeekNumber(date)}`;
};

// Update the month label formatting
const getMonthLabel = (date: Date) => {
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
            industry_vertical,
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
          uniqueVerticals: new Set(summaryData.map(d => d.industry_vertical)).size,
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
    <div className="mb-8">
      <div className="mb-4">
        <div className="h-6 w-48 bg-muted rounded animate-pulse mb-2" />
        <div className="h-4 w-96 bg-muted rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="p-4 flex flex-col items-center justify-center space-y-2">
            <div className="w-6 h-6 rounded-full bg-muted animate-pulse" />
            <div className="h-8 w-16 bg-muted rounded animate-pulse" />
            <div className="h-4 w-24 bg-muted rounded animate-pulse" />
          </Card>
        ))}
      </div>
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
      <div className="mb-8">
        <div className="mb-4">
          <h4 className="text-lg font-semibold">Research Coverage</h4>
          <p className="text-sm text-muted-foreground text-red-500">
            {error || 'No data available'}
          </p>
        </div>
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
    <div className="mb-8">
      <div className="mb-4">
        <h4 className="text-lg font-semibold">Research Coverage</h4>
        <p className="text-sm text-muted-foreground">Analysis scope for your company across AI platforms</p>
      </div>
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
    </div>
  );
});

// Add new interfaces for processed data
interface ProcessedMetricData {
  date: string;
  [engine: string]: number | string | undefined;
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

const CustomTooltip = ({ active, payload, label, formatter }: CustomTooltipProps) => {
  if (!active || !payload || !payload.length || !label) return null;

  return (
    <div className="rounded-lg border bg-white px-3 py-2 shadow-md">
      <p className="text-sm font-medium text-foreground mb-1.5">
        {formatTooltipDate(label)}
      </p>
      <div className="space-y-1">
        {payload.map((entry, index) => (
          entry.value !== null && (
            <div key={index} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <div 
                  className="w-1.5 h-1.5 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm text-muted-foreground">{entry.name}</span>
              </div>
              <span className="text-sm font-medium tabular-nums">{formatter(entry.value)}</span>
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
    const verticalGroups = groupBy(validRecords, r => r.industry_vertical || 'unknown');
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

// Add debug logs to getCurrentMetricData
function getCurrentMetricData(
  data: ProcessedDataByMode,
  sortingMode: SortingMode,
  activeMetric: MetricKey
): ProcessedMetricData[] {
  const groups = data[sortingMode];
  if (!groups.length) return [];

  if (activeMetric === 'position') {
    console.log('--- Debug: Chart Data Processing ---');
    console.log('Sorting mode:', sortingMode);
    console.log('Number of groups:', groups.length);
  }

  const result = groups.map(group => {
    const result: ProcessedMetricData = {
      date: isBatchGroup(group) ? group.date : group.startDate,
      label: isBatchGroup(group) ? formatDate(group.date) : group.label
    };

    Object.entries(group.metrics).forEach(([engine, metrics]) => {
      if (metrics[activeMetric] !== undefined && metrics[activeMetric] !== null) {
        result[engine] = metrics[activeMetric];
      }
    });

    if (activeMetric === 'position') {
      console.log(`Group ${result.label} metrics:`, result);
    }

    return result;
  });

  if (activeMetric === 'position') {
    console.log('Final chart data:', result);
  }

  return result;
}

function isValidMetricValue(value: number | undefined | null): value is number {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

export function EngineMetricsChart({ companyId }: EngineMetricsChartProps) {
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
  const researchData = useResearchData(companyId);

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

    const sortedData = [...data].sort((a, b) => 
      new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
    );

    sortedData.forEach(record => {
      if (!record.created_at) return;

      const date = new Date(record.created_at);
      if (isNaN(date.getTime())) {
        console.warn('Invalid date in record:', record);
        return;
      }

      if (record.analysis_batch_id) {
        const batchKey = record.analysis_batch_id;
        if (!batchGroups[batchKey]) {
          batchGroups[batchKey] = {
            type: 'batch',
            batchId: batchKey,
            date: record.created_at,
            metrics: {}
          };
        }
        const batchRecords = data.filter(r => r.analysis_batch_id === batchKey);
        batchGroups[batchKey].metrics = processGroup(batchRecords, uniqueEngines);
      }

      const weekStart = getWeekStart(date);
      const weekEnd = getWeekEnd(date);
      const weekKey = weekStart.toISOString();

      if (!weekGroups[weekKey]) {
        weekGroups[weekKey] = {
          type: 'time',
          startDate: weekStart.toISOString(),
          endDate: weekEnd.toISOString(),
          label: getWeekLabel(date),
          metrics: {}
        };
      }

      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
      const monthKey = monthStart.toISOString();

      if (!monthGroups[monthKey]) {
        monthGroups[monthKey] = {
          type: 'time',
          startDate: monthStart.toISOString(),
          endDate: monthEnd.toISOString(),
          label: getMonthLabel(date),
          metrics: {}
        };
      }
    });

    Object.keys(weekGroups).forEach(weekKey => {
      const group = weekGroups[weekKey];
      const periodRecords = data.filter(r => {
        if (!r.created_at) return false;
        const recordDate = new Date(r.created_at);
        return recordDate >= new Date(group.startDate) && 
               recordDate <= new Date(group.endDate);
      });
      group.metrics = processGroup(periodRecords, uniqueEngines);
    });

    Object.keys(monthGroups).forEach(monthKey => {
      const group = monthGroups[monthKey];
      const periodRecords = data.filter(r => {
        if (!r.created_at) return false;
        const recordDate = new Date(r.created_at);
        return recordDate >= new Date(group.startDate) && 
               recordDate <= new Date(group.endDate);
      });
      group.metrics = processGroup(periodRecords, uniqueEngines);
    });

    setProcessedDataByMode({
      batch: Object.values(batchGroups)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
      week: Object.values(weekGroups)
        .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()),
      month: Object.values(monthGroups)
        .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    });
  }, []);

  // Fetch raw data only when companyId changes
  useEffect(() => {
    async function fetchData() {
      if (!companyId) {
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
            analysis_batch_id
          `)
          .eq('company_id', companyId)
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
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
  }, [companyId, processDataByMode]);

  // Get current data for chart
  const currentData = useMemo(() => {
    return getCurrentMetricData(processedDataByMode, sortingMode, activeMetric);
  }, [processedDataByMode, sortingMode, activeMetric]);

  // Get current metric config
  const currentMetric = METRICS[activeMetric];

  if (!companyId) {
    return (
      <div className="w-full bg-white rounded-lg border shadow-sm">
        <div className="p-6">
          <h3 className="text-lg font-semibold">AI Engine Performance Over Time</h3>
          <div className="h-[400px] w-full flex items-center justify-center text-muted-foreground">
            Please select a company to view metrics
          </div>
        </div>
      </div>
    );
  }

  // Add this inside the chart rendering section, before the ResponsiveContainer
  if (activeMetric === 'position' && currentData.length > 0) {
    console.log('--- Debug: Chart Rendering ---');
    console.log('Current metric:', activeMetric);
    console.log('Domain:', currentMetric.domain);
    console.log('Ticks:', currentMetric.yAxisConfig?.ticks);
    console.log('Data points:', currentData);
  }

  return (
    <div className="w-full bg-white rounded-xl border shadow-lg">
      <div className="p-8">
        <ResearchSummary 
          companyId={companyId}
          data={researchData.data}
          isLoading={researchData.isLoading}
          error={researchData.error}
        />
        
        {isLoading ? (
          <ChartPlaceholder />
        ) : error ? (
          <div className="h-[400px] w-full flex items-center justify-center text-muted-foreground">
            {error}
          </div>
        ) : currentData.length > 0 ? (
          <>
            <div className="flex flex-col space-y-6 mb-8">
              <div className="space-y-1.5">
                <h3 className="text-xl font-semibold text-foreground">AI Engine Performance Over Time</h3>
                <p className="text-sm text-muted-foreground">{currentMetric.description}</p>
              </div>

              <div className="flex items-center justify-between">
                {/* Metric Selection */}
                <div className="flex items-center border rounded-lg p-1 bg-muted/5">
                  {Object.entries(METRICS).map(([key, { label }]) => (
                    <button
                      key={key}
                      onClick={() => setActiveMetric(key as MetricKey)}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200",
                        "text-sm font-medium",
                        "hover:bg-muted/10",
                        activeMetric === key
                          ? "bg-white text-primary shadow-sm"
                          : "text-muted-foreground"
                      )}
                    >
                      {METRIC_ICONS[key as MetricKey]}
                      {label}
                    </button>
                  ))}
                </div>

                {/* Time Period Selection */}
                <div className="border-l pl-6 ml-6">
                  <Tabs
                    value={sortingMode}
                    onValueChange={(value) => setSortingMode(value as SortingMode)}
                    className="w-auto"
                  >
                    <TabsList className="grid grid-cols-3 p-1 bg-muted/5">
                      {TIME_PERIOD_OPTIONS.map(({ value, label, icon }) => (
                        <TabsTrigger
                          key={value}
                          value={value}
                          className={cn(
                            "flex items-center gap-2 px-4 py-2",
                            "data-[state=active]:bg-white data-[state=active]:shadow-sm"
                          )}
                        >
                          {icon}
                          <span className="text-sm font-medium">{label}</span>
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                </div>
              </div>
            </div>

            {/* Chart Area */}
            <div className="w-full rounded-lg border bg-gradient-to-b from-white to-muted/5 p-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${activeMetric}-${sortingMode}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="w-full aspect-[21/9] max-h-[400px]"
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
                      <Tooltip
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
    </div>
  );
} 