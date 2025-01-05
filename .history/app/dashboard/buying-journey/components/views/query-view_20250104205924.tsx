"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useBuyingJourneyStore } from "../../store"
import { MetricsDisplay } from "../metrics-display"

const mockQueryData = {
  id: "query-1",
  text: "What are the main challenges in scaling databases?",
  response: `The main challenges in scaling databases include:
1. Maintaining consistency across distributed systems
2. Managing increased latency with larger datasets
3. Handling concurrent operations efficiently
4. Ensuring data durability and backup strategies
5. Cost optimization for storage and computing resources`,
  competitors: [
    { name: "Competitor A", rank: 1, score: 92 },
    { name: "Our Company", rank: 2, score: 88 },
    { name: "Competitor B", rank: 3, score: 85 },
    { name: "Competitor C", rank: 4, score: 82 },
  ],
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
  features: [
    { name: "Scalability", present: true },
    { name: "Performance", present: true },
    { name: "Cost-effectiveness", present: false },
    { name: "Ease of use", present: true },
    { name: "Support", present: false },
  ],
}

export function QueryView() {
  const { isLoading } = useBuyingJourneyStore()

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-[200px] bg-muted rounded-lg" />
        <div className="h-[400px] bg-muted rounded-lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-1">Query Analysis</h2>
        <p className="text-sm text-muted-foreground">
          Detailed analysis of the selected search query and its performance.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{mockQueryData.text}</CardTitle>
          <CardDescription>
            Query ID: {mockQueryData.id}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MetricsDisplay metrics={mockQueryData.metrics} className="mb-6" />

          <Tabs defaultValue="response" className="space-y-4">
            <TabsList>
              <TabsTrigger value="response">Response</TabsTrigger>
              <TabsTrigger value="competitors">Competitors</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
            </TabsList>

            <TabsContent value="response">
              <Card>
                <CardContent className="pt-6">
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-4">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {mockQueryData.response}
                      </p>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="competitors">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {mockQueryData.competitors.map((competitor, index) => (
                      <div
                        key={competitor.name}
                        className={cn(
                          "flex items-center justify-between p-4 rounded-lg",
                          competitor.name === "Our Company" && "bg-primary/5 border border-primary"
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-lg font-semibold text-muted-foreground">
                            #{competitor.rank}
                          </div>
                          <div>
                            <div className="font-medium">{competitor.name}</div>
                            <div className="text-sm text-muted-foreground">
                              Score: {competitor.score}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="features">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-wrap gap-2">
                    {mockQueryData.features.map((feature) => (
                      <Badge
                        key={feature.name}
                        variant={feature.present ? "default" : "secondary"}
                      >
                        {feature.name}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
} 