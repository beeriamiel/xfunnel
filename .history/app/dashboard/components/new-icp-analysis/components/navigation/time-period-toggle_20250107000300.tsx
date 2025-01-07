"use client"

import * as React from "react"
import { useDashboardStore } from "@/app/dashboard/store"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { CalendarDays, CalendarRange } from "lucide-react"

export function TimePeriodToggle() {
  const { timePeriod, setTimePeriod } = useDashboardStore()

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-600">Time Period:</span>
      <ToggleGroup
        type="single"
        value={timePeriod}
        onValueChange={(value) => {
          if (value) setTimePeriod(value as 'weekly' | 'monthly')
        }}
        className="bg-gray-50/80 rounded-lg p-1"
      >
        <ToggleGroupItem 
          value="weekly" 
          aria-label="Toggle weekly view"
          className="data-[state=on]:bg-gray-100 data-[state=on]:text-gray-900 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <CalendarDays className="h-4 w-4 mr-2" />
          Weekly
        </ToggleGroupItem>
        <ToggleGroupItem 
          value="monthly" 
          aria-label="Toggle monthly view"
          className="data-[state=on]:bg-gray-100 data-[state=on]:text-gray-900 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <CalendarRange className="h-4 w-4 mr-2" />
          Monthly
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  )
} 