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
export const JOURNEY_PHASE_LABELS: Record<string, string> = {
  'problem_exploration': 'Problem Exploration',
  'solution_education': 'Solution Education',
  'solution_comparison': 'Solution Comparison',
  'solution_evaluation': 'Solution Evaluation',
  'final_research': 'User Feedback'
}

// Add answer engine mapping
export const ANSWER_ENGINE_LABELS: Record<string, string> = {
  'google_search': 'Google Search (AIO)',
  'open_ai': 'SearchGPT (OpenAI)',
  'claude': 'Claude (Anthropic)',
  'perplexity': 'Perplexity',
  'gemini': 'Gemini (Google)'
}

// Add buyer persona mapping after other mappings
export const BUYER_PERSONA_LABELS: Record<string, string> = {
  'technical_buyer': 'Technical Buyer',
  'business_buyer': 'Business Buyer',
  'end_user': 'End User',
  'executive': 'Executive',
  'developer': 'Developer'
}

// Add badge style variants
export const badgeVariants = {
  buyerJourneyPhase: "bg-gradient-to-r from-blue-50/50 to-indigo-50/50 text-blue-700 border-blue-200/50 hover:bg-blue-100/50",
  sourceType: "bg-gradient-to-r from-emerald-50/50 to-green-50/50 text-emerald-700 border-emerald-200/50 hover:bg-emerald-100/50",
  answerEngine: "bg-gradient-to-r from-orange-50/50 to-amber-50/50 text-orange-700 border-orange-200/50 hover:bg-amber-100/50",
  buyerPersona: "bg-gradient-to-r from-purple-50/50 to-violet-50/50 text-purple-700 border-purple-200/50 hover:bg-purple-100/50",
  company: "bg-gradient-to-r from-slate-50/50 to-gray-50/50 text-slate-700 border-slate-200/50 hover:bg-slate-100/50",
  metric: "bg-gradient-to-r from-muted/50 to-muted/30 text-muted-foreground border-muted/50",
  more: "bg-gradient-to-r from-primary/5 to-primary/10 text-primary border-primary/20 hover:bg-primary/20"
} as const

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
      className="group relative cursor-pointer transition-all hover:shadow-md overflow-hidden border-border/50 hover:border-primary/20 h-[320px] flex flex-col"
      onClick={onClick}
    >
      {/* Main Content Section - Fixed Height */}
      <div className="flex-1 p-4 flex flex-col">
        {/* Header with Citation Count and Metrics - Fixed Height */}
        <div className="h-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={badgeVariants.metric}>
              {source.citation_count}x cited
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            {source.domain_authority && (
              <Badge variant="outline" className={badgeVariants.metric}>
                DA {source.domain_authority}
              </Badge>
            )}
            <Badge variant="outline" className={badgeVariants.sourceType}>
              {source.source_type || 'Earned'}
            </Badge>
          </div>
        </div>

        {/* Domain and URL - Fixed Height */}
        <div className="h-16 py-3">
          <h3 className="font-medium truncate">{source.domain}</h3>
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

        {/* Attributes Section - Fixed Height */}
        <div className="h-20 overflow-hidden">
          <div className="flex flex-wrap gap-1.5">
            {/* Buyer Personas */}
            {source.buyer_personas && source.buyer_personas.length > 0 && (
              source.buyer_personas.map((persona, i) => (
                <Badge 
                  key={i} 
                  variant="outline"
                  className={badgeVariants.buyerPersona}
                >
                  {persona}
                </Badge>
              ))
            )}

            {/* Journey Phases */}
            {source.buyer_journey_phases && source.buyer_journey_phases.length > 0 && (
              source.buyer_journey_phases.map((phase, i) => (
                <Badge 
                  key={i} 
                  variant="outline"
                  className={badgeVariants.buyerJourneyPhase}
                >
                  {JOURNEY_PHASE_LABELS[phase] || phase}
                </Badge>
              ))
            )}

            {/* Answer Engines */}
            {source.answer_engines && source.answer_engines.length > 0 && (
              source.answer_engines.map((engine, i) => (
                <Badge 
                  key={i} 
                  variant="outline"
                  className={badgeVariants.answerEngine}
                >
                  {ANSWER_ENGINE_LABELS[engine] || engine}
                </Badge>
              ))
            )}
          </div>
        </div>

        {/* Companies Section - Fixed Height */}
        <div className="h-24">
          <span className="text-xs font-medium text-muted-foreground">Companies Mentioned:</span>
          <div className="mt-2 flex flex-wrap gap-1.5 overflow-hidden">
            {displayedCompanies.map((company, i) => (
              <Badge 
                key={i} 
                variant="outline"
                className={badgeVariants.company}
              >
                {company.name} ({company.count})
              </Badge>
            ))}
            {remainingCount > 0 && (
              <Badge 
                variant="outline"
                className={badgeVariants.more}
              >
                +{remainingCount} more
              </Badge>
            )}
            {displayedCompanies.length === 0 && (
              <span className="text-xs text-muted-foreground">None found</span>
            )}
          </div>
        </div>
      </div>

      {/* View Details Section - Fixed Height */}
      <div className="h-12 border-t border-border/40 mt-auto">
        <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 h-full">
          <Button 
            variant="ghost" 
            className="w-full h-full bg-primary/5 hover:bg-primary/10 text-primary hover:text-primary/90 flex items-center justify-center gap-2 font-medium rounded-none"
          >
            View Details
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
} 