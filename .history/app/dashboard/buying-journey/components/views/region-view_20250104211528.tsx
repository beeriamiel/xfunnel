"use client"

import { SelectionCards } from "../selection-cards"
import { useBuyingJourneyStore } from "../../store"
import { useBuyingJourney } from "../../hooks/use-buying-journey"

export function RegionView() {
  const { selectedVertical, setSelection, setStage } = useBuyingJourneyStore()
  const { cards, isLoading } = useBuyingJourney()

  const handleSelect = (id: string) => {
    setSelection("vertical", id)
    setStage("vertical")
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-1">Select Industry Vertical</h2>
        <p className="text-sm text-muted-foreground">
          Choose an industry vertical to analyze its specific performance metrics.
        </p>
      </div>
      <SelectionCards
        cards={cards || []}
        onSelect={handleSelect}
        selectedId={selectedVertical}
        isLoading={isLoading}
      />
    </div>
  )
} 