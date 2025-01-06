'use client'

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { Globe, Building2, User, Search, BarChart3, ChevronRight } from "lucide-react"
import { Card } from "@/components/ui/card"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"

export type ViewType = 'company' | 'region' | 'vertical' | 'persona' | 'queries'

export interface ViewMetrics {
  sentiment: number;
  position: number | null;
  mentions: number;
  features: number;
  totalQueries: number;
}

export interface ProgressStep {
  id: ViewType;
  title: string;
  icon: typeof Globe;
  data?: {
    name: string;
    metrics?: ViewMetrics;
  };
}

interface ProgressHeaderProps {
  steps: ProgressStep[];
  currentStep: ViewType;
  onStepClick: (step: ViewType) => void;
}

const stepIcons = {
  company: BarChart3,
  region: Globe,
  vertical: Building2,
  persona: User,
  queries: Search,
} as const;

function MetricDisplay({ label, value, format = 'number' }: { 
  label: string; 
  value: number | null; 
  format?: 'number' | 'percentage' 
}) {
  if (value === null) return null;
  
  const formattedValue = format === 'percentage' 
    ? `${Math.round(value)}%`
    : value.toFixed(1);

  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{formattedValue}</span>
    </div>
  );
}

function StepMetrics({ metrics }: { metrics: ViewMetrics }) {
  return (
    <div className="space-y-1">
      <MetricDisplay 
        label="Company Mentions" 
        value={metrics.mentions} 
        format="percentage" 
      />
      <MetricDisplay 
        label="Average Position" 
        value={metrics.position} 
      />
      <MetricDisplay 
        label="Feature Score" 
        value={metrics.features} 
        format="percentage" 
      />
      <MetricDisplay 
        label="Sentiment Score" 
        value={metrics.sentiment} 
        format="percentage" 
      />
      <div className="pt-2 border-t">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Total Queries</span>
          <span className="text-sm font-medium">{metrics.totalQueries}</span>
        </div>
      </div>
    </div>
  );
}

export function ProgressHeader({ steps, currentStep, onStepClick }: ProgressHeaderProps) {
  const currentStepIndex = steps.findIndex(step => step.id === currentStep);
  
  return (
    <div className="relative mb-8">
      {/* Progress Line */}
      <div className="absolute top-1/2 left-0 w-full h-[2px] bg-border -translate-y-1/2" />
      
      {/* Steps */}
      <div className="relative z-10 flex items-center justify-between">
        {steps.map((step, index) => {
          const Icon = stepIcons[step.id];
          const isActive = index === currentStepIndex;
          const isComplete = index < currentStepIndex;
          const isClickable = index <= currentStepIndex;
          
          return (
            <div key={step.id} className="flex items-center">
              {/* Step Card */}
              <HoverCard openDelay={200}>
                <HoverCardTrigger asChild>
                  <Card
                    className={cn(
                      "relative flex items-center gap-2 px-3 py-2 transition-all cursor-pointer",
                      isActive && "border-primary shadow-sm",
                      isComplete && "border-primary/40 bg-primary/5",
                      !isClickable && "opacity-50 cursor-not-allowed"
                    )}
                    onClick={() => isClickable && onStepClick(step.id)}
                  >
                    <div className={cn(
                      "p-1.5 rounded-md transition-colors",
                      isActive && "bg-primary text-primary-foreground",
                      isComplete && "bg-primary/20 text-primary",
                      !isClickable && "bg-muted text-muted-foreground"
                    )}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {step.data?.name || step.title}
                      </p>
                      {step.data?.metrics && (
                        <p className="text-xs text-muted-foreground truncate">
                          {step.data.metrics.totalQueries} queries
                        </p>
                      )}
                    </div>
                  </Card>
                </HoverCardTrigger>
                {step.data?.metrics && (
                  <HoverCardContent side="bottom" align="start" className="w-64">
                    <div className="space-y-2">
                      <h4 className="font-medium leading-none">{step.data.name}</h4>
                      <p className="text-sm text-muted-foreground">Metrics Overview</p>
                      <StepMetrics metrics={step.data.metrics} />
                    </div>
                  </HoverCardContent>
                )}
              </HoverCard>

              {/* Connector */}
              {index < steps.length - 1 && (
                <div className="flex-1 px-2">
                  <ChevronRight 
                    className={cn(
                      "h-4 w-4 text-muted-foreground/50",
                      isComplete && "text-primary/50"
                    )} 
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
} 