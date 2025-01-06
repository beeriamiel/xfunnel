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
import { generatePersonaSuggestions } from '../../../utils/mock-suggestions'
import type { ICP, Persona } from '../../../types/analysis'

interface PersonaStepProps {
  icps: ICP[];
  personas: Persona[];
  onAddPersona: (persona: Omit<Persona, 'id'>, icpId: string) => void;
  onEditPersona: (persona: Persona) => void;
  onDeletePersona: (id: string) => void;
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
          const icp = icps.find(i => i.id === selectedICP)
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
    <Card className="w-full max-w-xl p-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-[#30035e]">Buyer Personas</h3>
            <p className="text-sm text-muted-foreground">Define your target buyer personas for each ICP</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Select ICP</Label>
            <Select value={selectedICP} onValueChange={setSelectedICP}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an ICP to add personas" />
              </SelectTrigger>
              <SelectContent>
                {icps.map((icp) => (
                  <SelectItem key={icp.id} value={icp.id}>
                    {icp.vertical} ({icp.region})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <AnimatePresence>
            <div className="min-h-[100px] flex flex-col">
              {personas.map((persona) => (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  key={persona.id}
                  className="group flex items-center justify-between p-2 hover:bg-[#f6efff]/50 rounded-md transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <UserCircle2 className="h-4 w-4 text-[#f9a8c9]" />
                    <div className="flex flex-col">
                      <span className="font-medium">{persona.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {persona.department} · {persona.seniority_level}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleEditPersona(persona)}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={() => onDeletePersona(persona.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </motion.div>
              ))}
              {!selectedICP && (
                <div className="h-[100px] flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">Select an ICP to add personas</p>
                </div>
              )}
              {selectedICP && personas.length === 0 && !isGenerating && (
                <div className="h-[100px] flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">Add your first persona</p>
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
        </div>

        <div className="flex justify-between items-center pt-2">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                className="border-[#30035e] text-[#30035e] hover:bg-[#30035e]/10"
                disabled={!selectedICP}
              >
                Add Persona <Plus className="ml-2 h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{editingPersona ? 'Edit' : 'Add'} Persona</DialogTitle>
                <DialogDescription>
                  Define your buyer persona. All fields are required.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    placeholder="e.g., Product Manager, CTO"
                    value={newPersona.title}
                    onChange={(e) => setNewPersona({ ...newPersona, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Input
                    placeholder="e.g., Engineering, Marketing"
                    value={newPersona.department}
                    onChange={(e) => setNewPersona({ ...newPersona, department: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Seniority Level</Label>
                  <Select 
                    value={newPersona.seniority_level} 
                    onValueChange={(value) => setNewPersona({ ...newPersona, seniority_level: value })}
                  >
                    <SelectTrigger>
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
                  className="bg-[#30035e] hover:bg-[#30035e]/90"
                >
                  {editingPersona ? 'Update' : 'Add'} Persona
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button
            onClick={onComplete}
            disabled={!personas.length || isGenerating}
            className="bg-[#30035e] hover:bg-[#30035e]/90"
          >
            Complete <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
} 