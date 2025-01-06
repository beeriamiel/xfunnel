"use client"

import { Search, HelpCircle, BookOpen, Scale, CheckCircle2, MessageCircle } from "lucide-react"
import { SelectionCards } from "../selection-cards"
import { useBuyingJourneyStore } from "../../store"
import { SelectionCard } from "../../types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const mockQueries: Record<string, SelectionCard[]> = {
  "problem-exploration": [
    {
      id: "query-1",
      title: "Database Scaling Challenges",
      description: "What are the main challenges in scaling databases?",
      icon: HelpCircle,
      metrics: {
        companyMentioned: 150,
        averagePosition: 3.1,
        featureScore: 0.89,
        averageSentiment: 0.83,
        changeFromPrevious: {
          companyMentioned: 12.5,
          averagePosition: -1.2,
          featureScore: 15.8,
          averageSentiment: 7.2,
        },
      },
    },
  ],
  "solution-education": [
    {
      id: "query-2",
      title: "Database Types Comparison",
      description: "What are the differences between SQL and NoSQL databases?",
      icon: BookOpen,
      metrics: {
        companyMentioned: 180,
        averagePosition: 3.5,
        featureScore: 0.85,
        averageSentiment: 0.79,
        changeFromPrevious: {
          companyMentioned: 14.2,
          averagePosition: -1.8,
          featureScore: 12.4,
          averageSentiment: 5.9,
        },
      },
    },
  ],
  "solution-comparison": [
    {
      id: "query-3",
      title: "Database Providers Comparison",
      description: "Compare top cloud database providers",
      icon: Scale,
      metrics: {
        companyMentioned: 220,
        averagePosition: 3.8,
        featureScore: 0.82,
        averageSentiment: 0.76,
        changeFromPrevious: {
          companyMentioned: 16.8,
          averagePosition: -2.1,
          featureScore: 10.5,
          averageSentiment: 4.8,
        },
      },
    },
  ],
  "solution-evaluation": [
    {
      id: "query-4",
      title: "Database Performance Metrics",
      description: "Key metrics for evaluating database performance",
      icon: CheckCircle2,
      metrics: {
        companyMentioned: 190,
        averagePosition: 3.2,
        featureScore: 0.88,
        averageSentiment: 0.81,
        changeFromPrevious: {
          companyMentioned: 15.5,
          averagePosition: -1.5,
          featureScore: 13.7,
          averageSentiment: 6.5,
        },
      },
    },
  ],
  "user-feedback": [
    {
      id: "query-5",
      title: "Database User Reviews",
      description: "Real user experiences with different databases",
      icon: MessageCircle,
      metrics: {
        companyMentioned: 160,
        averagePosition: 4.1,
        featureScore: 0.79,
        averageSentiment: 0.74,
        changeFromPrevious: {
          companyMentioned: 18.2,
          averagePosition: -2.4,
          featureScore: 9.8,
          averageSentiment: 4.2,
        },
      },
    },
  ],
}

const phases = [
  { id: "problem-exploration", label: "Problem Exploration", icon: HelpCircle },
  { id: "solution-education", label: "Solution Education", icon: BookOpen },
  { id: "solution-comparison", label: "Solution Comparison", icon: Scale },
  { id: "solution-evaluation", label: "Solution Evaluation", icon: CheckCircle2 },
  { id: "user-feedback", label: "User Feedback", icon: MessageCircle },
]

export function PersonaView() {
  const { selectedQuery, setSelection, setStage, isLoading } = useBuyingJourneyStore()

  const handleSelect = (id: string) => {
    setSelection("query", id)
    setStage("query")
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-1">Select Query by Journey Phase</h2>
        <p className="text-sm text-muted-foreground">
          Explore queries organized by different phases of the buying journey.
        </p>
      </div>

      <Tabs defaultValue="problem-exploration" className="space-y-6">
        <TabsList className="w-full justify-start gap-2 bg-background p-0 h-auto flex-wrap">
          {phases.map(({ id, label, icon: Icon }) => (
            <TabsTrigger
              key={id}
              value={id}
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-2"
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {phases.map(({ id }) => (
          <TabsContent key={id} value={id}>
            <SelectionCards
              cards={mockQueries[id]}
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