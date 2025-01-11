'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Building2, Plus, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { design } from '../../../../lib/design-system'

interface CompetitorsStepProps {
  existingCompetitors?: Array<{ id: string; name: string }>
  onComplete: (data: Array<{ type: 'existing' | 'new', data: { id?: string; name: string } }>) => void
}

export function CompetitorsStep({ existingCompetitors = [], onComplete }: CompetitorsStepProps) {
  const [newCompetitor, setNewCompetitor] = useState('')
  const [selectedCompetitors, setSelectedCompetitors] = useState<Array<{ type: 'existing' | 'new', data: { id?: string; name: string } }>>([])

  const handleAddExisting = (id: string) => {
    const competitor = existingCompetitors.find(c => c.id === id)
    if (!competitor) return
    if (selectedCompetitors.some(c => c.type === 'existing' && c.data.id === id)) return
    if (selectedCompetitors.length >= 4) return

    setSelectedCompetitors([...selectedCompetitors, {
      type: 'existing',
      data: {
        id: competitor.id,
        name: competitor.name
      }
    }])
  }

  const handleAddNew = () => {
    if (!newCompetitor.trim() || selectedCompetitors.length >= 4) return
    if (selectedCompetitors.some(c => c.type === 'new' && c.data.name === newCompetitor.trim())) return

    setSelectedCompetitors([...selectedCompetitors, {
      type: 'new',
      data: {
        name: newCompetitor.trim()
      }
    }])
    setNewCompetitor('')
  }

  const handleRemove = (index: number) => {
    setSelectedCompetitors(selectedCompetitors.filter((_, i) => i !== index))
  }

  const handleSubmit = () => {
    if (selectedCompetitors.length === 0) return
    onComplete(selectedCompetitors)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Add up to 4 main competitors ({selectedCompetitors.length}/4)</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Select Existing Competitor</Label>
            <Select
              onValueChange={handleAddExisting}
              value=""
            >
              <SelectTrigger className={design.components.input.base}>
                <SelectValue placeholder="Choose a competitor" />
              </SelectTrigger>
              <SelectContent>
                {existingCompetitors
                  .filter(c => !selectedCompetitors.some(sc => sc.type === 'existing' && sc.data.id === c.id))
                  .map((competitor) => (
                    <SelectItem key={competitor.id} value={competitor.id}>
                      {competitor.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Or enter new competitor name"
              value={newCompetitor}
              onChange={(e) => setNewCompetitor(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddNew()
                }
              }}
              className={design.components.input.base}
            />
            <Button
              variant="outline"
              onClick={handleAddNew}
              disabled={!newCompetitor.trim() || selectedCompetitors.length >= 4}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <AnimatePresence>
          <div className="min-h-[100px] flex flex-col gap-2">
            {selectedCompetitors.map((competitor, index) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                key={competitor.type === 'existing' ? competitor.data.id : competitor.data.name}
                className={design.components.listItem.base}
              >
                <div className="flex items-center gap-2">
                  <Building2 className={design.components.listItem.icon} />
                  <span className="font-medium">{competitor.data.name}</span>
                  {competitor.type === 'new' && (
                    <span className="text-xs text-muted-foreground">(New)</span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(design.components.button.icon, "text-destructive opacity-0 group-hover:opacity-100")}
                  onClick={() => handleRemove(index)}
                >
                  <X className={design.components.button.iconSize} />
                </Button>
              </motion.div>
            ))}
            {selectedCompetitors.length === 0 && (
              <div className="h-[100px] flex items-center justify-center">
                <p className={design.typography.subtitle}>Add your main competitors</p>
              </div>
            )}
          </div>
        </AnimatePresence>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={selectedCompetitors.length === 0}
          className={design.components.button.primary}
        >
          Continue
        </Button>
      </div>
    </div>
  )
} 