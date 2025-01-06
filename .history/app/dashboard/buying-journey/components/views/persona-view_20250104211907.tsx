"use client"

import { HelpCircle, BookOpen, Scale, CheckCircle2, MessageCircle } from "lucide-react"
import { SelectionCards } from "../selection-cards"
import { useBuyingJourneyStore } from "../../store"
import { useBuyingJourney } from "../../hooks/use-buying-journey"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Phase } from "../../types"

const phases: { id: Phase; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "problem-exploration", label: "Problem Exploration", icon: HelpCircle },
  { id: "solution-education", label: "Solution Education", icon: BookOpen },
  { id: "solution-comparison", label: "Solution Comparison", icon: Scale },
  { id: "solution-evaluation", label: "Solution Evaluation", icon: CheckCircle2 },
  { id: "user-feedback", label: "User Feedback", icon: MessageCircle },
]

export function PersonaView() {
  const { selectedQuery, setSelection, setStage } = useBuyingJourneyStore()
  const { cards, isLoading } = useBuyingJourney()

  const handleSelect = (id: string) => {
    setSelection("query", id)
    setStage("query")
  }

  // Group cards by phase
  const cardsByPhase = cards?.reduce((acc, card) => {
    const phase = card.phase || "problem-exploration"
    acc[phase] = acc[phase] || []
    acc[phase].push(card)
    return acc
  }, {} as Record<Phase, typeof cards>) || {}

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-1">Select Query by Journey Phase</h2>
        <p className="text-sm text-muted-foreground">
          Explore queries organized by different phases of the buying journey.
        </p>
      </div>

      <Tabs defaultValue="problem-exploration" className="space-y-6">
        <TabsList 
          className="w-full justify-start gap-2 bg-background p-0 h-auto flex-wrap"
          aria-label="Journey phases"
        >
          {phases.map(({ id, label, icon: Icon }) => (
            <TabsTrigger
              key={id}
              value={id}
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-2"
              aria-label={`${label} phase`}
              role="tab"
              aria-controls={`${id}-tab`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              <span>{label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {phases.map(({ id, label }) => (
          <TabsContent 
            key={id} 
            value={id}
            role="tabpanel"
            id={`${id}-tab`}
            aria-label={`${label} queries`}
          >
            <SelectionCards
              cards={cardsByPhase[id] || []}
              onSelect={handleSelect}
              selectedId={selectedQuery}
              isLoading={isLoading}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
} 