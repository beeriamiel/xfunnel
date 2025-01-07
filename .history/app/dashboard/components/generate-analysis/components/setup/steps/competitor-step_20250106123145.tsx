'use client'

import { useState, useEffect } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronRight, Plus, Building2, X, Loader2, Sparkles } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { generateCompetitorSuggestions } from '../../../utils/mock-suggestions'
import type { Competitor } from '../../../types/analysis'

interface CompetitorStepProps {
  companyName: string;
  products: Array<{ id: string; name: string }>;
  competitors: Competitor[];
  onAddCompetitor: (competitor: Omit<Competitor, 'id'>) => void;
  onDeleteCompetitor: (id: string) => void;
  onNext: () => void;
}

export function CompetitorStep({ 
  companyName,
  products,
  competitors, 
  onAddCompetitor, 
  onDeleteCompetitor,
  onNext 
}: CompetitorStepProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [competitorName, setCompetitorName] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  // Auto-generate competitors when component mounts
  useEffect(() => {
    const generateInitialCompetitors = async () => {
      if (competitors.length === 0 && products.length > 0) {
        setIsGenerating(true)
        try {
          const suggestions = await generateCompetitorSuggestions(
            companyName,
            products.map(p => p.name)
          )
          suggestions.forEach(competitor => {
            onAddCompetitor({
              name: competitor.name
            })
          })
        } catch (error) {
          console.error('Failed to generate competitor suggestions:', error)
        }
        setIsGenerating(false)
      }
    }

    generateInitialCompetitors()
  }, []) // Only run once on mount

  const handleAddCompetitor = () => {
    if (!competitorName.trim() || competitors.length >= 4) return
    onAddCompetitor({ name: competitorName.trim() })
    setCompetitorName('')
    setDialogOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddCompetitor()
    }
  }

  return (
    <Card className="w-full max-w-xl p-4">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-[#30035e]">Competitors</h3>
          <p className="text-sm text-muted-foreground">Add up to 4 main competitors ({competitors.length}/4)</p>
        </div>

        <AnimatePresence>
          <div className="min-h-[100px] flex flex-col gap-2">
            {competitors.map((competitor) => (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                key={competitor.id}
                className="group flex items-center justify-between p-3 hover:bg-[#f6efff]/50 rounded-md transition-colors border"
              >
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-[#f9a8c9]" />
                  <span className="font-medium">{competitor.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive opacity-0 group-hover:opacity-100"
                  onClick={() => onDeleteCompetitor(competitor.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </motion.div>
            ))}
            {competitors.length === 0 && !isGenerating && (
              <div className="h-[100px] flex flex-col items-center justify-center gap-2 text-muted-foreground">
                <Sparkles className="h-8 w-8 text-[#f9a8c9]" />
                <p className="text-sm">Generating your competitors...</p>
              </div>
            )}
            {isGenerating && (
              <div className="h-[100px] flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-[#30035e]" />
                <p className="ml-2 text-sm text-muted-foreground">Generating suggestions...</p>
              </div>
            )}
          </div>
        </AnimatePresence>

        <div className="flex justify-between items-center pt-2">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <Button 
              variant="outline" 
              className="border-[#30035e] text-[#30035e] hover:bg-[#30035e]/10"
              disabled={competitors.length >= 4}
              onClick={() => setDialogOpen(true)}
            >
              Add Competitor <Plus className="ml-2 h-4 w-4" />
            </Button>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add Competitor</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <Input
                  placeholder="Enter competitor name"
                  value={competitorName}
                  onChange={(e) => setCompetitorName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="h-12 text-lg"
                  autoFocus
                />
              </div>
              <div className="flex justify-end">
                <Button 
                  onClick={handleAddCompetitor}
                  disabled={!competitorName.trim()}
                  className="bg-[#30035e] hover:bg-[#30035e]/90"
                >
                  Add Competitor
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button
            onClick={onNext}
            disabled={competitors.length === 0 || isGenerating}
            className="bg-[#30035e] hover:bg-[#30035e]/90"
          >
            Continue <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
} 