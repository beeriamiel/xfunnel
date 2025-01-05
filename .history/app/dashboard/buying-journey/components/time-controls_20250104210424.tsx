"use client"

import { CalendarIcon, Clock } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useBuyingJourneyStore } from "../store"

const timeFrameOptions = [
  { value: "week", label: "Weekly" },
  { value: "month", label: "Monthly" },
]

const batchOptions = [
  { value: "2024-01-15", label: "Batch: Jan 15, 2024" },
  { value: "2024-01-08", label: "Batch: Jan 8, 2024" },
  { value: "2024-01-01", label: "Batch: Jan 1, 2024" },
]

export function TimeControls() {
  const { sortBy, timeFrame, setSortBy, setTimeFrame } = useBuyingJourneyStore()

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
      <div className="flex items-center gap-2">
        <Button
          variant={sortBy === "batch" ? "default" : "outline"}
          size="sm"
          onClick={() => setSortBy("batch")}
          className="h-9"
        >
          <Clock className="mr-2 h-4 w-4" />
          By Batch
        </Button>
        <Button
          variant={sortBy === "time" ? "default" : "outline"}
          size="sm"
          onClick={() => setSortBy("time")}
          className="h-9"
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          By Time
        </Button>
      </div>

      <div className="w-[200px]">
        {sortBy === "batch" ? (
          <Select defaultValue={batchOptions[0].value}>
            <SelectTrigger>
              <SelectValue placeholder="Select batch" />
            </SelectTrigger>
            <SelectContent>
              {batchOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Select value={timeFrame} onValueChange={(value) => setTimeFrame(value as "week" | "month")}>
            <SelectTrigger>
              <SelectValue placeholder="Select time frame" />
            </SelectTrigger>
            <SelectContent>
              {timeFrameOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
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