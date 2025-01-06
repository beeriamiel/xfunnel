"use client"

import { Globe } from "lucide-react"
import { SelectionCards } from "../selection-cards"
import { useBuyingJourneyStore } from "../../store"
import { SelectionCard } from "../../types"

const mockRegions: SelectionCard[] = [
  {
    id: "americas",
    title: "Americas",
    description: "North and South America regions",
    icon: Globe,
    metrics: {
      companyMentioned: 1250,
      averagePosition: 3.8,
      featureScore: 0.82,
      averageSentiment: 0.79,
      changeFromPrevious: {
        companyMentioned: 15.2,
        averagePosition: -2.1,
        featureScore: 12.5,
        averageSentiment: 5.3,
      },
    },
  },
  {
    id: "emea",
    title: "EMEA",
    description: "Europe, Middle East, and Africa",
    icon: Globe,
    metrics: {
      companyMentioned: 850,
      averagePosition: 4.1,
      featureScore: 0.75,
      averageSentiment: 0.71,
      changeFromPrevious: {
        companyMentioned: 18.5,
        averagePosition: -3.2,
        featureScore: 8.9,
        averageSentiment: 4.2,
      },
    },
  },
  {
    id: "apac",
    title: "APAC",
    description: "Asia Pacific region",
    icon: Globe,
    metrics: {
      companyMentioned: 650,
      averagePosition: 4.5,
      featureScore: 0.78,
      averageSentiment: 0.73,
      changeFromPrevious: {
        companyMentioned: 22.1,
        averagePosition: -1.8,
        featureScore: 10.2,
        averageSentiment: 6.1,
      },
    },
  },
]

export function CompanyView() {
  const { selectedRegion, setSelection, setStage, isLoading } = useBuyingJourneyStore()

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
        cards={mockRegions}
        onSelect={handleSelect}
        selectedId={selectedRegion}
        isLoading={isLoading}
      />
    </div>
  )
} 