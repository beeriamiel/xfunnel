"use client"

import * as React from "react"
import { useState } from "react"
import { useDashboardStore } from "@/app/dashboard/store"
import { Card } from "@/components/ui/card"
import { Building2, Globe2, Users, Target, Search } from "lucide-react"
import { ProgressBar } from "./components/navigation/progress-bar"
import { TotalCompany } from "./components/stages/total-company"

// Types for the analysis stages
export type AnalysisStage = 
  | 'total-company'
  | 'regions'
  | 'verticals'
  | 'personas'
  | 'queries';

// Configuration for the analysis stages
export const STAGES = [
  {
    id: 'total-company' as const,
    label: 'Total Company',
    description: 'Overall company performance',
    icon: Building2
  },
  {
    id: 'regions' as const,
    label: 'Regions',
    description: 'Performance by geographic region',
    icon: Globe2
  },
  {
    id: 'verticals' as const,
    label: 'Verticals',
    description: 'Performance by industry vertical',
    icon: Target
  },
  {
    id: 'personas' as const,
    label: 'Personas',
    description: 'Performance by buyer persona',
    icon: Users
  },
  {
    id: 'queries' as const,
    label: 'Queries',
    description: 'Performance by search queries',
    icon: Search
  }
] as const;

interface NewICPAnalysisProps {
  companyId?: number | null;
}

export function NewICPAnalysis({ companyId }: NewICPAnalysisProps) {
  // Connect to dashboard store for company selection
  const selectedCompanyId = useDashboardStore(state => state.selectedCompanyId)
  const effectiveCompanyId = companyId ?? selectedCompanyId

  // Stage navigation state
  const [currentStage, setCurrentStage] = useState<AnalysisStage>('total-company')

  // Stage accessibility logic
  const isStageAccessible = (stage: AnalysisStage) => {
    const currentIndex = STAGES.findIndex(s => s.id === currentStage)
    const targetIndex = STAGES.findIndex(s => s.id === stage)
    // Allow moving to any completed stage or the next stage
    return targetIndex <= currentIndex + 1
  }

  // Stage content renderer
  const renderStageContent = () => {
    switch (currentStage) {
      case 'total-company':
        return <TotalCompany companyId={effectiveCompanyId} />
      case 'regions':
        return <div>Regions stage (coming soon)</div>
      case 'verticals':
        return <div>Verticals stage (coming soon)</div>
      case 'personas':
        return <div>Personas stage (coming soon)</div>
      case 'queries':
        return <div>Queries stage (coming soon)</div>
    }
  }

  // Handle no company selected
  if (!effectiveCompanyId) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold tracking-tight">No Company Selected</h2>
          <p className="text-muted-foreground mt-2">Please select a company to view the ICP analysis</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold tracking-tight">ICP Analysis</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Analyze your company&apos;s performance across regions, verticals, and personas
          </p>
        </div>
        
        <ProgressBar 
          currentStage={currentStage}
          onStageSelect={setCurrentStage}
          isStageAccessible={isStageAccessible}
        />
        
        {renderStageContent()}
      </Card>
    </div>
  )
} 