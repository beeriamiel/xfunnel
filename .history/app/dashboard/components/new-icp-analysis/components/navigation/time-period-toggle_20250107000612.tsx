"use client"

import * as React from "react"
import { useDashboardStore } from "@/app/dashboard/store"
import { cn } from "@/lib/utils"
import { FileText, Calendar } from "lucide-react"

export function TimePeriodToggle() {
  const { timePeriod, setTimePeriod } = useDashboardStore()

  return (
    <div className="flex items-center space-x-2">
      <div className="bg-muted/10 p-1 rounded-lg flex items-center">
        <button
          onClick={() => setTimePeriod('weekly')}
          className={cn(
            "px-3 h-7 rounded-md transition-all duration-200",
            "text-sm font-medium",
            "flex items-center gap-1.5",
            timePeriod === 'weekly'
              ? "bg-background text-primary shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/5"
          )}
        >
          <FileText className="h-4 w-4" />
          By Week
        </button>
        <button
          onClick={() => setTimePeriod('monthly')}
          className={cn(
            "px-3 h-7 rounded-md transition-all duration-200",
            "text-sm font-medium",
            "flex items-center gap-1.5",
            timePeriod === 'monthly'
              ? "bg-background text-primary shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/5"
          )}
        >
          <Calendar className="h-4 w-4" />
          By Month
        </button>
      </div>
    </div>
  )
} 