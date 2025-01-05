"use client"

import { Globe } from "lucide-react"
import { SelectionCards } from "../selection-cards"
import { useBuyingJourneyStore } from "../../store"
import { useBuyingJourney } from "../../hooks/use-buying-journey"

export function CompanyView() {
  const { selectedRegion, setSelection, setStage } = useBuyingJourneyStore()
  const { cards, isLoading } = useBuyingJourney()

  const handleSelect = (id: string) => {
    setSelection("region", id)
    setStage("region")
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-1">Select Region</h2>
        <p className="text-sm text-muted-foreground">
          Choose a region to analyze its performance metrics and trends.
        </p>
      </div>
      <SelectionCards
        cards={cards || []}
        onSelect={handleSelect}
        selectedId={selectedRegion}
        isLoading={isLoading}
      />
    </div>
  )
} 