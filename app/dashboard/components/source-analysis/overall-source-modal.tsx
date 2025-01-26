'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"
import { Globe, ExternalLink, Info } from 'lucide-react'
import { OverallSourceData } from './types'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip
} from 'recharts'
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card"

interface Props {
  source: OverallSourceData | null
  isOpen: boolean
  onClose: () => void
}

// Add answer engine mapping at the top with other constants
const ANSWER_ENGINE_LABELS: Record<string, string> = {
  'google_search': 'Google Search (AIO)',
  'open_ai': 'SearchGPT (OpenAI)',
  'claude': 'Claude (Anthropic)',
  'perplexity': 'Perplexity',
  'gemini': 'Gemini (Google)'
}

interface QueryCardProps {
  text: string
  date: string
  response: string
  answer_engine: string | null
}

function QueryCard({ text, date, response, answer_engine }: QueryCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <Card className="p-4 space-y-2">
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <p className="text-sm font-medium">{text}</p>
          <div className="flex items-center gap-2">
            <time className="text-xs text-muted-foreground">{date}</time>
            {answer_engine && (
              <Badge variant="outline" className="text-xs bg-muted/50">
                {ANSWER_ENGINE_LABELS[answer_engine] || answer_engine}
              </Badge>
            )}
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-primary hover:underline"
        >
          {isExpanded ? 'Hide Response' : 'View Response'}
        </button>
      </div>
      {isExpanded && (
        <div className="mt-3 pt-3 border-t">
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{response}</p>
        </div>
      )}
    </Card>
  )
}

function ContentMetricsChart({ metrics, details }: { 
  metrics: OverallSourceData['content_analysis']
  details: OverallSourceData['content_analysis_details']
}) {
  if (!metrics?.metrics) return null

  const data = [
    { subject: 'Keyword Usage', value: metrics.metrics.keyword_usage.score },
    { subject: 'Statistics', value: metrics.metrics.statistics.score },
    { subject: 'Quotations', value: metrics.metrics.quotations.score },
    { subject: 'Citations', value: metrics.metrics.citations.score },
    { subject: 'Fluency', value: metrics.metrics.fluency.score },
    { subject: 'Technical Terms', value: metrics.metrics.technical_terms.score },
    { subject: 'Authority', value: metrics.metrics.authority.score },
    { subject: 'Readability', value: metrics.metrics.readability.score },
    { subject: 'Unique Words', value: metrics.metrics.unique_words.score },
  ]

  return (
    <div className="space-y-6">
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data}>
            <PolarGrid className="text-border" />
            <PolarAngleAxis 
              dataKey="subject" 
              className="text-xs text-muted-foreground" 
            />
            <PolarRadiusAxis 
              angle={30} 
              domain={[0, 100]} 
              className="text-muted-foreground" 
            />
            <Radar
              name="Content Quality"
              dataKey="value"
              stroke="#7c3aed"
              fill="#7c3aed"
              fillOpacity={0.2}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-md">
                      <p className="font-medium">{payload[0].payload.subject}</p>
                      <p className="text-sm text-muted-foreground">
                        Score: {payload[0].value}
                      </p>
                    </div>
                  )
                }
                return null
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {details && (
        <Card className="p-4">
          <h4 className="text-sm font-medium mb-3">Analysis Details</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Average Sentence Length</p>
              <p className="text-sm font-medium">{details.avg_sentence_length.toFixed(1)} words</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Keyword Density</p>
              <p className="text-sm font-medium">{(details.keyword_density * 100).toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Technical Terms</p>
              <p className="text-sm font-medium">{details.technical_term_count}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Words</p>
              <p className="text-sm font-medium">{details.total_words}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

export function OverallSourceModal({ source, isOpen, onClose }: Props) {
  if (!source) return null

  // Process company mentions
  const processedCompanies = (source.mentioned_companies_count || [])
    .map(company => {
      const [name, countStr] = company.split(':')
      const count = parseInt(countStr || '0')
      return { name, count }
    })
    .filter(company => company.count > 0)
    .sort((a, b) => b.count - a.count)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader className="space-y-1">
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            {source.domain}
          </DialogTitle>
          <DialogDescription>
            View detailed analysis and metrics for this source
          </DialogDescription>
          <a
            href={source.citation_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-primary flex items-center gap-2"
          >
            {source.citation_url}
            <ExternalLink className="h-4 w-4" />
          </a>
        </DialogHeader>

        <Tabs defaultValue="source">
          <TabsList>
            <TabsTrigger value="source">Source Information</TabsTrigger>
            <TabsTrigger value="content">Content Analysis</TabsTrigger>
            <TabsTrigger value="queries">Queries</TabsTrigger>
          </TabsList>

          <TabsContent value="source" className="space-y-4">
            <div className="grid grid-cols-2 gap-6">
              <Card className="p-6 space-y-4">
                <h3 className="text-sm font-medium">Source Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Citations</span>
                    <span className="text-sm font-medium">{source.citation_count}x cited</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Journey Phases</span>
                    <div className="flex gap-2">
                      {source.buyer_journey_phases.map((phase, i) => (
                        <Badge key={i} variant="outline" className="capitalize">
                          {phase.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Domain Authority</span>
                    <span className="text-sm font-medium">{source.domain_authority || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Source Type</span>
                    <Badge variant="outline" className="capitalize">
                      {source.source_type || 'N/A'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">External Links</span>
                    <span className="text-sm font-medium">
                      {source.external_links_to_root_domain?.toLocaleString() || 'N/A'}
                    </span>
                  </div>
                  {source.citation_orders.length > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Average Position
                        <HoverCard>
                          <HoverCardTrigger>
                            <Info className="h-4 w-4 ml-1 text-muted-foreground hover:text-primary cursor-help inline-block" />
                          </HoverCardTrigger>
                          <HoverCardContent className="w-80">
                            <p className="text-sm">
                              The average position of this source in AI answers. A value of 0 means it appears first in answers, 1 means second, and so on. Lower numbers indicate the source is typically mentioned earlier and more prominently in responses.
                            </p>
                          </HoverCardContent>
                        </HoverCard>
                      </span>
                      <div className="flex gap-1">
                        <Badge variant="outline">
                          {source.average_citation_order?.toFixed(1) || 'N/A'}
                        </Badge>
                        <div className="text-xs text-muted-foreground">
                          (from {source.citation_orders.length} citations)
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-sm font-medium mb-4">Companies Mentioned</h3>
                {processedCompanies.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {processedCompanies.map((company, i) => (
                      <Badge 
                        key={i}
                        variant="outline"
                        className="text-sm bg-muted/50"
                      >
                        {company.name} ({company.count})
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No companies mentioned</p>
                )}
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="content">
            <ContentMetricsChart 
              metrics={source.content_analysis}
              details={source.content_analysis_details}
            />
          </TabsContent>

          <TabsContent value="queries">
            <ScrollArea className="h-[500px]">
              <div className="space-y-4 pr-4">
                {source.queries.map((query, i) => (
                  <QueryCard
                    key={i}
                    text={query.text}
                    date={query.date}
                    response={query.response}
                    answer_engine={query.answer_engine}
                  />
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
} 