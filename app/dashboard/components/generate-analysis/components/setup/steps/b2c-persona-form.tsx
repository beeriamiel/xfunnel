'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  GENDERS,
  ADDITIONAL_TRAITS,
} from '../../../types/b2c-mappings'
import { design } from '../../../lib/design-system'
import { cn } from "@/lib/utils"

interface B2CPersonaFormProps {
  onSubmit: (personaData: any) => void
  isEditing?: boolean
  initialData?: {
    gender?: string
    traits?: string[]
  }
}

export function B2CPersonaForm({ onSubmit, isEditing = false, initialData = {} }: B2CPersonaFormProps) {
  const [formData, setFormData] = useState({
    gender: initialData.gender || '',
    traits: initialData.traits || []
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Map B2C fields to B2B persona fields
    const b2bData = {
      title: formData.gender, // Map gender to title
      department: formData.traits[0] || 'General Consumer', // First trait maps to department
      seniority_level: formData.traits[1] || 'Consumer' // Second trait maps to seniority
    }
    onSubmit(b2bData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label>Gender</Label>
          <Select
            value={formData.gender}
            onValueChange={(value) => setFormData({ ...formData, gender: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              {GENDERS.map((gender) => (
                <SelectItem key={gender} value={gender}>
                  {gender}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Consumer Traits (Select up to 2)</Label>
          <p className="text-sm text-muted-foreground mb-2">
            These traits help us understand your consumer better
          </p>
          <div className="grid grid-cols-2 gap-2">
            {ADDITIONAL_TRAITS.map((trait) => (
              <Button
                key={trait}
                type="button"
                variant={formData.traits.includes(trait) ? "default" : "outline"}
                className={cn(
                  "h-auto py-2 px-4 justify-start",
                  formData.traits.includes(trait) && "bg-primary text-primary-foreground"
                )}
                onClick={() => {
                  if (formData.traits.includes(trait)) {
                    setFormData({
                      ...formData,
                      traits: formData.traits.filter(t => t !== trait)
                    })
                  } else if (formData.traits.length < 2) {
                    setFormData({
                      ...formData,
                      traits: [...formData.traits, trait]
                    })
                  }
                }}
                disabled={!formData.traits.includes(trait) && formData.traits.length >= 2}
              >
                {trait}
              </Button>
            ))}
          </div>
          {formData.traits.length > 0 && (
            <div className="mt-2 text-sm text-muted-foreground">
              Selected traits: {formData.traits.join(', ')}
            </div>
          )}
        </div>
      </div>

      <Button
        type="submit"
        className={design.components.button.primary}
        disabled={!formData.gender || formData.traits.length === 0}
      >
        {isEditing ? 'Update' : 'Add'} Consumer Details
      </Button>
    </form>
  )
} 