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
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { design } from '../../../lib/design-system'
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

  const handleNext = () => {
    onNext() // This will trigger handleStepComplete in parent
  }

  return (
    <Card className={cn(design.layout.card, design.spacing.card)}>
      <div className={design.layout.container}>
        <div className={design.layout.header}>
          <div className={design.layout.headerContent}>
            <h3 className={design.typography.title}>Competitors</h3>
            <p className={design.typography.subtitle}>Add up to 4 main competitors ({competitors.length}/4)</p>
          </div>
        </div>

        <AnimatePresence>
          <div className="min-h-[100px] flex flex-col gap-2">
            {competitors.map((competitor) => (
              <motion.div
                initial={design.animations.listItem.initial}
                animate={design.animations.listItem.animate}
                exit={design.animations.listItem.exit}
                key={competitor.id}
                className={design.components.listItem.base}
              >
                <div className="flex items-center gap-2">
                  <Building2 className={design.components.listItem.icon} />
                  <span className="font-medium">{competitor.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(design.components.button.icon, "text-destructive opacity-0 group-hover:opacity-100")}
                  onClick={() => onDeleteCompetitor(competitor.id)}
                >
                  <X className={design.components.button.iconSize} />
                </Button>
              </motion.div>
            ))}
            {competitors.length === 0 && !isGenerating && (
              <div className="h-[100px] flex flex-col items-center justify-center gap-2">
                <Sparkles className={cn(design.components.listItem.icon, "h-8 w-8")} />
                <p className={design.typography.subtitle}>Generating your competitors...</p>
              </div>
            )}
            {isGenerating && (
              <div className="h-[100px] flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-[#30035e]" />
                <p className={cn("ml-2", design.typography.subtitle)}>Generating suggestions...</p>
              </div>
            )}
          </div>
        </AnimatePresence>

        <div className="flex justify-between items-center pt-2">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                className={design.components.button.outline}
                disabled={competitors.length >= 4}
              >
                Add Competitor <Plus className={cn("ml-2", design.components.button.iconSize)} />
              </Button>
            </DialogTrigger>
            <DialogContent className={design.components.dialog.content}>
              <DialogHeader>
                <DialogTitle>Add Competitor</DialogTitle>
              </DialogHeader>
              <div className={design.components.dialog.body}>
                <Input
                  placeholder="Enter competitor name"
                  value={competitorName}
                  onChange={(e) => setCompetitorName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className={cn(design.components.input.base, design.typography.input)}
                  autoFocus
                />
              </div>
              <DialogFooter>
                <Button 
                  onClick={handleAddCompetitor}
                  disabled={!competitorName.trim()}
                  className={design.components.button.primary}
                >
                  Add Competitor
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button
            onClick={handleNext}
            disabled={competitors.length === 0 || isGenerating}
            className={design.components.button.primary}
          >
            Continue <ChevronRight className={cn("ml-2", design.components.button.iconSize)} />
          </Button>
        </div>
      </div>
    </Card>
  )
} 