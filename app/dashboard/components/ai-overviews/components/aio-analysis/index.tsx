'use client'

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { AnalysisTable } from "./analysis-table"
import { BatchProgress } from "./batch-progress"
import { analyzeTerms } from "@/lib/services/ai-overview-analysis"
import type { AIOverviewResult } from "@/lib/services/ai-overview-analysis/types"

interface AIOAnalysisProps {
  companyId: number
  accountId: string
  isSuperAdmin: boolean
}

export function AIOAnalysis({ companyId, accountId, isSuperAdmin }: AIOAnalysisProps) {
  const [selectedTerms, setSelectedTerms] = useState<number[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [total, setTotal] = useState(0)
  const [results, setResults] = useState<AIOverviewResult[]>([])

  const handleStartAnalysis = async () => {
    if (selectedTerms.length === 0) return
    
    try {
      setIsAnalyzing(true)
      setProgress(0)
      setTotal(selectedTerms.length)
      setResults([])

      await analyzeTerms(
        selectedTerms,
        companyId,
        accountId,
        (progress) => {
          setProgress(progress.completed)
          setResults(progress.results)
        },
        isSuperAdmin
      )

      toast.success('Analysis completed successfully')
    } catch (error) {
      console.error('Analysis error:', error)
      toast.error('Failed to complete analysis')
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">AI Overview Analysis</h3>
          <p className="text-sm text-muted-foreground">
            Select terms to analyze their presence in AI overviews
          </p>
        </div>
        <Button 
          onClick={handleStartAnalysis}
          disabled={selectedTerms.length === 0 || isAnalyzing}
        >
          {isAnalyzing ? 'Analyzing...' : 'Check AI Overviews'}
        </Button>
      </div>

      {isAnalyzing && (
        <BatchProgress 
          progress={progress} 
          total={total}
        />
      )}

      <Card className="p-4">
        <AnalysisTable
          companyId={companyId}
          accountId={accountId}
          isSuperAdmin={isSuperAdmin}
          selectedTerms={selectedTerms}
          onSelectionChange={setSelectedTerms}
          results={results}
        />
      </Card>
    </div>
  )
} 