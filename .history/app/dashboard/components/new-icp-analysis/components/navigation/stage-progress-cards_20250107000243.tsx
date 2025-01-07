"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import { ChevronRight, Building2, Globe2, Target, Users, Search, CheckCircle2 } from "lucide-react"
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
  icon: React.ElementType
}

function StageCard({ 
  title, 
  value, 
  isActive, 
  isComplete, 
  isSelectable, 
  onClick,
  icon: Icon 
}: StageCardProps) {
  return (
    <Card 
      className={cn(
        "px-3 py-2 min-w-[180px] flex-1 transition-all duration-200",
        "border-none bg-gray-50/80 hover:bg-gray-100/80",
        isActive && "bg-gray-100 text-gray-900",
        isSelectable ? 
          "cursor-pointer" : 
          "opacity-50 cursor-not-allowed hover:bg-gray-50/80"
      )}
      onClick={() => isSelectable && onClick()}
    >
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Icon className={cn(
          "h-4 w-4",
          isActive && "text-gray-900",
          isComplete && "text-gray-900"
        )} />
        {title}
        {isComplete && (
          <CheckCircle2 className="h-4 w-4 text-gray-900 ml-auto" />
        )}
      </div>
      <div className={cn(
        "mt-1.5 text-sm font-medium transition-colors duration-200",
        isActive ? "text-gray-900" : "text-gray-600"
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
            icon={Building2}
          />
          
          <div className="flex items-center">
            <ChevronRight className="h-4 w-4 text-muted-foreground/50 mx-2" />
          </div>

          <StageCard
            title="Geographic Regions"
            value={selectedRegion}
            isActive={currentStage === 'regions'}
            isComplete={!!selectedRegion}
            isSelectable={isStageSelectable('regions')}
            onClick={() => onStageSelect('regions')}
            icon={Globe2}
          />
          
          <div className="flex items-center">
            <ChevronRight className="h-4 w-4 text-muted-foreground/50 mx-2" />
          </div>

          <StageCard
            title="Industry Verticals"
            value={selectedVertical}
            isActive={currentStage === 'verticals'}
            isComplete={!!selectedVertical}
            isSelectable={isStageSelectable('verticals')}
            onClick={() => onStageSelect('verticals')}
            icon={Target}
          />

          <div className="flex items-center">
            <ChevronRight className="h-4 w-4 text-muted-foreground/50 mx-2" />
          </div>

          <StageCard
            title="Buyer Personas"
            value={selectedPersona}
            isActive={currentStage === 'personas'}
            isComplete={!!selectedPersona}
            isSelectable={isStageSelectable('personas')}
            onClick={() => onStageSelect('personas')}
            icon={Users}
          />

          <div className="flex items-center">
            <ChevronRight className="h-4 w-4 text-muted-foreground/50 mx-2" />
          </div>

          <StageCard
            title="Search Queries"
            value={currentStage === 'queries' ? "124 options" : null}
            isActive={currentStage === 'queries'}
            isComplete={false}
            isSelectable={isStageSelectable('queries')}
            onClick={() => onStageSelect('queries')}
            icon={Search}
          />
        </div>
      </div>
    </div>
  )
} 