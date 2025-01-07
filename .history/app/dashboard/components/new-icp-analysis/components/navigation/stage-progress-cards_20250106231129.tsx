"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { AnalysisStage } from "../../index"
import { TimePeriodToggle } from "./time-period-toggle"

interface StageProgressCardsProps {
  currentStage: AnalysisStage
  selectedRegion: string | null
  selectedVertical: string | null
  selectedPersona: string | null
  onStageSelect: (stage: AnalysisStage) => void
}

interface StageCardProps {
  title: string
  value: string | null
  isActive: boolean
  isComplete: boolean
  isSelectable: boolean
  onClick: () => void
}

function StageCard({ title, value, isActive, isComplete, isSelectable, onClick }: StageCardProps) {
  return (
    <Card 
      className={cn(
        "p-4 min-w-[200px] flex-1 transition-all cursor-pointer hover:bg-accent",
        isActive && "bg-primary/5 ring-2 ring-primary",
        !isSelectable && "opacity-50 cursor-not-allowed hover:bg-transparent"
      )}
      onClick={() => isSelectable && onClick()}
    >
      <div className="text-sm text-muted-foreground">
        {title}
      </div>
      <div className={cn(
        "mt-1 font-medium",
        isActive && "text-primary"
      )}>
        {value || "Select"}
      </div>
    </Card>
  )
}

export function StageProgressCards({
  currentStage,
  selectedRegion,
  selectedVertical,
  selectedPersona,
  onStageSelect,
}: StageProgressCardsProps) {
  // Helper to determine if a stage is selectable
  const isStageSelectable = (stage: AnalysisStage) => {
    switch (stage) {
      case 'total-company':
      case 'regions':
        return true
      case 'verticals':
        return !!selectedRegion
      case 'personas':
        return !!selectedRegion && !!selectedVertical
      case 'queries':
        return !!selectedRegion && !!selectedVertical && !!selectedPersona
    }
  }

  // Helper to determine if a stage is complete
  const isStageComplete = (stage: AnalysisStage) => {
    switch (stage) {
      case 'regions':
        return !!selectedRegion
      case 'verticals':
        return !!selectedVertical
      case 'personas':
        return !!selectedPersona
      default:
        return false
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <StageCard
            title="Total Company"
            value="Overview"
            isActive={currentStage === 'total-company'}
            isComplete={currentStage !== 'total-company'}
            isSelectable={true}
            onClick={() => onStageSelect('total-company')}
          />
          
          <div className="flex items-center">
            <ChevronRight className="h-4 w-4 text-muted-foreground mx-2" />
          </div>

          <StageCard
            title="Geographic Regions"
            value={selectedRegion}
            isActive={currentStage === 'regions'}
            isComplete={!!selectedRegion}
            isSelectable={isStageSelectable('regions')}
            onClick={() => onStageSelect('regions')}
          />
          
          <div className="flex items-center">
            <ChevronRight className="h-4 w-4 text-muted-foreground mx-2" />
          </div>

          <StageCard
            title="Industry Verticals"
            value={selectedVertical}
            isActive={currentStage === 'verticals'}
            isComplete={!!selectedVertical}
            isSelectable={isStageSelectable('verticals')}
            onClick={() => onStageSelect('verticals')}
          />

          <div className="flex items-center">
            <ChevronRight className="h-4 w-4 text-muted-foreground mx-2" />
          </div>

          <StageCard
            title="Buyer Personas"
            value={selectedPersona}
            isActive={currentStage === 'personas'}
            isComplete={!!selectedPersona}
            isSelectable={isStageSelectable('personas')}
            onClick={() => onStageSelect('personas')}
          />

          <div className="flex items-center">
            <ChevronRight className="h-4 w-4 text-muted-foreground mx-2" />
          </div>

          <StageCard
            title="Search Queries"
            value={currentStage === 'queries' ? "124 options" : null}
            isActive={currentStage === 'queries'}
            isComplete={false}
            isSelectable={isStageSelectable('queries')}
            onClick={() => onStageSelect('queries')}
          />
        </div>
      </div>
    </div>
  )
} 