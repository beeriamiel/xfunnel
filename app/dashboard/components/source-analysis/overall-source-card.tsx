'use client'

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { OverallSourceData } from "./types"
import { ExternalLink, ChevronRight } from "lucide-react"

interface OverallSourceCardProps {
  source: OverallSourceData
  onClick: () => void
}

// Add journey phase mapping
const JOURNEY_PHASE_LABELS: Record<string, string> = {
  'problem_exploration': 'Problem Exploration',
  'solution_education': 'Solution Education',
  'solution_comparison': 'Solution Comparison',
  'solution_evaluation': 'Solution Evaluation',
  'final_research': 'User Feedback'
}

// Add answer engine mapping
const ANSWER_ENGINE_LABELS: Record<string, string> = {
  'google_search': 'Google Search (AIO)',
  'open_ai': 'SearchGPT (OpenAI)',
  'claude': 'Claude (Anthropic)',
  'perplexity': 'Perplexity',
  'gemini': 'Gemini (Google)'
}

export function OverallSourceCard({ source, onClick }: OverallSourceCardProps) {
  // Process company mentions
  const companyMentions = source.mentioned_companies_count?.map(mention => {
    const [name, count] = mention.split(':')
    return { name, count: parseInt(count) }
  }).filter(company => company.count > 0) || []

  const displayedCompanies = companyMentions.slice(0, 5)
  const remainingCount = Math.max(0, companyMentions.length - 5)

  return (
    <Card 
      className="group relative cursor-pointer transition-all hover:shadow-md overflow-hidden border-border/50 hover:border-primary/20"
      onClick={onClick}
    >
      {/* Top Section */}
      <div className="p-4 space-y-4">
        {/* Header with Citation Count and Metrics */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-muted/50">
              {source.citation_count}x cited
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            {source.domain_authority && (
              <Badge variant="outline" className="bg-muted/50">
                DA {source.domain_authority}
              </Badge>
            )}
            <Badge variant="outline" className="capitalize bg-muted/50">
              {source.source_type || 'Earned'}
            </Badge>
          </div>
        </div>

        {/* Domain and URL */}
        <div className="space-y-1.5">
          <h3 className="font-medium">{source.domain}</h3>
          <a 
            href={source.citation_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-primary truncate block transition-colors"
            onClick={e => e.stopPropagation()}
          >
            {source.citation_url}
          </a>
        </div>

        {/* Journey Phases */}
        {source.buyer_journey_phases && source.buyer_journey_phases.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {source.buyer_journey_phases.map((phase, i) => (
              <Badge 
                key={i} 
                variant="outline"
                className="text-xs bg-muted/50"
              >
                {JOURNEY_PHASE_LABELS[phase] || phase}
              </Badge>
            ))}
          </div>
        )}

        {/* Answer Engines */}
        {source.answer_engines && source.answer_engines.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {source.answer_engines.map((engine, i) => (
              <Badge 
                key={i} 
                variant="outline"
                className="text-xs bg-muted/50"
              >
                {ANSWER_ENGINE_LABELS[engine] || engine}
              </Badge>
            ))}
          </div>
        )}

        {/* Companies Section */}
        {source.mentioned_companies_count && source.mentioned_companies_count.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-medium text-muted-foreground">Companies Mentioned:</span>
            <div className="flex flex-wrap gap-1.5">
              {source.mentioned_companies_count.slice(0, 5).map((company, i) => {
                const [name, count] = company.split(':')
                return (
                  <Badge 
                    key={i} 
                    variant="outline"
                    className="text-xs bg-muted/50"
                  >
                    {name} ({count})
                  </Badge>
                )
              })}
              {source.mentioned_companies_count.length > 5 && (
                <Badge 
                  variant="outline"
                  className="text-xs bg-primary/5 text-primary"
                >
                  +{source.mentioned_companies_count.length - 5} more
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>

      {/* View Details Button - Fixed at bottom right */}
      <div className="absolute bottom-0 right-0 p-4">
        <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0">
          <Badge 
            variant="outline" 
            className="bg-primary/5 text-primary hover:bg-primary/10 cursor-pointer"
          >
            View Details →
          </Badge>
        </div>
      </div>
    </Card>
  )
} 