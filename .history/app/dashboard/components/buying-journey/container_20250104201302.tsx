'use client'

import { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { ViewType, ProgressStep } from './progress-header'
import { TimeSegment, Selection, BuyingJourneyState } from './types'
import { ProgressHeader } from './progress-header'

interface ContainerProps {
  companyId: number;
  currentBatchId?: string;
}

const DEFAULT_STATE: BuyingJourneyState = {
  currentView: 'company',
  selection: {},
  timeSegment: null,
  metrics: {}
};

function useProgressSteps(state: BuyingJourneyState): ProgressStep[] {
  return [
    {
      id: 'company',
      title: 'Company Overview',
      icon: 'BarChart3',
      data: state.metrics.company ? {
        name: 'Company Overview',
        metrics: state.metrics.company
      } : undefined
    },
    {
      id: 'region',
      title: 'Region Selection',
      icon: 'Globe',
      data: state.selection.region ? {
        name: state.selection.region,
        metrics: state.metrics[`region-${state.selection.region}`]
      } : undefined
    },
    {
      id: 'vertical',
      title: 'Vertical Selection',
      icon: 'Building2',
      data: state.selection.vertical ? {
        name: state.selection.vertical,
        metrics: state.metrics[`vertical-${state.selection.vertical}`]
      } : undefined
    },
    {
      id: 'persona',
      title: 'Persona Selection',
      icon: 'User',
      data: state.selection.persona ? {
        name: state.selection.persona,
        metrics: state.metrics[`persona-${state.selection.persona}`]
      } : undefined
    },
    {
      id: 'queries',
      title: 'Queries Analysis',
      icon: 'Search'
    }
  ];
}

function getNextView(current: ViewType): ViewType {
  const order: ViewType[] = ['company', 'region', 'vertical', 'persona', 'queries'];
  const currentIndex = order.indexOf(current);
  return order[currentIndex + 1] || current;
}

export function BuyingJourneyContainer({ companyId, currentBatchId }: ContainerProps) {
  const [state, setState] = useState<BuyingJourneyState>(DEFAULT_STATE);
  
  // Handle step selection
  const handleStepClick = (step: ViewType) => {
    setState(prev => ({
      ...prev,
      currentView: step,
      // Clear selections after the selected step
      selection: Object.fromEntries(
        Object.entries(prev.selection).filter(([key]) => {
          const steps: Record<string, ViewType> = {
            region: 'region',
            vertical: 'vertical',
            persona: 'persona'
          };
          return steps[key] <= step;
        })
      )
    }));
  };

  // Handle selection in each view
  const handleSelection = (type: keyof Selection, id: string, metrics?: ViewMetrics) => {
    setState(prev => ({
      ...prev,
      currentView: getNextView(prev.currentView),
      selection: {
        ...prev.selection,
        [type]: id
      },
      metrics: metrics ? {
        ...prev.metrics,
        [`${type}-${id}`]: metrics
      } : prev.metrics
    }));
  };

  // Get progress steps
  const steps = useProgressSteps(state);

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <ProgressHeader
          steps={steps}
          currentStep={state.currentView}
          onStepClick={handleStepClick}
        />

        <AnimatePresence mode="wait">
          {/* Views will be rendered here based on currentView */}
          {/* This will be implemented in the next step */}
        </AnimatePresence>
      </div>
    </Card>
  );
} 