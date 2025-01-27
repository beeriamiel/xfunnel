'use client'

import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Globe, ExternalLink, Info, ChevronRight } from "lucide-react"
import { OverallSourceData } from "./types"
import { badgeVariants, JOURNEY_PHASE_LABELS, ANSWER_ENGINE_LABELS } from './overall-source-card'

interface SourceModalProps {
  source: OverallSourceData
  onClose: () => void
}

export function SourceModal({ source, onClose }: SourceModalProps) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <div className="flex items-center gap-3">
          <Globe className="h-5 w-5" />
          <DialogTitle className="flex-1">{source.domain}</DialogTitle>
          <DialogClose />
        </div>
        <DialogDescription>
          View detailed analysis and metrics for this source
        </DialogDescription>
        
        <div className="flex items-center gap-2">
          <a 
            href={source.citation_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-muted-foreground hover:text-primary truncate transition-colors"
          >
            {source.citation_url}
          </a>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => window.open(source.citation_url, '_blank')}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>

        <Tabs defaultValue="source_info">
          <TabsList>
            <TabsTrigger value="source_info">Source Information</TabsTrigger>
            <TabsTrigger value="content_analysis">Content Analysis</TabsTrigger>
            <TabsTrigger value="queries">Queries</TabsTrigger>
          </TabsList>

          <TabsContent value="source_info" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Source Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Source Type */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Type:</span>
                  <Badge variant="outline" className={badgeVariants.sourceType}>
                    {source.source_type || 'Earned'}
                  </Badge>
                </div>

                {/* Buyer Persona */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Buyer Persona:</span>
                  {source.buyer_persona ? (
                    <Badge variant="outline" className={badgeVariants.buyerPersona}>
                      {source.buyer_persona}
                    </Badge>
                  ) : (
                    <span className="text-sm text-muted-foreground">Not specified</span>
                  )}
                </div>

                {/* Journey Phase */}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Journey Phase:</span>
                  <div className="flex gap-1.5">
                    {source.buyer_journey_phases && source.buyer_journey_phases.length > 0 ? (
                      source.buyer_journey_phases.map((phase, i) => (
                        <Badge 
                          key={i} 
                          variant="outline"
                          className={badgeVariants.buyerJourneyPhase}
                        >
                          {JOURNEY_PHASE_LABELS[phase] || phase}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">Not specified</span>
                    )}
                  </div>
                </div>

                {/* Citations */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Citations</span>
                  <Badge variant="outline" className={badgeVariants.metric}>
                    {source.citation_count}x cited
                  </Badge>
                </div>

                {/* Domain Authority */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Domain Authority</span>
                  <Badge variant="outline" className={badgeVariants.metric}>
                    {source.domain_authority}
                  </Badge>
                </div>

                {/* External Links */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">External Links</span>
                  <span className="text-sm">{source.external_links_to_root_domain?.toLocaleString()}</span>
                </div>

                {/* Average Position */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Average Position</span>
                    <HoverCard>
                      <HoverCardTrigger>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </HoverCardTrigger>
                      <HoverCardContent>
                        Average position across all citations
                      </HoverCardContent>
                    </HoverCard>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={badgeVariants.metric}>
                      {source.average_citation_order}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      (from {source.citation_count} citations)
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Companies Card */}
            <Card>
              <CardHeader>
                <CardTitle>Companies Mentioned</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  {source.mentioned_companies_count?.map((mention, i) => {
                    const [name, count] = mention.split(':')
                    return (
                      <Badge 
                        key={i} 
                        variant="outline"
                        className={badgeVariants.company}
                      >
                        {name} ({count})
                      </Badge>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content_analysis">
            Content analysis coming soon...
          </TabsContent>

          <TabsContent value="queries">
            Queries coming soon...
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
} 