"use client"

import { CalendarIcon, Clock } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useBuyingJourneyStore } from "../store"
import { useCallback } from "react"

const timeFrameOptions = [
  { value: "week", label: "Weekly" },
  { value: "month", label: "Monthly" },
] as const

const batchOptions = [
  { value: "2024-01-15", label: "Batch: Jan 15, 2024" },
  { value: "2024-01-08", label: "Batch: Jan 8, 2024" },
  { value: "2024-01-01", label: "Batch: Jan 1, 2024" },
] as const

export function TimeControls() {
  const { sortBy, timeFrame, setSortBy, setTimeFrame } = useBuyingJourneyStore()

  // Memoize handlers to prevent unnecessary re-renders
  const handleSortChange = useCallback((newSortBy: "batch" | "time") => {
    if (newSortBy !== sortBy) {
      setSortBy(newSortBy)
    }
  }, [sortBy, setSortBy])

  const handleTimeFrameChange = useCallback((value: string) => {
    if (value !== timeFrame) {
      setTimeFrame(value as "week" | "month")
    }
  }, [timeFrame, setTimeFrame])

  // Default batch value if none selected
  const currentBatch = sortBy === "batch" ? batchOptions[0].value : undefined

  return (
    <div 
      className="flex flex-col sm:flex-row gap-4 items-start sm:items-center"
      role="group"
      aria-label="Time controls"
    >
      <div 
        className="flex items-center gap-2"
        role="radiogroup"
        aria-label="Sort by options"
      >
        <Button
          variant={sortBy === "batch" ? "default" : "outline"}
          size="sm"
          onClick={() => handleSortChange("batch")}
          className="h-9"
          role="radio"
          aria-checked={sortBy === "batch"}
          aria-label="Sort by batch"
        >
          <Clock className="mr-2 h-4 w-4" aria-hidden="true" />
          By Batch
        </Button>
        <Button
          variant={sortBy === "time" ? "default" : "outline"}
          size="sm"
          onClick={() => handleSortChange("time")}
          className="h-9"
          role="radio"
          aria-checked={sortBy === "time"}
          aria-label="Sort by time"
        >
          <CalendarIcon className="mr-2 h-4 w-4" aria-hidden="true" />
          By Time
        </Button>
      </div>

      <div className="w-[200px]">
        {sortBy === "batch" ? (
          <Select 
            value={currentBatch}
            onValueChange={(value) => {
              // No-op for now since batch selection isn't implemented
              console.log("Selected batch:", value)
            }}
            aria-label="Select batch"
          >
            <SelectTrigger>
              <SelectValue placeholder="Select batch" />
            </SelectTrigger>
            <SelectContent>
              {batchOptions.map((option) => (
                <SelectItem 
                  key={option.value} 
                  value={option.value}
                  aria-label={option.label}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Select 
            value={timeFrame} 
            onValueChange={handleTimeFrameChange}
            aria-label="Select time frame"
          >
            <SelectTrigger>
              <SelectValue placeholder="Select time frame" />
            </SelectTrigger>
            <SelectContent>
              {timeFrameOptions.map((option) => (
                <SelectItem 
                  key={option.value} 
                  value={option.value}
                  aria-label={option.label}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  )
} 