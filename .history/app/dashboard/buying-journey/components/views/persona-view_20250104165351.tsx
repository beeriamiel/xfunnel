'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useJourneyStore } from '../../store'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

type BuyingStage = 'problem-exploration' | 'solution-education' | 'solution-comparison' | 'solution-evaluation' | 'user-feedback'

interface Query {
  id: string
  text: string
  stage: BuyingStage
  engines: Array<{
    name: string
    result: {
      mentioned?: boolean
      position?: number
      featureAnalysis?: {
        yes: number
        no: number
        unknown: number
      }
    }
  }>
}

// This will be replaced with real data fetching
const mockQueries: Query[] = [
  {
    id: 'q1',
    text: 'What are the main challenges in managing cloud infrastructure?',
    stage: 'problem-exploration',
    engines: [
      {
        name: 'Engine A',
        result: { mentioned: true, position: 2 }
      },
      {
        name: 'Engine B',
        result: { mentioned: true, position: 1 }
      }
    ]
  },
  {
    id: 'q2',
    text: 'Best practices for cloud cost optimization',
    stage: 'solution-education',
    engines: [
      {
        name: 'Engine A',
        result: { mentioned: true, position: 1 }
      },
      {
        name: 'Engine B',
        result: { mentioned: false }
      }
    ]
  },
  {
    id: 'q3',
    text: 'Compare top cloud management platforms',
    stage: 'solution-comparison',
    engines: [
      {
        name: 'Engine A',
        result: { position: 2 }
      },
      {
        name: 'Engine B',
        result: { position: 3 }
      }
    ]
  },
  {
    id: 'q4',
    text: 'Does the platform support multi-cloud deployments?',
    stage: 'solution-evaluation',
    engines: [
      {
        name: 'Engine A',
        result: {
          featureAnalysis: { yes: 80, no: 15, unknown: 5 }
        }
      },
      {
        name: 'Engine B',
        result: {
          featureAnalysis: { yes: 75, no: 20, unknown: 5 }
        }
      }
    ]
  }
]

const stages: Array<{
  id: BuyingStage
  label: string
  description: string
}> = [
  {
    id: 'problem-exploration',
    label: 'Problem Exploration',
    description: 'Understanding the challenges and pain points'
  },
  {
    id: 'solution-education',
    label: 'Solution Education',
    description: 'Learning about potential solutions'
  },
  {
    id: 'solution-comparison',
    label: 'Solution Comparison',
    description: 'Comparing different solutions'
  },
  {
    id: 'solution-evaluation',
    label: 'Solution Evaluation',
    description: 'Evaluating specific features and capabilities'
  },
  {
    id: 'user-feedback',
    label: 'User Feedback',
    description: 'Real user experiences and opinions'
  }
]

function QueryCard({ query }: { query: Query }) {
  return (
    <Card className="p-4 space-y-4">
      <div>
        <h4 className="font-medium">{query.text}</h4>
      </div>
      <div className="grid gap-2">
        {query.engines.map((engine) => (
          <Card key={engine.name} className="p-3">
            <div className="flex justify-between items-center">
              <span className="font-medium">{engine.name}</span>
              <div className="text-sm">
                {engine.result.mentioned !== undefined && (
                  <span>
                    {engine.result.mentioned ? 'Mentioned' : 'Not Mentioned'}
                  </span>
                )}
                {engine.result.position !== undefined && (
                  <span>Rank: #{engine.result.position}</span>
                )}
                {engine.result.featureAnalysis && (
                  <div className="flex gap-2">
                    <span className="text-green-600">
                      Yes: {engine.result.featureAnalysis.yes}%
                    </span>
                    <span className="text-red-600">
                      No: {engine.result.featureAnalysis.no}%
                    </span>
                    <span className="text-muted-foreground">
                      Unknown: {engine.result.featureAnalysis.unknown}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Card>
  )
}

export function PersonaView() {
  const { selectedPersona, setStage } = useJourneyStore()

  return (
    <div className="space-y-8">
      {/* Persona overview card */}
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setStage('vertical')}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              {selectedPersona === 'devops-lead' ? 'DevOps Lead' : 'Tech Lead'} Persona
            </h2>
            <p className="text-sm text-muted-foreground">
              Explore the buying journey stages
            </p>
          </div>
        </div>
      </Card>

      {/* Journey stages tabs */}
      <Tabs defaultValue="problem-exploration" className="space-y-4">
        <TabsList className="w-full justify-start">
          {stages.map((stage) => (
            <TabsTrigger key={stage.id} value={stage.id}>
              {stage.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {stages.map((stage) => (
          <TabsContent key={stage.id} value={stage.id} className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">{stage.label}</h3>
              <p className="text-sm text-muted-foreground">{stage.description}</p>
            </div>
            <div className="grid gap-4">
              {mockQueries
                .filter((q) => q.stage === stage.id)
                .map((query) => (
                  <QueryCard key={query.id} query={query} />
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
} 