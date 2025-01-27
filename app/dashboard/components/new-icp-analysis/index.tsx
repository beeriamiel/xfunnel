"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { useDashboardStore } from "@/app/dashboard/store"
import { Card } from "@/components/ui/card"
import { Building2, Globe2, Users, Target, Search } from "lucide-react"
import { StageProgressCards } from "./components/navigation/stage-progress-cards"
import { TotalCompany } from "./components/stages/total-company"
import { Regions } from "./components/stages/regions"
import { Verticals } from "./components/stages/verticals"
import { Personas } from "./components/stages/personas"
import { Queries } from "./components/stages/queries"
import { useSearchParams } from "next/navigation"

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
    label: 'Company',
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

export interface NewICPAnalysisProps {
  companyId?: number;
  accountId: string;
}

export function NewICPAnalysis({ companyId, accountId }: NewICPAnalysisProps) {
  const searchParams = useSearchParams()
  const urlCompanyId = searchParams.get('company') ? parseInt(searchParams.get('company')!) : undefined
  const selectedCompanyId = useDashboardStore(state => state.selectedCompanyId)
  const companies = useDashboardStore(state => state.companies)
  
  // Use URL company ID if available, fallback to prop or store
  const effectiveCompanyId = urlCompanyId ?? companyId ?? selectedCompanyId
  
  // Validate that the company exists in our data
  const isValidCompany = effectiveCompanyId && companies?.some(c => c.id === effectiveCompanyId)
  
  const [currentStage, setCurrentStage] = useState<AnalysisStage>('total-company')
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
  const [selectedVertical, setSelectedVertical] = useState<string | null>(null)
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null)
  const [queryCounts, setQueryCounts] = useState<{ queries: number; responses: number } | null>(null)

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

  // Handle query counts update
  const handleQueriesCount = (queryCount: number, responseCount: number) => {
    setQueryCounts({ queries: queryCount, responses: responseCount })
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

  // Ensure we have a valid company ID that exists in our data
  if (!effectiveCompanyId || !isValidCompany) {
    return (
      <Card className="w-full bg-white shadow-sm">
        <div className="p-6">
          <h3 className="text-lg font-semibold">ICP Analysis</h3>
          <div className="h-[200px] w-full flex items-center justify-center text-muted-foreground">
            {!effectiveCompanyId ? 'Please select a company to view ICP analysis' : 'Invalid company selected'}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 border-none bg-gradient-to-br from-white to-primary/5">
        <div className="mb-8">
          <div className="flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-semibold tracking-tight">ICP Analysis</h2>
          </div>
          <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
            Analyze your company&apos;s performance across regions, verticals, and personas to optimize your targeting strategy
          </p>
        </div>
        
        <StageProgressCards 
          currentStage={currentStage}
          onStageSelect={setCurrentStage}
          selectedRegion={selectedRegion}
          selectedVertical={selectedVertical}
          selectedPersona={selectedPersona}
          queryCounts={queryCounts}
        />
        
        <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {currentStage === 'total-company' && <TotalCompany companyId={effectiveCompanyId} accountId={accountId} />}
          {currentStage === 'regions' && <Regions companyId={effectiveCompanyId} accountId={accountId} onSelectRegion={handleRegionSelect} />}
          {currentStage === 'verticals' && selectedRegion && <Verticals companyId={effectiveCompanyId} accountId={accountId} selectedRegion={selectedRegion} onSelectVertical={handleVerticalSelect} onBack={handleBack} />}
          {currentStage === 'personas' && selectedRegion && selectedVertical && <Personas companyId={effectiveCompanyId} accountId={accountId} selectedRegion={selectedRegion} selectedVertical={selectedVertical} onSelectPersona={handlePersonaSelect} onBack={handleBack} />}
          {currentStage === 'queries' && selectedRegion && selectedVertical && selectedPersona && <Queries 
            companyId={effectiveCompanyId} 
            accountId={accountId} 
            selectedRegion={selectedRegion} 
            selectedVertical={selectedVertical} 
            selectedPersona={selectedPersona} 
            onBack={handleBack}
            onQueriesCount={handleQueriesCount}
          />}
        </div>
      </Card>
    </div>
  )
} 