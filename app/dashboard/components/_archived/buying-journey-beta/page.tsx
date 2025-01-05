'use client';

import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDashboardStore } from '@/app/dashboard/store';
import { AnimatePresence, motion } from 'framer-motion';
import { CompanyView } from './views/CompanyView';
import { RegionView } from './views/RegionView';
import { VerticalView } from './views/VerticalView';
import { PersonaView } from './views/PersonaView';
import { useTimeSegments } from '../buying-journey/hooks/useTimeSegments';
import { useTimeMetrics } from '../buying-journey/hooks/useTimeMetrics';
import { TimeSegment } from '../buying-journey/types';

interface Props {
  companyId?: number;
}

export function BuyingJourneyBeta({ companyId }: Props) {
  const selectedCompanyId = useDashboardStore(state => state.selectedCompanyId);
  const effectiveCompanyId = companyId ?? selectedCompanyId;

  // Time-based state
  const [viewType, setViewType] = useState<'batch' | 'week' | 'month'>('batch');
  const { segments, isLoading: segmentsLoading } = useTimeSegments(effectiveCompanyId, viewType);
  const [currentSegment, setCurrentSegment] = useState<TimeSegment | null>(null);
  
  // Navigation state
  const [currentView, setCurrentView] = useState<'company' | 'region' | 'vertical' | 'persona'>('company');
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedVertical, setSelectedVertical] = useState<string | null>(null);
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null);

  // Time metrics
  const { metrics, isLoading: metricsLoading } = useTimeMetrics(
    effectiveCompanyId,
    currentSegment!,
    segments
  );

  if (segmentsLoading || metricsLoading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <div className="h-8 w-[200px] bg-muted rounded animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  const handleTimeChange = (type: 'batch' | 'week' | 'month') => {
    setViewType(type);
    setCurrentSegment(null);
  };

  const handleRegionSelect = (region: string) => {
    setSelectedRegion(region);
    setCurrentView('region');
  };

  const handleVerticalSelect = (vertical: string) => {
    setSelectedVertical(vertical);
    setCurrentView('vertical');
  };

  const handlePersonaSelect = (persona: string) => {
    setSelectedPersona(persona);
    setCurrentView('persona');
  };

  const handleNavigateBack = () => {
    switch (currentView) {
      case 'persona':
        setCurrentView('vertical');
        setSelectedPersona(null);
        break;
      case 'vertical':
        setCurrentView('region');
        setSelectedVertical(null);
        break;
      case 'region':
        setCurrentView('company');
        setSelectedRegion(null);
        break;
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Buying Journey Analysis</h2>
          <p className="text-muted-foreground">Analyze your performance across different time periods</p>
        </div>

        <div className="flex justify-between items-center">
          <Tabs value={viewType} onValueChange={(v) => handleTimeChange(v as any)}>
            <TabsList>
              <TabsTrigger value="batch">Batch</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
            </TabsList>
          </Tabs>

          {currentSegment && (
            <div className="text-sm text-muted-foreground">
              {currentSegment.label} ({currentSegment.totalResponses} responses)
            </div>
          )}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {currentView === 'company' && (
              <CompanyView
                metrics={metrics?.current}
                onRegionSelect={handleRegionSelect}
              />
            )}
            {currentView === 'region' && selectedRegion && (
              <RegionView
                region={selectedRegion}
                onBack={handleNavigateBack}
                onVerticalSelect={handleVerticalSelect}
              />
            )}
            {currentView === 'vertical' && selectedVertical && (
              <VerticalView
                vertical={selectedVertical}
                onBack={handleNavigateBack}
                onPersonaSelect={handlePersonaSelect}
              />
            )}
            {currentView === 'persona' && selectedPersona && (
              <PersonaView
                persona={selectedPersona}
                onBack={handleNavigateBack}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </Card>
  );
} 