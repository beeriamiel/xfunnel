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

// Add LoadingSkeleton component
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

  return (
    <Card className="p-4">
      <h3 className="text-sm font-medium text-muted-foreground mb-2">{title}</h3>
      <div className="text-2xl font-bold mb-2">{formatValue(value)}</div>
      {change !== undefined && (
        <div className={cn("text-sm", getTrendColor())}>
          {change > 0 ? '+' : ''}{Math.round(change * 100)}%
          {change !== 0 && (
            <span className="text-xs">
              {lowerIsBetter ? (change < 0 ? '↓' : '↑') : (change > 0 ? '↑' : '↓')}
            </span>
          )}
        </div>
      )}
    </Card>
  );
}

// Add RegionsView component
function RegionsView({ 
  companyId,
  currentSegment 
}: { 
  companyId: number;
  currentSegment: TimeSegment | null;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Regions Overview</h2>
        <p className="text-muted-foreground">Click on a region to explore verticals and personas</p>
      </div>
      {/* Placeholder for regions grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
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
  );
}

// Add hooks
function useTimeSegments(companyId: number, type: 'batch' | 'week' | 'month') {
  const [segments, setSegments] = useState<TimeSegment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Placeholder for actual data fetching
    setSegments([
      {
        id: '1',
        type: 'BATCH',
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString(),
        displayName: 'Current Batch'
      }
    ]);
    setIsLoading(false);
  }, [companyId, type]);

  return { segments, isLoading };
}

function useTimeMetrics(companyId: number, segment: TimeSegment, segments: TimeSegment[]) {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Placeholder for actual data fetching
    setMetrics({
      current: {
        sentiment: 0.75,
        position: 2.5,
        mentions: 0.65,
        features: 0.8,
        totalResponses: 100
      }
    });
    setIsLoading(false);
  }, [companyId, segment, segments]);

  return { metrics, isLoading };
}

export function NewBuyingJourneyAnalysis({ companyId }: Props) {
  const selectedCompanyId = useDashboardStore(state => state.selectedCompanyId)
  const effectiveCompanyId = companyId ?? selectedCompanyId
  const [viewType, setViewType] = useState<'batch' | 'week' | 'month'>('batch');
  const { segments, isLoading: segmentsLoading } = useTimeSegments(effectiveCompanyId, viewType);
  const [currentSegment, setCurrentSegment] = useState<TimeSegment | null>(null);
  const { metrics, isLoading: metricsLoading } = useTimeMetrics(effectiveCompanyId, currentSegment!, segments);

  useEffect(() => {
    if (segments.length > 0 && !currentSegment) {
      setCurrentSegment(segments[0]);
    }
  }, [segments]);

  const handleViewTypeChange = (type: string) => {
    setViewType(type as 'batch' | 'week' | 'month');
    setCurrentSegment(null);
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
          <h2 className="text-2xl font-bold tracking-tight">New Buying Journey Analysis</h2>
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