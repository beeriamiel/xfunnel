"use client"

import { SelectionCards } from "../selection-cards"
import { useBuyingJourneyStore } from "../../store"
import { useBuyingJourney } from "../../hooks/use-buying-journey"

export function VerticalView() {
  const { selectedPersona, setSelection, setStage } = useBuyingJourneyStore()
  const { cards, isLoading } = useBuyingJourney()

  const handleSelect = (id: string) => {
    setSelection("persona", id)
    setStage("persona")
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-1">Select Buyer Persona</h2>
        <p className="text-sm text-muted-foreground">
          Choose a buyer persona to analyze their specific needs and behaviors.
        </p>
      </div>
      <SelectionCards
        cards={cards || []}
        onSelect={handleSelect}
        selectedId={selectedPersona}
        isLoading={isLoading}
      />
    </div>
  )
} 