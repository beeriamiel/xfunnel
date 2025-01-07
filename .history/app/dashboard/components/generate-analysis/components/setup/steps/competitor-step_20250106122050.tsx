'use client'

import { useState, useEffect } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronRight, Plus, Building2, Pencil, X, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { generateCompetitorSuggestions } from '../../../utils/mock-suggestions'
import type { Competitor } from '../../../types/analysis'

interface CompetitorStepProps {
  companyName: string;
  products: Array<{ id: string; name: string }>;
  competitors: Competitor[];
  onAddCompetitor: (competitor: Omit<Competitor, 'id'>) => void;
  onEditCompetitor: (competitor: Competitor) => void;
  onDeleteCompetitor: (id: string) => void;
  onNext: () => void;
}

export function CompetitorStep({ 
  companyName,
  products,
  competitors, 
  onAddCompetitor, 
  onEditCompetitor, 
  onDeleteCompetitor,
  onNext 
}: CompetitorStepProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCompetitor, setEditingCompetitor] = useState<Competitor | null>(null)
  const [newCompetitor, setNewCompetitor] = useState<Partial<Competitor>>({
    name: '',
    website: '',
    description: ''
  })
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    const generateSuggestions = async () => {
      if (competitors.length === 0 && products.length > 0) {
        setIsGenerating(true)
        try {
          const suggestions = await generateCompetitorSuggestions(
            companyName,
            products.map(p => p.name)
          )
          suggestions.forEach(competitor => {
            onAddCompetitor({
              name: competitor.name,
              website: competitor.website,
              description: competitor.description
            })
          })
        } catch (error) {
          console.error('Failed to generate competitor suggestions:', error)
        }
        setIsGenerating(false)
      }
    }

    generateSuggestions()
  }, [companyName, products, competitors.length, onAddCompetitor])

  const handleAddCompetitor = () => {
    if (!newCompetitor.name) return
    onAddCompetitor(newCompetitor as Omit<Competitor, 'id'>)
    setNewCompetitor({ name: '', website: '', description: '' })
    setDialogOpen(false)
  }

  const handleEditCompetitor = (competitor: Competitor) => {
    setEditingCompetitor(competitor)
    setNewCompetitor(competitor)
    setDialogOpen(true)
  }

  const handleUpdateCompetitor = () => {
    if (!editingCompetitor || !newCompetitor.name) return
    onEditCompetitor({ ...editingCompetitor, ...newCompetitor as Competitor })
    setEditingCompetitor(null)
    setNewCompetitor({ name: '', website: '', description: '' })
    setDialogOpen(false)
  }

  return (
    <Card className="w-full max-w-xl p-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-[#30035e]">Competitors</h3>
            <p className="text-sm text-muted-foreground">Add or edit your main competitors</p>
          </div>
        </div>

        <AnimatePresence>
          <div className="min-h-[100px] flex flex-col">
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
                  <div className="flex flex-col">
                    <span className="font-medium">{competitor.name}</span>
                    {competitor.website && (
                      <a 
                        href={`https://${competitor.website}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-muted-foreground hover:underline"
                      >
                        {competitor.website}
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleEditCompetitor(competitor)}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive"
                    onClick={() => onDeleteCompetitor(competitor.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </motion.div>
            ))}
            {competitors.length === 0 && !isGenerating && (
              <div className="h-[100px] flex items-center justify-center">
                <p className="text-sm text-muted-foreground">Add your first competitor</p>
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
            <DialogTrigger asChild>
              <Button variant="outline" className="border-[#30035e] text-[#30035e] hover:bg-[#30035e]/10">
                Add Competitor <Plus className="ml-2 h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{editingCompetitor ? 'Edit' : 'Add'} Competitor</DialogTitle>
                <DialogDescription>
                  Add details about your competitor. Name is required.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>Competitor Name</Label>
                  <Input
                    placeholder="Enter competitor name"
                    value={newCompetitor.name}
                    onChange={(e) => setNewCompetitor({ ...newCompetitor, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Website</Label>
                  <Input
                    placeholder="Enter website URL"
                    value={newCompetitor.website}
                    onChange={(e) => setNewCompetitor({ ...newCompetitor, website: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    placeholder="Enter description"
                    value={newCompetitor.description}
                    onChange={(e) => setNewCompetitor({ ...newCompetitor, description: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  onClick={editingCompetitor ? handleUpdateCompetitor : handleAddCompetitor}
                  disabled={!newCompetitor.name}
                  className="bg-[#30035e] hover:bg-[#30035e]/90"
                >
                  {editingCompetitor ? 'Update' : 'Add'} Competitor
                </Button>
              </DialogFooter>
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