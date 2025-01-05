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