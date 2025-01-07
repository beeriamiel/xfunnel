'use client'

import { useState } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronRight, Plus, Building2, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { Competitor } from '../../../types/analysis'

interface CompetitorStepProps {
  competitors: Competitor[];
  onAddCompetitor: (competitor: Omit<Competitor, 'id'>) => void;
  onDeleteCompetitor: (id: string) => void;
  onNext: () => void;
}

export function CompetitorStep({ 
  competitors, 
  onAddCompetitor, 
  onDeleteCompetitor,
  onNext 
}: CompetitorStepProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [competitorName, setCompetitorName] = useState('')

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
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-[#30035e]">Competitors</h3>
            <p className="text-sm text-muted-foreground">Add up to 4 main competitors ({competitors.length}/4)</p>
          </div>
        </div>

        <AnimatePresence>
          <div className="min-h-[100px] flex flex-col gap-1">
            {competitors.map((competitor) => (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                key={competitor.id}
                className="group flex items-center justify-between p-2 hover:bg-[#f6efff]/50 rounded-md transition-colors"
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
            {competitors.length === 0 && (
              <div className="h-[100px] flex items-center justify-center">
                <p className="text-sm text-muted-foreground">Add your first competitor</p>
              </div>
            )}
          </div>
        </AnimatePresence>

        <div className="flex justify-between items-center pt-2">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                className="border-[#30035e] text-[#30035e] hover:bg-[#30035e]/10"
                disabled={competitors.length >= 4}
              >
                Add Competitor <Plus className="ml-2 h-4 w-4" />
              </Button>
            </DialogTrigger>
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
            disabled={competitors.length === 0}
            className="bg-[#30035e] hover:bg-[#30035e]/90"
          >
            Continue <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
} 