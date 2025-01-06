'use client'

import { cn } from '@/lib/utils'

export type JourneyStage = 'company' | 'region' | 'vertical' | 'persona' | 'queries'

interface ProgressBarProps {
  currentStage: JourneyStage
  completedStages: JourneyStage[]
}

const stages: Array<{
  id: JourneyStage
  label: string
}> = [
  { id: 'company', label: 'Company Overview' },
  { id: 'region', label: 'Region View' },
  { id: 'vertical', label: 'Vertical View' },
  { id: 'persona', label: 'Persona View' },
  { id: 'queries', label: 'Queries' },
]

export function JourneyProgressBar({ currentStage, completedStages }: ProgressBarProps) {
  return (
    <div className="w-full bg-background border-b">
      <div className="container mx-auto py-4">
        <div className="flex items-center justify-between">
          {stages.map((stage, index) => {
            const isCompleted = completedStages.includes(stage.id)
            const isCurrent = currentStage === stage.id
            const isDisabled = !isCompleted && !isCurrent

            return (
              <div key={stage.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                      isCompleted && "bg-primary text-primary-foreground",
                      isCurrent && "bg-primary/20 text-primary border-2 border-primary",
                      isDisabled && "bg-muted text-muted-foreground"
                    )}
                  >
                    {index + 1}
                  </div>
                  <span
                    className={cn(
                      "mt-2 text-sm font-medium",
                      isCurrent && "text-primary",
                      isDisabled && "text-muted-foreground"
                    )}
                  >
                    {stage.label}
                  </span>
                </div>
                {index < stages.length - 1 && (
                  <div
                    className={cn(
                      "h-[2px] w-24 mx-2",
                      isCompleted ? "bg-primary" : "bg-border"
                    )}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
} 