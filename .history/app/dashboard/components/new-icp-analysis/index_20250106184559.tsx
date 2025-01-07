"use client"

import * as React from "react"
import { useState } from "react"
import { useDashboardStore } from "@/app/dashboard/store"
import { Card } from "@/components/ui/card"
import { Building2, Globe2, Users, Target, Search } from "lucide-react"
import { ProgressBar } from "./components/navigation/progress-bar"
import { TotalCompany } from "./components/stages/total-company"
import { Regions } from "./components/stages/regions"
import { Verticals } from "./components/stages/verticals"
import { Personas } from "./components/stages/personas"
import { Queries } from "./components/stages/queries"

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
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
  const [selectedVertical, setSelectedVertical] = useState<string | null>(null)
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null)

  // Stage accessibility logic
  const isStageAccessible = (stage: AnalysisStage) => {
    const currentIndex = STAGES.findIndex(s => s.id === currentStage)
    const targetIndex = STAGES.findIndex(s => s.id === stage)
    // Allow moving to any completed stage or the next stage
    return targetIndex <= currentIndex + 1
  }

  // Handle region selection
  const handleRegionSelect = (region: string) => {
    setSelectedRegion(region)
    setCurrentStage('verticals')
  }

  // Handle vertical selection
  const handleVerticalSelect = (vertical: string) => {
    setSelectedVertical(vertical)
    setCurrentStage('personas')
  }

  // Handle persona selection
  const handlePersonaSelect = (persona: string) => {
    setSelectedPersona(persona)
    setCurrentStage('queries')
  }

  // Handle back navigation
  const handleBack = () => {
    switch (currentStage) {
      case 'verticals':
        setCurrentStage('regions')
        setSelectedRegion(null)
        break
      case 'personas':
        setCurrentStage('verticals')
        setSelectedVertical(null)
        break
      case 'queries':
        setCurrentStage('personas')
        setSelectedPersona(null)
        break
    }
  }

  // Stage content renderer
  const renderStageContent = () => {
    switch (currentStage) {
      case 'total-company':
        return <TotalCompany companyId={effectiveCompanyId} />
      case 'regions':
        return (
          <Regions 
            companyId={effectiveCompanyId} 
            onSelectRegion={handleRegionSelect}
          />
        )
      case 'verticals':
        return selectedRegion ? (
          <Verticals
            companyId={effectiveCompanyId}
            selectedRegion={selectedRegion}
            onSelectVertical={handleVerticalSelect}
            onBack={handleBack}
          />
        ) : (
          <div>No region selected</div>
        )
      case 'personas':
        return selectedRegion && selectedVertical ? (
          <Personas
            companyId={effectiveCompanyId}
            selectedRegion={selectedRegion}
            selectedVertical={selectedVertical}
            onSelectPersona={handlePersonaSelect}
            onBack={handleBack}
          />
        ) : (
          <div>No vertical selected</div>
        )
      case 'queries':
        return selectedRegion && selectedVertical && selectedPersona ? (
          <Queries
            companyId={effectiveCompanyId}
            selectedRegion={selectedRegion}
            selectedVertical={selectedVertical}
            selectedPersona={selectedPersona}
            onBack={handleBack}
          />
        ) : (
          <div>No persona selected</div>
        )
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