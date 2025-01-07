"use client"

import * as React from "react"
import { useDashboardStore } from "@/app/dashboard/store"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { CalendarDays, CalendarRange } from "lucide-react"

export function TimePeriodToggle() {
  const { timePeriod, setTimePeriod } = useDashboardStore()

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-muted-foreground">Time Period:</span>
      <ToggleGroup
        type="single"
        value={timePeriod}
        className="bg-muted/10 p-1 rounded-lg"
        onValueChange={(value) => {
          if (value) setTimePeriod(value as 'weekly' | 'monthly')
        }}
      >
        <ToggleGroupItem 
          value="weekly" 
          aria-label="Toggle weekly view"
          className="px-4 py-2 rounded-md data-[state=on]:bg-background data-[state=on]:shadow-sm hover:bg-muted/50 transition-colors"
        >
          <CalendarDays className="h-4 w-4 mr-2 opacity-70" />
          Weekly
        </ToggleGroupItem>
        <ToggleGroupItem 
          value="monthly" 
          aria-label="Toggle monthly view"
          className="px-4 py-2 rounded-md data-[state=on]:bg-background data-[state=on]:shadow-sm hover:bg-muted/50 transition-colors"
        >
          <CalendarRange className="h-4 w-4 mr-2 opacity-70" />
          Monthly
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  )
} 