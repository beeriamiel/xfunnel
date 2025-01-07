"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building2, Globe2, Users, Target, Search, ChevronRight } from "lucide-react"
import { motion } from "framer-motion"
import type { AnalysisStage } from "../../index"

interface NavigationCardProps {
  currentStage: AnalysisStage
  selectedRegion: string | null
  selectedVertical: string | null
  selectedPersona: string | null
  onStageSelect: (stage: AnalysisStage) => void
}

export function NavigationCard({
  currentStage,
  selectedRegion,
  selectedVertical,
  selectedPersona,
  onStageSelect,
}: NavigationCardProps) {
  const renderIcon = (stage: AnalysisStage) => {
    switch (stage) {
      case 'total-company':
        return <Building2 className="h-5 w-5" />
      case 'regions':
        return <Globe2 className="h-5 w-5" />
      case 'verticals':
        return <Target className="h-5 w-5" />
      case 'personas':
        return <Users className="h-5 w-5" />
      case 'queries':
        return <Search className="h-5 w-5" />
    }
  }

  const renderContent = () => {
    switch (currentStage) {
      case 'total-company':
        return (
          <div className="flex items-center gap-2">
            <Globe2 className="h-5 w-5 text-primary" />
            <span>Choose a <span className="font-medium text-primary">Region</span> to begin your analysis</span>
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto"
              onClick={() => onStageSelect('regions')}
            >
              Get Started
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )

      case 'regions':
        return (
          <div className="flex items-center gap-2">
            <Globe2 className="h-5 w-5 text-primary" />
            <span>Choose a <span className="font-medium text-primary">Region</span> to analyze performance by geography</span>
          </div>
        )

      case 'verticals':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Globe2 className="h-5 w-5 text-primary" />
              <span>Selected Region: <span className="font-medium text-primary">{selectedRegion}</span></span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <span>Now choose a <span className="font-medium text-primary">Vertical</span> to analyze industry performance</span>
            </div>
          </div>
        )

      case 'personas':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{selectedRegion} → {selectedVertical}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <span>Choose a <span className="font-medium text-primary">Persona</span> to understand buyer profiles</span>
            </div>
          </div>
        )

      case 'queries':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{selectedRegion} → {selectedVertical} → {selectedPersona}</span>
            </div>
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              <span>Explore search queries for this segment</span>
            </div>
          </div>
        )
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-4 bg-muted/50">
        {renderContent()}
      </Card>
    </motion.div>
  )
} 