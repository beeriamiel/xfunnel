"use client"

import * as React from "react"
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { EngineCard } from "./engine-card"
import { Citations } from "./citations"
import { 
  Query, 
  engineDisplayNames, 
  isEarlyStage, 
  transformQueryText 
} from "../../types/query-types"

interface QueryCardProps {
  query: Query;
  showCompanyMention: boolean;
}

export function QueryCard({ query, showCompanyMention }: QueryCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const isEvaluationPhase = query.buyerJourneyPhase === 'solution_evaluation'

  // Always show all engines in the same order
  const orderedEngines = ['perplexity', 'claude', 'gemini', 'searchgpt']

  // Transform the query text for display
  const displayText = transformQueryText(query.text)

  return (
    <Card className={cn(
      "overflow-hidden border-[0.5px] border-border/40 transition-all duration-200 w-full",
      isExpanded && "shadow-[0_1px_3px_rgba(0,0,0,0.05)] ring-1 ring-primary/5 border-l border-l-primary/50"
    )}>
      <div 
        className={cn(
          "px-3 py-2 flex items-center justify-between cursor-pointer transition-colors w-full",
          isExpanded ? "bg-accent/10" : "hover:bg-accent/5"
        )}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className={cn(
              "text-sm tracking-tight line-clamp-2 break-words",
              isExpanded ? "font-medium text-foreground" : "text-muted-foreground"
            )}>
              {displayText}
            </span>
            {showCompanyMention && (
              <div className={cn(
                "px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1.5",
                query.companyMentionRate >= 70 ? "bg-green-100 text-green-700" :
                query.companyMentionRate >= 30 ? "bg-orange-100 text-orange-700" :
                "bg-red-100 text-red-700"
              )}>
                {Math.round(query.companyMentionRate)}%
                <span className="text-xs">
                  {query.companyMentionRate >= 70 ? '✨' :
                   query.companyMentionRate >= 30 ? '⚡' : '⚠️'}
                </span>
              </div>
            )}
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn(
            "h-6 w-6 shrink-0 ml-2 transition-transform duration-200",
            isExpanded && "text-primary"
          )}
        >
          {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        </Button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 border-t">
              <div className="overflow-x-auto">
                <div className="grid grid-cols-4 gap-4 min-w-[800px]">
                  {orderedEngines.map((engineKey) => {
                    const engineResult = query.engineResults[engineKey]
                    const hasData = engineResult && Object.keys(engineResult).length > 0
                    return (
                      <EngineCard
                        key={engineKey}
                        engineName={engineDisplayNames[engineKey]}
                        rank={engineResult?.rank || 'n/a'}
                        rankList={engineResult?.rankList}
                        companyName={query.companyName}
                        queryText={query.text}
                        engineResult={engineResult}
                        isEvaluationPhase={isEvaluationPhase}
                        phase={query.buyerJourneyPhase}
                        hasData={hasData}
                      />
                    )
                  })}
                </div>
              </div>
              <Citations engineResults={query.engineResults} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
} 