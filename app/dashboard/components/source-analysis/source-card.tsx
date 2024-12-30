'use client'

import { useState, memo } from 'react'
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Globe, ExternalLink, ChevronRight, ChevronDown, ChevronUp } from "lucide-react"
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
import { motion, AnimatePresence } from 'framer-motion'

interface Query {
  text: string
  date: string
  response: string
}

const QueryCard = memo(function QueryCard({ query }: { query: Query }) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <Card className="p-4 space-y-2 hover:bg-muted/5 transition-all">
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <p className="text-sm font-medium leading-relaxed">{query.text}</p>
          <time className="text-xs text-muted-foreground block">{query.date}</time>
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="ml-4 shrink-0 hover:bg-primary/5"
        >
          {isExpanded ? (
            <>
              Hide Response
              <ChevronUp className="h-4 w-4 ml-2" />
            </>
          ) : (
            <>
              View Response
              <ChevronDown className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </div>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-3 mt-3 border-t border-border/50">
              <div className="relative rounded-lg border bg-gradient-to-br from-muted/20 via-background to-muted/10 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-1 w-1 rounded-full bg-primary/60" />
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Response</span>
                </div>
                <div className="prose prose-sm max-w-none pl-3 text-sm text-muted-foreground whitespace-pre-wrap">
                  {query.response}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
})

QueryCard.displayName = 'QueryCard'

// Add helper function to process company mentions
function processCompanyMentions(companies: string[] | undefined): string[] {
  if (!companies) return []
  return companies
    .map(company => {
      const [name, count] = company.split(':')
      const mentionCount = parseInt(count)
      return { name, count: mentionCount }
    })
    .filter(company => company.count > 0)
    .map(company => `${company.name} (${company.count})`)
}

export const SourceCard = memo(function SourceCard({ data, type }: SourceCardProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  // Process company mentions
  const processedCompanies = processCompanyMentions(data.mentioned_companies_count)

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
  ] : []

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

          {data.mentioned_companies_count && data.mentioned_companies_count.length > 0 && (
            <div className="pt-3 border-t border-border/50">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2 mb-2">
                Companies mentioned
              </span>
              <div className="grid grid-cols-2 gap-1.5 max-w-full">
                {processedCompanies.slice(0, 5).map((company, i) => (
                  <Badge 
                    key={i} 
                    variant="outline"
                    className="text-xs bg-muted/50 truncate"
                  >
                    {company}
                  </Badge>
                ))}
                {processedCompanies.length > 5 && (
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Badge 
                        variant="outline"
                        className="text-xs bg-muted/50 cursor-help truncate"
                      >
                        +{processedCompanies.length - 5} more
                      </Badge>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-64">
                      <div className="space-y-1.5">
                        {processedCompanies.slice(5).map((company, i) => (
                          <div key={i} className="text-sm truncate">{company}</div>
                        ))}
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                )}
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
                  {data.mentioned_companies_count && data.mentioned_companies_count.length > 0 && (
                    <Card className="p-6">
                      <h3 className="text-sm font-medium mb-4">Companies Mentioned</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {processedCompanies.map((company, i) => (
                          <Badge 
                            key={i}
                            variant="outline"
                            className="text-sm bg-muted/50"
                          >
                            {company}
                          </Badge>
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
    </>
  )
})

SourceCard.displayName = 'SourceCard' 