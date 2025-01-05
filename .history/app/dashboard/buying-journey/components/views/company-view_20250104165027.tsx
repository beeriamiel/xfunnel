'use client'

import { SelectionCard } from '../cards/selection-card'
import { useJourneyStore } from '../../store'

interface Region {
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
const mockRegions: Region[] = [
  {
    id: 'americas',
    name: 'Americas',
    metrics: {
      sentiment: 85.5,
      position: 2.3,
      mentioned: 75.2,
      featureScore: 92.1,
      changes: {
        sentiment: 5.2,
        position: -1.1,
        mentioned: 3.4,
        featureScore: 2.1
      }
    }
  },
  {
    id: 'emea',
    name: 'EMEA',
    metrics: {
      sentiment: 82.3,
      position: 3.1,
      mentioned: 71.5,
      featureScore: 88.7,
      changes: {
        sentiment: 3.1,
        position: -0.5,
        mentioned: 2.8,
        featureScore: 1.5
      }
    }
  }
]

export function CompanyView() {
  const setSelectedRegion = useJourneyStore((state) => state.setSelectedRegion)

  return (
    <div className="space-y-8">
      {/* Company overview metrics will go here */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Select Region</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {mockRegions.map((region) => (
            <SelectionCard
              key={region.id}
              title={region.name}
              metrics={[
                {
                  label: 'Avg. Sentiment',
                  value: region.metrics.sentiment,
                  change: region.metrics.changes?.sentiment
                },
                {
                  label: 'Avg. Position',
                  value: region.metrics.position,
                  change: region.metrics.changes?.position
                },
                {
                  label: 'Company Mentioned',
                  value: region.metrics.mentioned,
                  change: region.metrics.changes?.mentioned
                },
                {
                  label: 'Feature Score',
                  value: region.metrics.featureScore,
                  change: region.metrics.changes?.featureScore
                }
              ]}
              onClick={() => setSelectedRegion(region.id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
} 