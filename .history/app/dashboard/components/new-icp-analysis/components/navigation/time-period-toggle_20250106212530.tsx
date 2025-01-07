"use client"

import * as React from "react"
import { useDashboardStore } from "@/app/dashboard/store"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { CalendarDays, CalendarRange } from "lucide-react"

export function TimePeriodToggle() {
  const { timePeriod, setTimePeriod } = useDashboardStore()

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-muted-foreground">Time Period:</span>
      <ToggleGroup
        type="single"
        value={timePeriod}
        onValueChange={(value) => {
          if (value) setTimePeriod(value as 'weekly' | 'monthly')
        }}
      >
        <ToggleGroupItem value="weekly" aria-label="Toggle weekly view">
          <CalendarDays className="h-4 w-4 mr-2" />
          Weekly
        </ToggleGroupItem>
        <ToggleGroupItem value="monthly" aria-label="Toggle monthly view">
          <CalendarRange className="h-4 w-4 mr-2" />
          Monthly
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  )
} 