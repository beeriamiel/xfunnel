'use client';

import { Building2, Globe, Search, User } from "lucide-react";
import { JourneyPath } from "../../types";
import { cn } from "@/lib/utils";

interface ProgressPathProps {
  selections: JourneyPath;
  onStepClick?: (step: keyof JourneyPath) => void;
}

interface Step {
  key: keyof JourneyPath;
  label: string;
  icon: React.ElementType;
}

const STEPS: Step[] = [
  { key: 'region', label: 'Region', icon: Globe },
  { key: 'vertical', label: 'Vertical', icon: Building2 },
  { key: 'persona', label: 'Persona', icon: User }
];

export function ProgressPath({ selections, onStepClick }: ProgressPathProps) {
  // Calculate the current step (0-based index)
  const getCurrentStep = () => {
    if (!selections.region) return 0;
    if (!selections.vertical) return 1;
    if (!selections.persona) return 2;
    return 3; // All steps completed
  };

  const currentStep = getCurrentStep();

  return (
    <div className="relative">
      {/* Progress Bar */}
      <div className="absolute top-1/2 left-0 w-full h-[2px] bg-border -translate-y-1/2">
        <div 
          className="h-full bg-primary transition-all duration-500"
          style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
        />
      </div>

      {/* Steps */}
      <div className="relative flex justify-between">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isClickable = isCompleted && onStepClick;
          const value = selections[step.key];

          return (
            <div 
              key={step.key}
              className={cn(
                "flex flex-col items-center gap-2",
                isClickable && "cursor-pointer"
              )}
              onClick={() => isClickable && onStepClick?.(step.key)}
            >
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200",
                isCompleted ? "bg-primary text-primary-foreground" :
                isCurrent ? "bg-primary/20 text-primary ring-2 ring-primary" :
                "bg-muted text-muted-foreground"
              )}>
                <Icon className="w-5 h-5" />
              </div>
              
              <div className="flex flex-col items-center">
                <span className="text-sm font-medium">
                  {step.label}
                </span>
                {value && (
                  <span className="text-xs text-muted-foreground">
                    {value}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 