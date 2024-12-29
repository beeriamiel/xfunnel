'use client'

import { useState } from 'react'
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
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
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Globe, ExternalLink, ChevronRight, Calendar, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { SourceCardProps } from './types'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer
} from 'recharts'

interface Query {
  text: string
  date: string
  response: string
}

function QueryCard({ query, onViewResponse }: { query: Query; onViewResponse: () => void }) {
  return (
    <Card className="group relative overflow-hidden border-border/50 hover:border-primary/20 transition-all duration-300">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-muted">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-foreground truncate">{query.text}</p>
            <div className="flex items-center gap-2 mt-1">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              <time className="text-xs text-muted-foreground">{query.date}</time>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onViewResponse}
            className="opacity-0 group-hover:opacity-100 transition-all duration-300"
          >
            View
            <ChevronRight className="h-3 w-3 ml-1 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </div>
        
        <div className="relative pl-4 border-l border-border">
          <p className="text-sm text-muted-foreground line-clamp-2">{query.response}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function ResponseModal({ isOpen, onClose, query }: { isOpen: boolean; onClose: () => void; query: Query }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl p-0">
        <DialogHeader className="px-6 py-4 border-b bg-background/95 sticky top-0 z-10">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <Search className="h-5 w-5 text-muted-foreground" />
            Query Response
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            <Calendar className="h-3 w-3" />
            <time className="text-sm">{query.date}</time>
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-6">
          <div className="relative pl-4 border-l border-border space-y-2">
            <h3 className="text-sm font-medium">Query</h3>
            <p className="text-sm text-muted-foreground">{query.text}</p>
          </div>

          <ScrollArea className="h-[400px] rounded-lg border p-6">
            <div className="relative pl-4 border-l border-border space-y-2">
              <h3 className="text-sm font-medium">Response</h3>
              <div className="prose prose-sm max-w-none text-muted-foreground">
                {query.response}
              </div>
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function SourceCard({ data, type }: SourceCardProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedQuery, setSelectedQuery] = useState<Query | null>(null)

  // Prepare radar chart data
  const radarData = data.content_analysis?.metrics ? [
    { subject: 'Keyword Usage', value: data.content_analysis.metrics.keyword_usage.score },
    { subject: 'Statistics', value: data.content_analysis.metrics.statistics.score },
    { subject: 'Quotations', value: data.content_analysis.metrics.quotations.score },
    { subject: 'Citations', value: data.content_analysis.metrics.citations.score },
    { subject: 'Fluency', value: data.content_analysis.metrics.fluency.score },
    { subject: 'Technical Terms', value: data.content_analysis.metrics.technical_terms.score },
    { subject: 'Authority', value: data.content_analysis.metrics.authority.score },
    { subject: 'Readability', value: data.content_analysis.metrics.readability.score },
    { subject: 'Unique Words', value: data.content_analysis.metrics.unique_words.score },
  ] : [];

  return (
    <>
      <Card
        className={cn(
          "group relative overflow-hidden cursor-pointer",
          "border-border/50 hover:border-primary/20",
          "hover:shadow-sm",
          "transition-all duration-300"
        )}
        onClick={() => setIsOpen(true)}
      >
        <CardHeader className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-muted">
                <Globe className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-base font-medium">{data.domain}</h3>
                <a 
                  href={data.citation_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary truncate block max-w-[300px] transition-colors"
                  onClick={e => e.stopPropagation()}
                >
                  {data.citation_url}
                </a>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {data.domain_authority && (
                <Badge variant="outline" className="bg-muted/50">
                  DA: {data.domain_authority}
                </Badge>
              )}
              {data.source_type && (
                <Badge variant="outline" className="capitalize bg-muted/50">
                  {data.source_type}
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Badge variant="outline" className="bg-muted/50">
              {data.citation_count}x cited
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-all duration-300"
            >
              View Details
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>

          {type === 'mentions' && data.mentioned_companies && data.mentioned_companies.length > 0 && (
            <div className="pt-3 border-t border-border/50">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2 mb-2">
                Companies mentioned
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {data.mentioned_companies.slice(0, 5).map((company, i) => (
                  <Badge 
                    key={i} 
                    variant="outline"
                    className="text-xs bg-muted/50"
                  >
                    {company}
                  </Badge>
                ))}
                {data.mentioned_companies.length > 5 && (
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Badge 
                        variant="outline"
                        className="text-xs bg-muted/50 cursor-help"
                      >
                        +{data.mentioned_companies.length - 5} more
                      </Badge>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-64">
                      <div className="space-y-1.5">
                        {data.mentioned_companies.slice(5).map((company, i) => (
                          <div key={i} className="text-sm">{company}</div>
                        ))}
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                )}
              </div>
            </div>
          )}

          {type === 'rankings' && data.rank_list && (
            <div className="pt-3 border-t border-border/50">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2 mb-2">
                Rankings
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {data.rank_list.split('\n').slice(0, 5).map((rank, i) => (
                  <Badge 
                    key={i} 
                    variant="outline"
                    className="text-xs bg-muted/50"
                  >
                    {rank.trim()}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardHeader>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl p-0">
          <DialogHeader className="px-6 py-4 border-b bg-background/95 sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-muted-foreground" />
                <DialogTitle className="text-lg font-semibold">
                  {data.domain}
                </DialogTitle>
              </div>
              <a
                href={data.citation_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                onClick={e => e.stopPropagation()}
              >
                Visit Source
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </DialogHeader>

          <Tabs defaultValue="source" className="p-6">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="source">Source Analysis</TabsTrigger>
              <TabsTrigger value="content">Content Quality</TabsTrigger>
            </TabsList>

            <TabsContent value="source" className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <Card className="p-6 space-y-4">
                  <h3 className="text-sm font-medium">Source Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Type</span>
                      <Badge variant="outline" className="capitalize">
                        {data.source_type || 'N/A'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Journey Phase</span>
                      <Badge variant="outline" className="capitalize">
                        {data.buyer_journey_phase?.replace('_', ' ') || 'N/A'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Domain Authority</span>
                      <span className="text-sm font-medium">{data.domain_authority || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Citations</span>
                      <span className="text-sm font-medium">{data.citation_count}x cited</span>
                    </div>
                  </div>
                </Card>

                <div className="space-y-4">
                  {type === 'mentions' && data.mentioned_companies && (
                    <Card className="p-6">
                      <h3 className="text-sm font-medium mb-4">Companies Mentioned</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {data.mentioned_companies.map((company, i) => (
                          <Badge 
                            key={i}
                            variant="outline"
                            className="bg-muted/50 hover:bg-muted transition-colors"
                          >
                            {company}
                          </Badge>
                        ))}
                      </div>
                    </Card>
                  )}

                  {type === 'rankings' && data.rank_list && (
                    <Card className="p-6">
                      <h3 className="text-sm font-medium mb-4">Rankings</h3>
                      <div className="space-y-2">
                        {data.rank_list.split('\n').map((rank, i) => (
                          <div key={i} className="flex justify-between items-center">
                            <span className="text-sm">{rank.trim()}</span>
                            <Badge variant="outline">#{i + 1}</Badge>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}
                </div>
              </div>

              <Card className="p-6">
                <h3 className="text-sm font-medium mb-4">Related Queries</h3>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3 pr-4">
                    {data.queries.map((query: Query, i: number) => (
                      <QueryCard
                        key={i}
                        query={query}
                        onViewResponse={() => setSelectedQuery(query)}
                      />
                    ))}
                  </div>
                </ScrollArea>
              </Card>
            </TabsContent>

            <TabsContent value="content">
              <Card className="p-6">
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid className="text-border" />
                      <PolarAngleAxis dataKey="subject" className="text-xs text-muted-foreground" />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} className="text-muted-foreground" />
                      <Radar
                        name="Content Quality"
                        dataKey="value"
                        stroke="#7c3aed"
                        fill="#7c3aed"
                        fillOpacity={0.2}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {selectedQuery && (
        <ResponseModal
          query={selectedQuery}
          isOpen={!!selectedQuery}
          onClose={() => setSelectedQuery(null)}
        />
      )}
    </>
  )
} 