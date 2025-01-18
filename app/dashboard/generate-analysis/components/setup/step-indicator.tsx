'use client'

import { Check, CircleDot } from "lucide-react"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { type Step } from '../../types/setup'

interface StepIndicatorProps {
  currentStep: Step
  completedSteps: Step[]
  onStepClick: (step: Step) => void
}

const STAGE_EXPLANATIONS = {
  initial: "Enter your company details to get started with the analysis process.",
  product: "Define your product offerings and their key features.",
  competitors: "Identify and analyze your main competitors in the market.",
  icps: "Generate and refine your Ideal Customer Profiles (ICPs) based on market data.",
  personas: "Create detailed buyer personas aligned with your ICPs."
} as const;

export function StepIndicator({ 
  currentStep, 
  completedSteps,
  onStepClick 
}: StepIndicatorProps) {
  const canAccessStep = (step: Step) => {
    const stepOrder: Step[] = ['initial', 'product', 'competitors', 'icps', 'personas']
    const currentIndex = stepOrder.indexOf(currentStep)
    const targetIndex = stepOrder.indexOf(step)
    
    return targetIndex <= currentIndex || completedSteps.includes(step)
  }

  const steps = [
    { id: 'initial' as const, label: 'Company' },
    { id: 'product' as const, label: 'Product' },
    { id: 'competitors' as const, label: 'Competitors' },
    { id: 'icps' as const, label: 'ICPs' },
    { id: 'personas' as const, label: 'Personas' }
  ]

  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => {
        const isCompleted = steps.indexOf(step) < steps.findIndex(s => s.id === currentStep)
        const isCurrent = currentStep === step.id
        const isClickable = isCompleted || isCurrent

        return (
          <div key={step.id} className="flex items-center">
            <HoverCard>
              <HoverCardTrigger asChild>
                <div 
                  className={cn(
                    "flex items-center cursor-default transition-all duration-200",
                    isClickable && "cursor-pointer"
                  )}
                  onClick={() => isClickable && onStepClick(step.id)}
                  role={isClickable ? "button" : undefined}
                  tabIndex={isClickable ? 0 : undefined}
                >
                  <div
                    className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-200",
                      isCurrent
                        ? "border-[#30035e] bg-[#30035e] text-white hover:bg-[#30035e]/90"
                        : isCompleted
                        ? "border-[#f9a8c9] bg-[#f9a8c9] text-white hover:bg-[#f9a8c9]/90"
                        : "border-muted-foreground/30 text-muted-foreground"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <CircleDot className="h-4 w-4" />
                    )}
                  </div>
                  <span
                    className={cn(
                      "mx-2 text-sm transition-colors duration-200",
                      isCurrent
                        ? "text-[#30035e] font-medium"
                        : isCompleted
                        ? "text-[#f9a8c9]"
                        : "text-muted-foreground"
                    )}
                  >
                    {step.label}
                  </span>
                </div>
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <div className="flex justify-between space-x-4">
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold">{step.label}</h4>
                    <p className="text-sm text-muted-foreground">
                      {STAGE_EXPLANATIONS[step.id]}
                      {isCompleted && " Click to edit."}
                    </p>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
            {index < steps.length - 1 && (
              <Separator
                className={cn(
                  "w-8 mx-2 transition-colors duration-200",
                  steps.indexOf(step) < steps.findIndex(s => s.id === currentStep)
                    ? "bg-[#f9a8c9]"
                    : "bg-muted-foreground/30"
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
} 