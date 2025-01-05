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

// Add all necessary interfaces and types
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

// Add helper components
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

// Add RegionsView component
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

// Add RegionCard component
interface RegionCardProps {
  region: string;
  metrics: {
    avgSentiment: number;
    avgPosition: number | null;
    companyMentioned: number;
    featureScore: number;
    totalQueries: number;
  };
  isExpanded: boolean;
  onClick: (region: string) => void;
  totalRegionQueries: number;
  isSelected: boolean;
}

function RegionCard({ 
  region, 
  metrics,
  isExpanded,
  onClick,
  totalRegionQueries,
  isSelected 
}: RegionCardProps) {
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

export function NewBuyingJourneyAnalysis({ companyId }: Props) {
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