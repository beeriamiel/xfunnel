'use client'

import { Building2 } from "lucide-react"
import type { Competitor } from '../../types/setup'

interface CompetitorCardProps {
  competitor: Competitor;
}

export function CompetitorCard({ competitor }: CompetitorCardProps) {
  return (
    <div 
      className="flex items-center py-1.5 px-2 rounded-md hover:bg-[#f6efff]/50 transition-colors group"
    >
      <div className="flex items-center gap-2">
        <Building2 className="h-3.5 w-3.5 text-[#f9a8c9]" />
        <span className="text-sm text-[#30035e]">{competitor.name}</span>
      </div>
    </div>
  )
} 