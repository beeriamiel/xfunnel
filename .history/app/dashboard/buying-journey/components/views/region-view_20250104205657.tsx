"use client"

import { BarChart3, Building2, Briefcase, ShoppingCart, Laptop } from "lucide-react"
import { SelectionCards } from "../selection-cards"
import { useBuyingJourneyStore } from "../../store"
import { SelectionCard } from "../../types"

const mockVerticals: SelectionCard[] = [
  {
    id: "enterprise-software",
    title: "Enterprise Software",
    description: "Business software and enterprise solutions",
    icon: Laptop,
    metrics: {
      companyMentioned: 580,
      averagePosition: 3.5,
      featureScore: 0.88,
      averageSentiment: 0.82,
      changeFromPrevious: {
        companyMentioned: 12.5,
        averagePosition: -1.8,
        featureScore: 15.2,
        averageSentiment: 7.3,
      },
    },
  },
  {
    id: "financial-services",
    title: "Financial Services",
    description: "Banking, insurance, and fintech",
    icon: Building2,
    metrics: {
      companyMentioned: 420,
      averagePosition: 4.2,
      featureScore: 0.72,
      averageSentiment: 0.68,
      changeFromPrevious: {
        companyMentioned: 16.8,
        averagePosition: -2.5,
        featureScore: 9.1,
        averageSentiment: 3.8,
      },
    },
  },
  {
    id: "retail",
    title: "Retail",
    description: "E-commerce and retail businesses",
    icon: ShoppingCart,
    metrics: {
      companyMentioned: 350,
      averagePosition: 4.8,
      featureScore: 0.76,
      averageSentiment: 0.71,
      changeFromPrevious: {
        companyMentioned: 19.2,
        averagePosition: -1.2,
        featureScore: 11.5,
        averageSentiment: 5.2,
      },
    },
  },
  {
    id: "professional-services",
    title: "Professional Services",
    description: "Consulting and professional services",
    icon: Briefcase,
    metrics: {
      companyMentioned: 280,
      averagePosition: 4.1,
      featureScore: 0.81,
      averageSentiment: 0.75,
      changeFromPrevious: {
        companyMentioned: 14.5,
        averagePosition: -2.8,
        featureScore: 13.2,
        averageSentiment: 6.1,
      },
    },
  },
]

export function RegionView() {
  const { selectedVertical, setSelection, setStage, isLoading } = useBuyingJourneyStore()

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
        cards={mockVerticals}
        onSelect={handleSelect}
        selectedId={selectedVertical}
        isLoading={isLoading}
      />
    </div>
  )
} 