"use client"

import * as React from "react"
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { QueryCard } from "../queries/query-card"
import { PhaseMetrics } from "../queries/phase-metrics"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { PHASE_ORDER, PHASE_LABELS, type Query } from "../../types/query-types"
import { useQueries } from "../../lib/hooks/use-queries"

interface QueryPhase {
  stage: string;
  queries: Query[];
}

interface QueriesProps {
  companyId: number | null
  selectedRegion: string
  selectedVertical: string
  selectedPersona: string
  onBack: () => void
}

export function Queries({ 
  companyId, 
  selectedRegion, 
  selectedVertical,
  selectedPersona,
  onBack 
}: QueriesProps) {
  const [expandedPhase, setExpandedPhase] = useState<string | null>(null)
  const { data, isLoading, error } = useQueries(companyId, selectedRegion, selectedVertical, selectedPersona)

  const togglePhase = (phase: string) => {
    setExpandedPhase(currentPhase => currentPhase === phase ? null : phase)
  }

  // Error state
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load query analysis data. Please try again later.
        </AlertDescription>
      </Alert>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-24" />
          </div>
        </div>

        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6">
            <Skeleton className="h-6 w-48 mb-4" />
            <div className="space-y-4">
              {[1, 2].map((j) => (
                <Card key={j} className="p-4">
                  <Skeleton className="h-6 w-full" />
                </Card>
              ))}
            </div>
          </Card>
        ))}
      </div>
    )
  }

  // No data state
  if (!data?.length) {
    return (
      <div className="space-y-6">
        <Alert>
          <AlertDescription>
            No query analysis data available for this persona.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Calculate totals
  const totalResponses = data.reduce((total: number, phase: QueryPhase) => {
    return total + phase.queries.reduce((sum: number, query: Query) => {
      return sum + Object.keys(query.engineResults).length
    }, 0)
  }, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end mb-6">
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="text-sm">
            {data.reduce((sum: number, phase: QueryPhase) => sum + phase.queries.length, 0)} queries
          </Badge>
          <Badge variant="secondary" className="text-sm">
            {totalResponses} responses
          </Badge>
        </div>
      </div>

      <div className="space-y-4">
        {PHASE_ORDER.map((phase, index) => {
          const phaseData = data.find((p: QueryPhase) => p.stage === phase)
          if (!phaseData?.queries.length) return null

          return (
            <Card key={phase}>
              <button
                onClick={() => togglePhase(phase)}
                className="w-full flex items-center gap-4 p-3 text-left hover:bg-accent/30 transition-colors"
              >
                <div className="relative flex items-center">
                  <div className={cn(
                    "h-6 w-6 rounded-full flex items-center justify-center text-xs font-medium transition-colors duration-200",
                    expandedPhase === phase
                      ? "bg-primary text-primary-foreground"
                      : "bg-primary/20 text-primary"
                  )}>
                    {index + 1}
                  </div>
                  {index < PHASE_ORDER.length - 1 && (
                    <div className="absolute left-1/2 top-6 h-8 w-[2px] bg-primary/20" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <h3 className="text-sm font-semibold">
                        {PHASE_LABELS[phase]}
                      </h3>
                      <PhaseMetrics phase={phase} queries={phaseData.queries} />
                    </div>
                    <div className="flex items-center gap-4">
                      <QueryCount 
                        count={phaseData.queries.reduce((sum: number, query: Query) => 
                          sum + Object.keys(query.engineResults).length, 0
                        )}
                        total={totalResponses}
                      />
                      <div className="shrink-0">
                        {expandedPhase === phase ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </button>

              <AnimatePresence mode="wait">
                {expandedPhase === phase && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="p-3 pt-0 space-y-2">
                      {phaseData.queries.map((query: Query) => (
                        <QueryCard 
                          key={`${query.id}-${query.buyerJourneyPhase}`} 
                          query={query}
                          showCompanyMention={phase === 'problem_exploration' || phase === 'solution_education'}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

interface QueryCountProps {
  count: number;
  total: number;
}

function QueryCount({ count, total }: QueryCountProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="px-2 py-0.5 bg-primary/10 rounded-full flex items-center gap-1.5">
        <span className="text-xs font-medium">{count}</span>
        <span className="text-xs text-muted-foreground">/</span>
        <span className="text-xs text-muted-foreground">{total}</span>
        <span className="text-xs text-muted-foreground">responses</span>
      </div>
      <div className="h-1.5 w-32 bg-primary/10 rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary rounded-full transition-all duration-500"
          style={{ width: `${(count / total) * 100}%` }}
        />
      </div>
    </div>
  )
} 