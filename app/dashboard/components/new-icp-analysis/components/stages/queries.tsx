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
  companyId: number | null;
  accountId: string;
  selectedRegion: string;
  selectedVertical: string;
  selectedPersona: string;
  onBack: () => void;
  onQueriesCount?: (queryCount: number, responseCount: number) => void;
}

export function Queries({ 
  companyId, 
  accountId,
  selectedRegion, 
  selectedVertical,
  selectedPersona,
  onBack,
  onQueriesCount 
}: QueriesProps) {
  const [expandedPhase, setExpandedPhase] = useState<string | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const { data, isLoading, error } = useQueries(
    companyId,
    accountId,
    selectedRegion,
    selectedVertical,
    selectedPersona
  )
  const previousCounts = React.useRef<{ queries: number; responses: number } | null>(null)

  // Memoize the calculations
  const totals = React.useMemo(() => {
    if (!data?.length) return null

    const totalQueries = data.reduce((sum: number, phase: QueryPhase) => sum + phase.queries.length, 0)
    const totalResponses = data.reduce((total: number, phase: QueryPhase) => {
      return total + phase.queries.reduce((sum: number, query: Query) => {
        return sum + Object.keys(query.engineResults).length
      }, 0)
    }, 0)

    return { queries: totalQueries, responses: totalResponses }
  }, [data])

  // Update parent with counts only when they change
  React.useEffect(() => {
    if (totals && onQueriesCount) {
      const prev = previousCounts.current
      if (!prev || prev.queries !== totals.queries || prev.responses !== totals.responses) {
        previousCounts.current = totals
        onQueriesCount(totals.queries, totals.responses)
      }
    }
  }, [totals, onQueriesCount])

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 200)
    return () => clearTimeout(timer)
  }, [])

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

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-end mb-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-4"
        >
          <Badge variant="secondary" className="text-sm bg-purple-50/50 hover:bg-purple-50/80 transition-all">
            {totals?.queries} queries
          </Badge>
          <Badge variant="secondary" className="text-sm bg-purple-50/50 hover:bg-purple-50/80 transition-all">
            {totals?.responses} responses
          </Badge>
        </motion.div>
      </div>

      <div className="space-y-4">
        {PHASE_ORDER.map((phase, index) => {
          const phaseData = data?.find((p: QueryPhase) => p.stage === phase)
          if (!phaseData?.queries.length) return null

          return (
            <motion.div
              key={phase}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
              transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
            >
              <Card className="group overflow-hidden border-none bg-white/50 hover:bg-purple-50/30 transition-all duration-300">
                <button
                  onClick={() => togglePhase(phase)}
                  className="w-full flex items-center gap-4 p-3 text-left transition-all duration-300"
                >
                  <div className="relative flex items-center">
                    <motion.div 
                      className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300",
                        expandedPhase === phase
                          ? "bg-purple-100 text-purple-900 shadow-sm"
                          : "bg-purple-50/80 text-purple-800/80 hover:bg-purple-100/80"
                      )}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {index + 1}
                    </motion.div>
                    {index < PHASE_ORDER.length - 1 && (
                      <motion.div 
                        className="absolute left-1/2 top-8 h-8 w-[1px] bg-purple-200/30"
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                      />
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
                          total={totals?.responses || 0}
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
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="p-3 pt-0 space-y-2">
                        {phaseData.queries.map((query: Query, idx: number) => (
                          <motion.div
                            key={`${query.id}-${query.buyerJourneyPhase}`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                          >
                            <QueryCard 
                              query={query}
                              showCompanyMention={phase === 'problem_exploration' || phase === 'solution_education'}
                            />
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}

interface QueryCountProps {
  count: number;
  total: number;
}

function QueryCount({ count, total }: QueryCountProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="px-2 py-0.5 bg-purple-50/50 rounded-full flex items-center gap-1.5">
        <span className="text-xs font-medium text-purple-900/70">{count}</span>
        <span className="text-xs text-purple-600/40">/</span>
        <span className="text-xs text-purple-600/40">{total}</span>
        <span className="text-xs text-purple-600/40">responses</span>
      </div>
      <div className="h-1 w-32 bg-purple-100/30 rounded-full overflow-hidden">
        <motion.div 
          className="h-full bg-purple-200/50 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${(count / total) * 100}%` }}
          transition={{ duration: 0.5, delay: 0.2 }}
        />
      </div>
    </div>
  )
} 