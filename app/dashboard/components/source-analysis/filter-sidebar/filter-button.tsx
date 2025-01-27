import * as React from "react"
import { SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface FilterButtonProps {
  onOpenChange: () => void
  totalFilters: number
}

export function FilterButton({ onOpenChange, totalFilters }: FilterButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onOpenChange}
      className="flex items-center gap-2"
    >
      <SlidersHorizontal className="h-4 w-4" />
      <span>Filter</span>
      {totalFilters > 0 && (
        <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center">
          {totalFilters}
        </Badge>
      )}
    </Button>
  )
} 