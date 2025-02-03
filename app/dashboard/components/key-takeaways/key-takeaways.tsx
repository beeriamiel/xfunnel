"use client"

import { LowHangingFruits } from "./components/low-hanging-fruits"
import { TechnicalChanges } from "./components/technical-changes"
import { ContentSuggestions } from "./components/content-suggestions"
import { MOCK_DATA } from "./types"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Sparkles } from "lucide-react"

interface KeyTakeawaysProps {
  companyId: number
  accountId: string
}

export function KeyTakeaways({ companyId, accountId }: KeyTakeawaysProps) {
  return (
    <div className="relative">
      <div className="blur-sm pointer-events-none">
        <div className="space-y-8 p-8">
          <LowHangingFruits opportunities={MOCK_DATA.lowHangingFruits} />
          <TechnicalChanges changes={MOCK_DATA.technicalChanges} />
          <ContentSuggestions suggestions={MOCK_DATA.contentSuggestions} />
        </div>
      </div>
      
      <div className="absolute inset-0 flex items-center justify-center bg-background/50">
        <Card className="w-full max-w-md p-6 shadow-lg border-2 border-primary/20 bg-gradient-to-b from-background to-background/95">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-2xl font-semibold tracking-tight">Premium Feature</h3>
            <p className="text-muted-foreground">Key takeaways are available exclusively for premium users</p>
            <Button size="lg" className="mt-4">
              Upgrade to Premium
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
} 