'use client'

import { SelectionCard } from '../cards/selection-card'
import { useJourneyStore } from '../../store'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

interface Persona {
  id: string
  name: string
  description: string
  metrics: {
    sentiment: number
    position: number
    mentioned: number
    featureScore: number
    changes?: {
      sentiment: number
      position: number
      mentioned: number
      featureScore: number
    }
  }
}

// This will be replaced with real data fetching
const mockPersonas: Persona[] = [
  {
    id: 'devops-lead',
    name: 'DevOps Lead',
    description: 'Technical decision maker for infrastructure and operations',
    metrics: {
      sentiment: 89.5,
      position: 1.5,
      mentioned: 85.2,
      featureScore: 95.8,
      changes: {
        sentiment: 4.8,
        position: -1.2,
        mentioned: 5.5,
        featureScore: 3.1
      }
    }
  },
  {
    id: 'tech-lead',
    name: 'Tech Lead',
    description: 'Technical architect responsible for system design',
    metrics: {
      sentiment: 86.7,
      position: 2.1,
      mentioned: 81.9,
      featureScore: 92.4,
      changes: {
        sentiment: 3.9,
        position: -0.7,
        mentioned: 4.2,
        featureScore: 2.5
      }
    }
  }
]

export function VerticalView() {
  const { selectedVertical, setSelectedPersona, setStage } = useJourneyStore()

  return (
    <div className="space-y-8">
      {/* Vertical overview card */}
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setStage('region')}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              {selectedVertical === 'enterprise-software'
                ? 'Enterprise Software'
                : 'Financial Services'} Vertical
            </h2>
            <p className="text-sm text-muted-foreground">
              Select a persona to explore their buying journey
            </p>
          </div>
        </div>
      </Card>

      {/* Personas grid */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Available Personas</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {mockPersonas.map((persona) => (
            <SelectionCard
              key={persona.id}
              title={persona.name}
              description={persona.description}
              metrics={[
                {
                  label: 'Avg. Sentiment',
                  value: persona.metrics.sentiment,
                  change: persona.metrics.changes?.sentiment
                },
                {
                  label: 'Avg. Position',
                  value: persona.metrics.position,
                  change: persona.metrics.changes?.position
                },
                {
                  label: 'Company Mentioned',
                  value: persona.metrics.mentioned,
                  change: persona.metrics.changes?.mentioned
                },
                {
                  label: 'Feature Score',
                  value: persona.metrics.featureScore,
                  change: persona.metrics.changes?.featureScore
                }
              ]}
              onClick={() => setSelectedPersona(persona.id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
} 