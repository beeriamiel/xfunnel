'use client'

import { useState } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Building2, ChevronRight, Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { Competitor } from '../../../types/setup'

interface CompetitorStepProps {
  competitors: Competitor[];
  onAddCompetitors: (competitors: Omit<Competitor, 'id'>[]) => void;
  onNext: () => void;
  isLoading?: boolean;
}

export function CompetitorStep({ 
  competitors, 
  onAddCompetitors, 
  onNext,
  isLoading = false 
}: CompetitorStepProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [competitorNames, setCompetitorNames] = useState(['', '', '', ''])

  const handleCompetitorNameChange = (index: number, value: string) => {
    const newNames = [...competitorNames]
    newNames[index] = value
    setCompetitorNames(newNames)
  }

  const handleAddCompetitors = () => {
    const newCompetitors = competitorNames
      .filter(name => name.trim())
      .map((name: string) => ({
        name: name.trim()
      }))
    
    if (newCompetitors.length > 0) {
      onAddCompetitors(newCompetitors)
      setCompetitorNames(['', '', '', ''])
      setDialogOpen(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl p-4">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-[#30035e]">Competitors</h3>
          <p className="text-sm text-muted-foreground">
            {competitors.length > 0 
              ? "These competitors were auto-generated based on your company profile."
              : "Add your main competitors to analyze."}
          </p>
        </div>

        <div className="min-h-[100px] max-h-[300px] overflow-y-auto">
          <div className="grid gap-2">
            {competitors.map((competitor) => (
              <div 
                key={competitor.id}
                className="flex items-center py-1.5 px-2 rounded-md hover:bg-[#f6efff]/50 transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <Building2 className="h-3.5 w-3.5 text-[#f9a8c9]" />
                  <span className="text-sm text-[#30035e]">{competitor.name}</span>
                </div>
              </div>
            ))}
            {competitors.length === 0 && (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No competitors added yet
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center pt-2">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#30035e] hover:bg-[#30035e]/90">
                Add Competitors <Plus className="ml-2 h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add Competitors</DialogTitle>
                <DialogDescription>
                  Add up to 4 main competitors in your industry
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-3 py-4">
                {[0, 1, 2, 3].map((index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-[#f9a8c9] shrink-0" />
                    <Input
                      placeholder={`Competitor ${index + 1}`}
                      value={competitorNames[index]}
                      onChange={(e) => handleCompetitorNameChange(index, e.target.value)}
                    />
                  </div>
                ))}
              </div>
              <DialogFooter>
                <Button 
                  onClick={handleAddCompetitors}
                  disabled={!competitorNames.some(name => name.trim())}
                  className="bg-[#30035e] hover:bg-[#30035e]/90"
                >
                  Add Competitors
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button
            onClick={onNext}
            disabled={competitors.length === 0 || isLoading}
            className="bg-[#30035e] hover:bg-[#30035e]/90"
          >
            {isLoading ? (
              <>Analyzing...</>
            ) : (
              <>Continue <ChevronRight className="ml-2 h-4 w-4" /></>
            )}
          </Button>
        </div>
      </div>
    </Card>
  )
} 