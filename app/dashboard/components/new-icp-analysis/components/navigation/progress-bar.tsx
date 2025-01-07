"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { STAGES, type AnalysisStage } from "../../index"

interface ProgressBarProps {
  currentStage: AnalysisStage
  onStageSelect: (stage: AnalysisStage) => void
  isStageAccessible?: (stage: AnalysisStage) => boolean
}

export function ProgressBar({
  currentStage,
  onStageSelect,
  isStageAccessible = () => true
}: ProgressBarProps) {
  // Find the index of the current stage
  const currentIndex = STAGES.findIndex(stage => stage.id === currentStage)

  return (
    <div className="relative mb-8">
      {/* Progress Line */}
      <div className="absolute top-1/2 left-0 w-full h-[2px] bg-muted -translate-y-1/2" />
      <div 
        className="absolute top-1/2 left-0 h-[2px] bg-primary -translate-y-1/2 transition-all duration-500"
        style={{
          width: `${(currentIndex / (STAGES.length - 1)) * 100}%`
        }}
      />

      {/* Stage Buttons */}
      <div className="relative z-10 flex justify-between">
        {STAGES.map((stage, index) => {
          const Icon = stage.icon
          const isAccessible = isStageAccessible(stage.id)
          const isCurrent = currentStage === stage.id
          const isCompleted = index < currentIndex

          return (
            <TooltipProvider key={stage.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-10 w-10 rounded-full border-2",
                      isCurrent && "border-primary bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                      isCompleted && "border-primary text-primary",
                      !isAccessible && "opacity-50 cursor-not-allowed",
                      !isCurrent && !isCompleted && "border-muted"
                    )}
                    onClick={() => isAccessible && onStageSelect(stage.id)}
                    disabled={!isAccessible}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="sr-only">{stage.label}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-sm font-medium">{stage.label}</div>
                  <div className="text-xs text-muted-foreground">{stage.description}</div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )
        })}
      </div>

      {/* Stage Labels */}
      <div className="relative z-10 flex justify-between mt-2">
        {STAGES.map((stage) => (
          <div
            key={stage.id}
            className={cn(
              "text-sm font-medium text-center w-20 -ml-10 first:ml-0 last:-ml-20",
              currentStage === stage.id ? "text-primary" : "text-muted-foreground"
            )}
          >
            {stage.label}
          </div>
        ))}
      </div>
    </div>
  )
} 