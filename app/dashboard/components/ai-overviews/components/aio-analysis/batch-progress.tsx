'use client'

import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import type { BatchAnalysisProgress } from "../../types"

interface BatchProgressProps {
  progress: number
  total: number
}

export function BatchProgress({ progress, total }: BatchProgressProps) {
  const percentage = Math.round((progress / total) * 100)
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>Analyzing terms...</span>
        <span>{progress} of {total} completed</span>
      </div>
      <Progress value={percentage} className="h-2" />
    </div>
  )
} 