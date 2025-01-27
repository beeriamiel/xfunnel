import * as React from "react"
import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface FilterBadgeGroupProps {
  filters: {
    category: string
    label: string
    value: string
  }[]
  onRemove: (category: string, value: string) => void
}

export function FilterBadgeGroup({
  filters,
  onRemove,
}: FilterBadgeGroupProps) {
  if (filters.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {filters.map((filter) => (
        <Badge
          key={`${filter.category}-${filter.value}`}
          variant="secondary"
          className="text-xs"
        >
          {filter.label}
          <X
            className="ml-1 h-3 w-3 cursor-pointer"
            onClick={() => onRemove(filter.category, filter.value)}
          />
        </Badge>
      ))}
    </div>
  )
} 