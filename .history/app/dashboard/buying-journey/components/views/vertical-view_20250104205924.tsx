"use client"

import { Users, Code, Database, Shield, Terminal } from "lucide-react"
import { SelectionCards } from "../selection-cards"
import { useBuyingJourneyStore } from "../../store"
import { SelectionCard } from "../../types"

const mockPersonas: SelectionCard[] = [
  {
    id: "devops-lead",
    title: "DevOps Lead",
    description: "Infrastructure and deployment decision makers",
    icon: Terminal,
    metrics: {
      companyMentioned: 320,
      averagePosition: 3.2,
      featureScore: 0.91,
      averageSentiment: 0.85,
      changeFromPrevious: {
        companyMentioned: 14.2,
        averagePosition: -1.5,
        featureScore: 16.8,
        averageSentiment: 8.2,
      },
    },
  },
  {
    id: "database-architect",
    title: "Database Architect",
    description: "Database and data infrastructure specialists",
    icon: Database,
    metrics: {
      companyMentioned: 280,
      averagePosition: 3.8,
      featureScore: 0.86,
      averageSentiment: 0.79,
      changeFromPrevious: {
        companyMentioned: 17.5,
        averagePosition: -2.1,
        featureScore: 12.4,
        averageSentiment: 5.9,
      },
    },
  },
  {
    id: "security-engineer",
    title: "Security Engineer",
    description: "Security and compliance professionals",
    icon: Shield,
    metrics: {
      companyMentioned: 240,
      averagePosition: 4.1,
      featureScore: 0.82,
      averageSentiment: 0.76,
      changeFromPrevious: {
        companyMentioned: 15.8,
        averagePosition: -1.8,
        featureScore: 10.5,
        averageSentiment: 4.8,
      },
    },
  },
  {
    id: "software-developer",
    title: "Software Developer",
    description: "Application developers and engineers",
    icon: Code,
    metrics: {
      companyMentioned: 380,
      averagePosition: 3.5,
      featureScore: 0.88,
      averageSentiment: 0.81,
      changeFromPrevious: {
        companyMentioned: 19.2,
        averagePosition: -1.2,
        featureScore: 14.7,
        averageSentiment: 7.1,
      },
    },
  },
]

export function VerticalView() {
  const { selectedPersona, setSelection, setStage, isLoading } = useBuyingJourneyStore()

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
        cards={mockPersonas}
        onSelect={handleSelect}
        selectedId={selectedPersona}
        isLoading={isLoading}
      />
    </div>
  )
} 