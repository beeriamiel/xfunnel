'use client';

import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { JourneyPath, Selection, TimeSegment } from './types';
import { ProgressPath } from './components/navigation/ProgressPath';
import { TimeNavigation } from './components/navigation/TimeNavigation';
import { useTimeSegments } from './hooks/useTimeSegments';
import { useTimeMetrics } from './hooks/useTimeMetrics';
import { useDashboardStore } from '@/app/dashboard/store';
import { CompanyView } from './components/views/CompanyView';
import { AnimatePresence, motion } from 'framer-motion';

interface Props {
  companyId?: number;
}

export function BuyingJourneyAnalysis({ companyId }: Props) {
  const selectedCompanyId = useDashboardStore(state => state.selectedCompanyId);
  const effectiveCompanyId = companyId ?? selectedCompanyId;

  // Time-based state
  const [viewType, setViewType] = useState<'batch' | 'week' | 'month'>('batch');
  const { segments, isLoading: segmentsLoading } = useTimeSegments(effectiveCompanyId, viewType);
  const [currentSegment, setCurrentSegment] = useState<TimeSegment | null>(null);
  
  // Journey path state
  const [selections, setSelections] = useState<JourneyPath>({});
  
  // Time metrics
  const { metrics, isLoading: metricsLoading } = useTimeMetrics(
    effectiveCompanyId, 
    currentSegment!, 
    segments
  );

  // Set initial segment
  useEffect(() => {
    if (segments.length > 0 && !currentSegment) {
      setCurrentSegment(segments[0]);
    }
  }, [segments, currentSegment]);

  const handleViewTypeChange = (type: string) => {
    setViewType(type as 'batch' | 'week' | 'month');
    setCurrentSegment(null);
  };

  const handleSegmentChange = (segment: TimeSegment) => {
    setCurrentSegment(segment);
  };

  const handleSelection = (selection: Selection) => {
    setSelections(prev => {
      const newSelections = { ...prev };
      
      // Clear subsequent selections
      switch (selection.type) {
        case 'region':
          delete newSelections.vertical;
          delete newSelections.persona;
          break;
        case 'vertical':
          delete newSelections.persona;
          break;
      }
      
      // Add new selection
      newSelections[selection.type] = selection.value;
      return newSelections;
    });
  };

  const handleStepClick = (step: keyof JourneyPath) => {
    setSelections(prev => {
      const newSelections = { ...prev };
      
      // Clear selections after the clicked step
      switch (step) {
        case 'region':
          delete newSelections.vertical;
          delete newSelections.persona;
          break;
        case 'vertical':
          delete newSelections.persona;
          break;
      }
      
      return newSelections;
    });
  };

  // Mock data for testing - will be replaced with real data
  const mockRegions = [
    {
      name: 'North America',
      metrics: {
        sentiment: 0.75,
        position: 2.5,
        mentions: 0.65,
        features: 0.82,
        totalResponses: 1250
      }
    },
    {
      name: 'EMEA',
      metrics: {
        sentiment: 0.68,
        position: 3.2,
        mentions: 0.58,
        features: 0.75,
        totalResponses: 980
      }
    },
    {
      name: 'LATAM',
      metrics: {
        sentiment: 0.72,
        position: 2.8,
        mentions: 0.62,
        features: 0.79,
        totalResponses: 750
      }
    }
  ];

  if (segmentsLoading || metricsLoading) {
    return (
      <Card className="p-6">
        <LoadingSkeleton />
      </Card>
    );
  }

  const getCurrentView = () => {
    if (!selections.region) {
      return (
        <CompanyView
          metrics={metrics?.current || {
            sentiment: 0,
            position: null,
            mentions: 0,
            features: 0,
            totalResponses: 0,
            timeComparison: metrics?.changes
          }}
          onSelect={handleSelection}
          regions={mockRegions}
        />
      );
    }

    // Other views will be added in subsequent PRs
    return (
      <div className="min-h-[400px] flex items-center justify-center text-muted-foreground">
        Other views coming soon...
      </div>
    );
  };

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

        <div className="mb-8">
          <ProgressPath 
            selections={selections}
            onStepClick={handleStepClick}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={selections.region || 'company'}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {getCurrentView()}
          </motion.div>
        </AnimatePresence>
      </div>
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-8 w-[300px] bg-muted rounded animate-pulse" />
        <div className="h-4 w-[200px] bg-muted rounded mt-2 animate-pulse" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-6 bg-muted rounded animate-pulse">
            <div className="h-6 w-[120px] bg-background rounded mb-4" />
            <div className="space-y-2">
              <div className="h-4 w-full bg-background rounded" />
              <div className="h-4 w-full bg-background rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 