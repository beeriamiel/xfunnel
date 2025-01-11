'use client'

import { cn } from "@/lib/utils"
import { CompletedStepChip } from "./completed-step-chip"
import type { CompletedStep } from '../../types/shared'

type Step = 'initial' | 'competitors' | 'icps' | 'personas'

interface StepIndicatorProps {
  currentStep: Step
  onStepClick: (step: Step) => void
}

const steps: CompletedStep[] = [
  { 
    type: 'company',
    title: 'Company',
    summary: 'Basic company information'
  },
  { 
    type: 'data',
    title: 'Competitors',
    summary: 'Market competitors'
  },
  { 
    type: 'icps',
    title: 'ICPs',
    summary: 'Ideal Customer Profiles'
  },
  { 
    type: 'personas',
    title: 'Personas',
    summary: 'Customer personas'
  }
]

const stepMapping: Record<Step, string> = {
  initial: 'company',
  competitors: 'data',
  icps: 'icps',
  personas: 'personas'
}

export function StepIndicator({ currentStep, onStepClick }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center w-full max-w-3xl">
      <nav className="flex items-center space-x-2" aria-label="Progress">
        {steps.map((step, stepIdx) => (
          <div key={step.type} className="flex items-center">
            <CompletedStepChip
              step={step}
              isActive={stepMapping[currentStep] === step.type}
              onClick={() => {
                const mappedStep = Object.entries(stepMapping).find(([_, value]) => value === step.type)?.[0] as Step
                if (mappedStep) {
                  onStepClick(mappedStep)
                }
              }}
            />
            {stepIdx !== steps.length - 1 && (
              <div
                className={cn(
                  "h-px w-16 mx-2",
                  stepMapping[currentStep] === step.type
                    ? "bg-primary/30"
                    : "bg-border"
                )}
                aria-hidden="true"
              />
            )}
          </div>
        ))}
      </nav>
    </div>
  )
} 