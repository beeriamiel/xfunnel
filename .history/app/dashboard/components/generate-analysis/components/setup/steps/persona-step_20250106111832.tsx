'use client'

import { useState } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Users, ChevronRight, Plus, Pencil, X, Check } from "lucide-react"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
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
import { Label } from "@/components/ui/label"
import type { Persona } from '../../../types/analysis'

interface PersonaStepProps {
  personas: Persona[];
  onAddPersona: (persona: Omit<Persona, 'id'>) => void;
  onEditPersona: (persona: Persona) => void;
  onDeletePersona: (id: number) => void;
  onComplete: () => void;
  isLoading?: boolean;
}

export function PersonaStep({ 
  personas, 
  onAddPersona, 
  onEditPersona, 
  onDeletePersona,
  onComplete,
  isLoading = false 
}: PersonaStepProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPersona, setEditingPersona] = useState<Persona | null>(null)
  const [newPersona, setNewPersona] = useState<Partial<Persona>>({
    title: '',
    seniority_level: '',
    department: ''
  })

  const handleAddPersona = () => {
    if (!newPersona.title || !newPersona.seniority_level || !newPersona.department) return
    onAddPersona(newPersona as Omit<Persona, 'id'>)
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
    <Card className="w-full max-w-4xl p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-[#30035e]">Initial Personas</h3>
          <p className="text-sm text-muted-foreground">
            {personas.length > 0 
              ? "These personas have been auto-generated based on your company profile."
              : "Add your buyer personas."}
          </p>
        </div>

        <ScrollArea className="w-full">
          <div className="flex gap-4 pb-4">
            {personas.map((persona) => (
              <Card 
                key={persona.id} 
                className="p-4 min-w-[250px] space-y-3 bg-[#f6efff]/50 hover:bg-[#f6efff] transition-colors group relative"
              >
                <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleEditPersona(persona)}
                    className="h-8 w-8"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onDeletePersona(persona.id)}
                    className="h-8 w-8 text-red-500 hover:text-red-600"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-[#f9a8c9]" />
                  <span className="font-medium text-[#30035e]">{persona.title}</span>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div>Seniority: {persona.seniority_level}</div>
                  <div>Department: {persona.department}</div>
                </div>
              </Card>
            ))}
            {personas.length === 0 && (
              <div className="w-full py-8 text-center text-sm text-muted-foreground">
                No personas added yet
              </div>
            )}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        <div className="flex justify-between items-center pt-4">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#30035e] hover:bg-[#30035e]/90">
                Add Persona <Plus className="ml-2 h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{editingPersona ? 'Edit' : 'Add'} Persona</DialogTitle>
                <DialogDescription>
                  Add details about your buyer persona. All fields are required.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    placeholder="Enter title"
                    value={newPersona.title}
                    onChange={(e) => setNewPersona({ ...newPersona, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Seniority</Label>
                  <Select
                    value={newPersona.seniority_level}
                    onValueChange={(value: string) => setNewPersona({ ...newPersona, seniority_level: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select seniority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Junior">Junior</SelectItem>
                      <SelectItem value="Mid-Level">Mid-Level</SelectItem>
                      <SelectItem value="Senior">Senior</SelectItem>
                      <SelectItem value="Lead">Lead</SelectItem>
                      <SelectItem value="Director">Director</SelectItem>
                      <SelectItem value="VP">VP</SelectItem>
                      <SelectItem value="C-Level">C-Level</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Select
                    value={newPersona.department}
                    onValueChange={(value: string) => setNewPersona({ ...newPersona, department: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Engineering">Engineering</SelectItem>
                      <SelectItem value="Product">Product</SelectItem>
                      <SelectItem value="Design">Design</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Sales">Sales</SelectItem>
                      <SelectItem value="Operations">Operations</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="HR">HR</SelectItem>
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
            disabled={personas.length === 0 || isLoading}
            className="bg-[#30035e] hover:bg-[#30035e]/90"
          >
            {isLoading ? (
              <>Generating...</>
            ) : (
              <>Complete Setup <Check className="ml-2 h-4 w-4" /></>
            )}
          </Button>
        </div>
      </div>
    </Card>
  )
} 