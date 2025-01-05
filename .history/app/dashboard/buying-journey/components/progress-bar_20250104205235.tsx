"use client"

import { Building2, Globe, Users, Search, BarChart3 } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { Stage } from "../types"
import { useBuyingJourneyStore } from "../store"

const stages: { id: Stage; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "company", label: "Company", icon: Building2 },
  { id: "region", label: "Region", icon: Globe },
  { id: "vertical", label: "Vertical", icon: BarChart3 },
  { id: "persona", label: "Persona", icon: Users },
  { id: "query", label: "Query", icon: Search },
]

export function ProgressBar() {
  const { currentStage, setStage } = useBuyingJourneyStore()

  return (
    <Tabs value={currentStage} onValueChange={(value) => setStage(value as Stage)} className="w-full">
      <TabsList className="w-full justify-start gap-2 bg-background p-0">
        {stages.map((stage, index) => {
          const Icon = stage.icon
          const isActive = currentStage === stage.id
          const isPast = stages.findIndex(s => s.id === currentStage) > index

          return (
            <div key={stage.id} className="flex items-center">
              {index > 0 && (
                <div 
                  className={cn(
                    "h-[2px] w-8 mx-2",
                    isPast ? "bg-primary" : "bg-border"
                  )}
                />
              )}
              <TabsTrigger
                value={stage.id}
                className={cn(
                  "flex items-center gap-2 rounded-full data-[state=active]:bg-primary",
                  isPast && "bg-primary/20"
                )}
                disabled={!isPast && currentStage !== stage.id}
              >
                <Icon className={cn(
                  "h-4 w-4",
                  isActive && "text-primary-foreground",
                  isPast && !isActive && "text-primary"
                )} />
                <span className={cn(
                  isActive && "text-primary-foreground",
                  isPast && !isActive && "text-primary"
                )}>
                  {stage.label}
                </span>
              </TabsTrigger>
            </div>
          )
        })}
      </TabsList>
    </Tabs>
  )
} 