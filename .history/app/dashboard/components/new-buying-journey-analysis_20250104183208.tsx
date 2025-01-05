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
      return value >= 40 ? { color: 'green', icon: '🟢' } :
             value >= 15 ? { color: 'yellow', icon: '🟡' } :
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

// ... existing code ... 