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

// ... [Keep all the interfaces, types, and helper functions exactly the same] ...

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