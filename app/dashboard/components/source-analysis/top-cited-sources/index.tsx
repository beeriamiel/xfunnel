'use client'

import { memo } from 'react'
import { TopCitedMentions } from './top-cited-mentions'
import { TopCitedRankings } from './top-cited-rankings'
import { ScrollArea } from "@/components/ui/scroll-area"

interface TopCitedSourcesProps {
  companyId: number | null
}

export const TopCitedSources = memo(function TopCitedSources({
  companyId
}: TopCitedSourcesProps) {
  return (
    <div className="grid grid-cols-2 gap-8">
      {/* Left Column - Mentions */}
      <div className="space-y-4">
        <div className="space-y-1.5">
          <h2 className="text-xl font-semibold tracking-tight">
            Most Cited Sources - Mentions
          </h2>
          <p className="text-sm text-muted-foreground">
            Top 10 most frequently cited sources in Problem Exploration & Solution Education phases
          </p>
        </div>
        <div className="relative">
          <TopCitedMentions companyId={companyId} />
          <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-background to-transparent pointer-events-none" />
        </div>
      </div>

      {/* Right Column - Rankings */}
      <div className="space-y-4 pl-8 border-l">
        <div className="space-y-1.5">
          <h2 className="text-xl font-semibold tracking-tight">
            Most Cited Sources - Rankings
          </h2>
          <p className="text-sm text-muted-foreground">
            Top 10 most frequently cited sources in Solution Comparison & Final Research phases
          </p>
        </div>
        <div className="relative">
          <TopCitedRankings companyId={companyId} />
          <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-background to-transparent pointer-events-none" />
        </div>
      </div>
    </div>
  )
}) 