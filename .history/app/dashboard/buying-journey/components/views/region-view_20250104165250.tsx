'use client'

import { SelectionCard } from '../cards/selection-card'
import { useJourneyStore } from '../../store'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

interface Vertical {
  id: string
  name: string
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
const mockVerticals: Vertical[] = [
  {
    id: 'enterprise-software',
    name: 'Enterprise Software',
    metrics: {
      sentiment: 87.2,
      position: 1.8,
      mentioned: 82.5,
      featureScore: 94.3,
      changes: {
        sentiment: 4.1,
        position: -0.8,
        mentioned: 5.2,
        featureScore: 2.8
      }
    }
  },
  {
    id: 'financial-services',
    name: 'Financial Services',
    metrics: {
      sentiment: 83.9,
      position: 2.5,
      mentioned: 78.1,
      featureScore: 90.2,
      changes: {
        sentiment: 3.5,
        position: -0.3,
        mentioned: 4.1,
        featureScore: 1.9
      }
    }
  }
]

export function RegionView() {
  const { selectedRegion, setSelectedVertical, resetStages } = useJourneyStore()

  return (
    <div className="space-y-8">
      {/* Region overview card */}
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={resetStages}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              {selectedRegion === 'americas' ? 'Americas' : 'EMEA'} Region
            </h2>
            <p className="text-sm text-muted-foreground">
              Select a vertical to explore more details
            </p>
          </div>
        </div>
      </Card>

      {/* Verticals grid */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Available Verticals</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {mockVerticals.map((vertical) => (
            <SelectionCard
              key={vertical.id}
              title={vertical.name}
              metrics={[
                {
                  label: 'Avg. Sentiment',
                  value: vertical.metrics.sentiment,
                  change: vertical.metrics.changes?.sentiment
                },
                {
                  label: 'Avg. Position',
                  value: vertical.metrics.position,
                  change: vertical.metrics.changes?.position
                },
                {
                  label: 'Company Mentioned',
                  value: vertical.metrics.mentioned,
                  change: vertical.metrics.changes?.mentioned
                },
                {
                  label: 'Feature Score',
                  value: vertical.metrics.featureScore,
                  change: vertical.metrics.changes?.featureScore
                }
              ]}
              onClick={() => setSelectedVertical(vertical.id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
} 