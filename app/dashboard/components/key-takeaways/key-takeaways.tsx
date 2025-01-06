"use client"

import { LowHangingFruits } from "./components/low-hanging-fruits"
import { TechnicalChanges } from "./components/technical-changes"
import { ContentSuggestions } from "./components/content-suggestions"
import { MOCK_DATA } from "./types"

interface KeyTakeawaysProps {
  companyId: number
}

export function KeyTakeaways({ companyId }: KeyTakeawaysProps) {
  return (
    <div className="space-y-8 p-8">
      <LowHangingFruits opportunities={MOCK_DATA.lowHangingFruits} />
      <TechnicalChanges changes={MOCK_DATA.technicalChanges} />
      <ContentSuggestions suggestions={MOCK_DATA.contentSuggestions} />
    </div>
  )
} 