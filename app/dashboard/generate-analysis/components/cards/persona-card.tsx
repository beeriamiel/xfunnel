'use client'

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Pencil, X } from "lucide-react"
import type { Persona } from '../../types/analysis'

interface PersonaCardProps {
  persona: Persona;
  onEdit: (persona: Persona) => void;
  onDelete: (id: number) => void;
}

export function PersonaCard({ persona, onEdit, onDelete }: PersonaCardProps) {
  return (
    <Card 
      className="p-4 min-w-[250px] space-y-3 bg-[#f6efff]/50 hover:bg-[#f6efff] transition-colors group relative"
    >
      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
        <Button
          size="icon"
          variant="ghost"
          onClick={() => onEdit(persona)}
          className="h-8 w-8"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => onDelete(persona.id)}
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
  )
} 