'use client'

import { useState, useEffect } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronRight, Plus, UserCircle2, Pencil, X, Loader2 } from "lucide-react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { design } from '../../../lib/design-system'
import { generatePersonaSuggestions } from '../../../utils/mock-suggestions'
import type { ICP, Persona } from '../../../types/analysis'

interface PersonaStepProps {
  icps: ICP[];
  personas: Persona[];
  onAddPersona: (persona: Omit<Persona, 'id'>, icpId: string) => void;
  onEditPersona: (persona: Persona) => void;
  onDeletePersona: (id: number) => void;
  onComplete: () => void;
}

export function PersonaStep({ 
  icps,
  personas,
  onAddPersona, 
  onEditPersona, 
  onDeletePersona,
  onComplete 
}: PersonaStepProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPersona, setEditingPersona] = useState<Persona | null>(null)
  const [selectedICP, setSelectedICP] = useState<string>('')
  const [newPersona, setNewPersona] = useState<Partial<Persona>>({
    title: '',
    seniority_level: '',
    department: ''
  })
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    const generateSuggestions = async () => {
      if (selectedICP && !personas.length) {
        setIsGenerating(true)
        try {
          const icp = icps.find(i => i.id.toString() === selectedICP)
          if (icp) {
            const suggestions = await generatePersonaSuggestions(icp)
            suggestions.forEach(persona => {
              onAddPersona({
                title: persona.title,
                seniority_level: persona.seniority_level,
                department: persona.department
              }, selectedICP)
            })
          }
        } catch (error) {
          console.error('Failed to generate persona suggestions:', error)
        }
        setIsGenerating(false)
      }
    }

    generateSuggestions()
  }, [selectedICP, personas.length, icps, onAddPersona])

  const handleAddPersona = () => {
    if (!newPersona.title || !newPersona.seniority_level || !newPersona.department || !selectedICP) return
    onAddPersona(newPersona as Omit<Persona, 'id'>, selectedICP)
    setNewPersona({ title: '', seniority_level: '', department: '' })
    setDialogOpen(false)
  }

  const handleEditPersona = (persona: Persona) => {
    setEditingPersona(persona)
    setNewPersona(persona)
    setDialogOpen(true)
  }

  const handleUpdatePersona = () => {
    if (!editingPersona || !newPersona.title || !newPersona.seniority_level || !newPersona.department) return
    onEditPersona({ ...editingPersona, ...newPersona as Persona })
    setEditingPersona(null)
    setNewPersona({ title: '', seniority_level: '', department: '' })
    setDialogOpen(false)
  }

  return (
    <Card className={cn(design.layout.card, design.spacing.card)}>
      <div className={design.layout.container}>
        <div className={design.layout.header}>
          <div className={design.layout.headerContent}>
            <h3 className={design.typography.title}>Buyer Personas</h3>
            <p className={design.typography.subtitle}>Define your target buyer personas for each ICP</p>
          </div>
        </div>

        <div className={design.spacing.section}>
          <div className={design.spacing.element}>
            <Label className={design.typography.label}>Select ICP</Label>
            <Select 
              value={selectedICP} 
              onValueChange={setSelectedICP}
            >
              <SelectTrigger className={design.components.input.base}>
                <SelectValue placeholder="Choose an ICP to add personas" />
              </SelectTrigger>
              <SelectContent>
                {icps.map((icp) => (
                  <SelectItem key={icp.id} value={icp.id.toString()}>
                    {icp.vertical} ({icp.region})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <AnimatePresence>
            <div className="min-h-[100px] flex flex-col gap-2">
              {personas.map((persona) => (
                <motion.div
                  initial={design.animations.listItem.initial}
                  animate={design.animations.listItem.animate}
                  exit={design.animations.listItem.exit}
                  key={persona.id}
                  className={design.components.listItem.base}
                >
                  <div className="flex items-center gap-2">
                    <UserCircle2 className={design.components.listItem.icon} />
                    <div className="flex flex-col">
                      <span className="font-medium">{persona.title}</span>
                      <span className={design.typography.subtitle}>
                        {persona.department} · {persona.seniority_level}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                    <Button
                      variant="ghost"
                      size="icon"
                      className={design.components.button.icon}
                      onClick={() => handleEditPersona(persona)}
                    >
                      <Pencil className={design.components.button.iconSize} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(design.components.button.icon, "text-destructive")}
                      onClick={() => onDeletePersona(persona.id)}
                    >
                      <X className={design.components.button.iconSize} />
                    </Button>
                  </div>
                </motion.div>
              ))}
              {!selectedICP && (
                <div className="h-[100px] flex items-center justify-center">
                  <p className={design.typography.subtitle}>Select an ICP to add personas</p>
                </div>
              )}
              {selectedICP && personas.length === 0 && !isGenerating && (
                <div className="h-[100px] flex items-center justify-center">
                  <p className={design.typography.subtitle}>Add your first persona</p>
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
        </div>

        <div className="flex justify-between items-center pt-2">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                className={design.components.button.outline}
                disabled={!selectedICP}
              >
                Add Persona <Plus className={cn("ml-2", design.components.button.iconSize)} />
              </Button>
            </DialogTrigger>
            <DialogContent className={design.components.dialog.content}>
              <DialogHeader>
                <DialogTitle>{editingPersona ? 'Edit' : 'Add'} Persona</DialogTitle>
                <DialogDescription>
                  Define your buyer persona. All fields are required.
                </DialogDescription>
              </DialogHeader>
              <div className={design.components.dialog.body}>
                <div className={design.spacing.element}>
                  <Label className={design.typography.label}>Title</Label>
                  <Input
                    placeholder="e.g., Product Manager, CTO"
                    value={newPersona.title}
                    onChange={(e) => setNewPersona({ ...newPersona, title: e.target.value })}
                    className={design.components.input.base}
                  />
                </div>
                <div className={design.spacing.element}>
                  <Label className={design.typography.label}>Department</Label>
                  <Input
                    placeholder="e.g., Engineering, Marketing"
                    value={newPersona.department}
                    onChange={(e) => setNewPersona({ ...newPersona, department: e.target.value })}
                    className={design.components.input.base}
                  />
                </div>
                <div className={design.spacing.element}>
                  <Label className={design.typography.label}>Seniority Level</Label>
                  <Select 
                    value={newPersona.seniority_level} 
                    onValueChange={(value) => setNewPersona({ ...newPersona, seniority_level: value })}
                  >
                    <SelectTrigger className={design.components.input.base}>
                      <SelectValue placeholder="Select seniority level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Junior">Junior</SelectItem>
                      <SelectItem value="Mid-Level">Mid-Level</SelectItem>
                      <SelectItem value="Senior">Senior</SelectItem>
                      <SelectItem value="Lead">Lead</SelectItem>
                      <SelectItem value="Manager">Manager</SelectItem>
                      <SelectItem value="Director">Director</SelectItem>
                      <SelectItem value="VP">VP</SelectItem>
                      <SelectItem value="C-Level">C-Level</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  onClick={editingPersona ? handleUpdatePersona : handleAddPersona}
                  disabled={!newPersona.title || !newPersona.seniority_level || !newPersona.department}
                  className={design.components.button.primary}
                >
                  {editingPersona ? 'Update' : 'Add'} Persona
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button
            onClick={onComplete}
            disabled={personas.length === 0 || isGenerating}
            className={design.components.button.primary}
          >
            Complete <ChevronRight className={cn("ml-2", design.components.button.iconSize)} />
          </Button>
        </div>
      </div>
    </Card>
  )
} 