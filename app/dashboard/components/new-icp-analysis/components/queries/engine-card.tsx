"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building2 } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { EngineResult, isEarlyStage } from "../../types/query-types"

interface EngineCardProps {
  engineName: string;
  rank: number | 'n/a';
  rankList?: string | null;
  companyName?: string;
  queryText: string;
  engineResult: EngineResult & {
    mentioned_companies?: string[];
  };
  isEvaluationPhase: boolean;
  phase: string;
  hasData: boolean;
}

export function EngineCard({ 
  engineName, 
  rank, 
  rankList, 
  companyName, 
  queryText,
  engineResult,
  isEvaluationPhase,
  phase,
  hasData
}: EngineCardProps) {
  const showRankingContext = rankList && typeof rank === 'number' && !isEvaluationPhase && !isEarlyStage(phase)
  const solutions = showRankingContext ? rankList.split(/\d+\.\s*/).map(s => s.trim()).filter(Boolean) : []

  const getAnswerColor = (answer: string) => {
    switch (answer) {
      case 'YES':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'NO':
        return 'bg-red-100 text-red-700 border-red-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getAnswerEmoji = (answer: string) => {
    switch (answer) {
      case 'YES':
        return '✨'
      case 'NO':
        return '❌'
      default:
        return '❓'
    }
  }

  return (
    <Card 
      className={cn(
        "p-4 h-full relative group flex flex-col"
      )}
    >
      <div className="flex-1">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium">{engineName}</span>
          {!isEvaluationPhase && !isEarlyStage(phase) && hasData && (
            <div className="flex items-center gap-2">
              {engineResult?.recommended && (
                <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                  Recommended
                </span>
              )}
              <span className={cn(
                "text-sm",
                typeof rank === 'number' 
                  ? 'text-orange-500 font-medium' 
                  : 'text-muted-foreground'
              )}>
                {typeof rank === 'number' ? `#${rank}` : '-'}
              </span>
            </div>
          )}
        </div>
        
        {isEvaluationPhase ? (
          <div className="flex flex-col items-center justify-center py-6 space-y-3">
            <div className="text-3xl">
              {hasData ? getAnswerEmoji(engineResult?.solutionAnalysis?.has_feature || 'N/A') : '❓'}
            </div>
            <div className={cn(
              "px-4 py-2 rounded-full border text-sm font-medium",
              hasData 
                ? getAnswerColor(engineResult?.solutionAnalysis?.has_feature || 'N/A')
                : "bg-gray-100 text-gray-500 border-gray-200"
            )}>
              {hasData 
                ? engineResult?.solutionAnalysis?.has_feature === 'YES' 
                  ? "Yes, it does!"
                  : engineResult?.solutionAnalysis?.has_feature === 'NO' 
                    ? "No, it doesn't"
                    : "I'm not sure"
                : "No Data Available"}
            </div>
          </div>
        ) : isEarlyStage(phase) ? (
          <CompanyMentionIndicator 
            isMentioned={engineResult?.companyMentioned || false} 
            hasData={hasData}
            mentionedCompanies={engineResult?.mentioned_companies}
          />
        ) : showRankingContext ? (
          <>
            <div className="h-[1px] bg-border mb-3" />
            <div className="space-y-2">
              <span className="text-sm text-muted-foreground">Ranking Context:</span>
              <div className="text-sm text-muted-foreground space-y-1">
                {solutions.map((solution, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className={solution === companyName ? 'text-primary font-medium' : ''}>
                      {solution}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : !hasData ? (
          <div className="text-sm text-muted-foreground mt-2">
            Not currently ranked in this platform
          </div>
        ) : null}
      </div>

      {engineResult?.responseText && hasData && (
        <div className="mt-auto pt-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className="w-full text-muted-foreground hover:text-primary hover:bg-primary/5 hover:border-primary/20 transition-colors"
              >
                View Response
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{engineName} Response</DialogTitle>
              </DialogHeader>
              <div className="mt-4 space-y-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm font-medium">Query</p>
                  <p className="text-sm text-muted-foreground mt-1">{queryText}</p>
                </div>
                <div className="space-y-4 text-sm">
                  {engineResult.responseText.split(/(?:\r?\n){2,}/).map((paragraph, i) => (
                    <p key={i} className="text-muted-foreground">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </Card>
  )
}

interface CompanyMentionIndicatorProps {
  isMentioned: boolean;
  hasData: boolean;
  mentionedCompanies?: string[];
}

function CompanyMentionIndicator({ 
  isMentioned, 
  hasData,
  mentionedCompanies
}: CompanyMentionIndicatorProps) {
  return (
    <div className="flex flex-col items-center justify-center py-6 space-y-4">
      <div className={cn(
        "h-12 w-12 rounded-full flex items-center justify-center text-2xl",
        hasData 
          ? isMentioned 
            ? "bg-green-100 text-green-700" 
            : "bg-red-100 text-red-700"
          : "bg-gray-100 text-gray-500"
      )}>
        {hasData ? (isMentioned ? '✓' : '×') : '?'}
      </div>
      <div className={cn(
        "px-5 py-2 rounded-full border text-sm font-medium",
        hasData 
          ? isMentioned 
            ? "bg-green-100 text-green-700 border-green-200" 
            : "bg-red-100 text-red-700 border-red-200"
          : "bg-gray-100 text-gray-500 border-gray-200"
      )}>
        {hasData ? (isMentioned ? "Company Mentioned" : "Not Mentioned") : "No Data Available"}
      </div>
      {hasData && mentionedCompanies && mentionedCompanies.length > 0 && (
        <div className="w-full space-y-3">
          <div className="h-px bg-border/50 w-full" />
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground text-center font-medium">
              {mentionedCompanies.length} {mentionedCompanies.length === 1 ? 'Company' : 'Companies'} {isMentioned ? 'Also ' : ''}Detected
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {mentionedCompanies.slice(0, 3).map((company, index) => (
                <div
                  key={index}
                  className="group relative"
                >
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-b from-muted/30 to-muted/50 hover:from-muted/40 hover:to-muted/60 transition-colors rounded-full">
                    <Building2 className="h-3.5 w-3.5 text-muted-foreground/70" />
                    <span className="text-sm truncate max-w-[120px]" title={company}>
                      {company}
                    </span>
                  </div>
                </div>
              ))}
              {mentionedCompanies.length > 3 && (
                <div className="px-3 py-1.5 bg-primary/5 hover:bg-primary/10 transition-colors text-sm rounded-full font-medium text-primary">
                  +{mentionedCompanies.length - 3} more
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 