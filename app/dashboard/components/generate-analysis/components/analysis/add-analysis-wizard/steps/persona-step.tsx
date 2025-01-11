'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { design } from '../../../../lib/design-system'

interface PersonaStepProps {
  existingPersonas?: Array<{
    id: number
    title: string
    department: string
    seniority_level: string
    icp_id: number
  }>
  selectedIcpId?: number
  onComplete: (data: { 
    type: 'existing' | 'new',
    data: {
      id?: number
      title: string
      department: string
      seniority_level: string
    }
  }) => void
}

type Mode = 'select' | 'create'

const DEPARTMENTS = [
  'Engineering',
  'Product',
  'Marketing',
  'Sales',
  'Finance',
  'HR',
  'Operations',
  'Legal',
  'Executive'
]

const SENIORITY_LEVELS = [
  'C-Level',
  'VP',
  'Director',
  'Manager',
  'Individual Contributor'
]

export function PersonaStep({ existingPersonas = [], selectedIcpId, onComplete }: PersonaStepProps) {
  const [mode, setMode] = useState<Mode>(existingPersonas.length > 0 ? 'select' : 'create')
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>('')
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    seniority_level: ''
  })

  // Filter personas by ICP if selectedIcpId is provided
  const filteredPersonas = selectedIcpId
    ? existingPersonas.filter(p => p.icp_id === selectedIcpId)
    : existingPersonas

  const handleSubmit = () => {
    if (mode === 'select') {
      if (!selectedPersonaId) return
      const selectedPersona = existingPersonas.find(p => p.id.toString() === selectedPersonaId)
      if (!selectedPersona) return
      onComplete({
        type: 'existing',
        data: {
          id: selectedPersona.id,
          title: selectedPersona.title,
          department: selectedPersona.department,
          seniority_level: selectedPersona.seniority_level
        }
      })
    } else {
      if (!formData.title || !formData.department || !formData.seniority_level) return
      onComplete({
        type: 'new',
        data: {
          title: formData.title,
          department: formData.department,
          seniority_level: formData.seniority_level
        }
      })
    }
  }

  if (filteredPersonas.length === 0) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Title</Label>
          <Input
            placeholder="e.g. Product Manager, Sales Director"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className={design.components.input.base}
          />
        </div>

        <div className="space-y-2">
          <Label>Department</Label>
          <Select
            value={formData.department}
            onValueChange={(value) => setFormData({ ...formData, department: value })}
          >
            <SelectTrigger className={design.components.input.base}>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {DEPARTMENTS.map((department) => (
                <SelectItem key={department} value={department}>
                  {department}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Seniority Level</Label>
          <Select
            value={formData.seniority_level}
            onValueChange={(value) => setFormData({ ...formData, seniority_level: value })}
          >
            <SelectTrigger className={design.components.input.base}>
              <SelectValue placeholder="Select seniority level" />
            </SelectTrigger>
            <SelectContent>
              {SENIORITY_LEVELS.map((level) => (
                <SelectItem key={level} value={level}>
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={!formData.title || !formData.department || !formData.seniority_level}
            className={design.components.button.primary}
          >
            Complete
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Button
          variant={mode === 'select' ? 'default' : 'outline'}
          onClick={() => setMode('select')}
          className="flex-1"
        >
          Select Existing
        </Button>
        <Button
          variant={mode === 'create' ? 'default' : 'outline'}
          onClick={() => setMode('create')}
          className="flex-1"
        >
          Create New
        </Button>
      </div>

      {mode === 'select' ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Select Persona</Label>
            <Select
              value={selectedPersonaId}
              onValueChange={setSelectedPersonaId}
            >
              <SelectTrigger className={design.components.input.base}>
                <SelectValue placeholder="Choose a persona" />
              </SelectTrigger>
              <SelectContent>
                {filteredPersonas.map((persona) => (
                  <SelectItem key={persona.id} value={persona.id.toString()}>
                    <div className="flex flex-col">
                      <span>{persona.title}</span>
                      <span className="text-muted-foreground text-sm">
                        {persona.department} · {persona.seniority_level}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              placeholder="e.g. Product Manager, Sales Director"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={design.components.input.base}
            />
          </div>

          <div className="space-y-2">
            <Label>Department</Label>
            <Select
              value={formData.department}
              onValueChange={(value) => setFormData({ ...formData, department: value })}
            >
              <SelectTrigger className={design.components.input.base}>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {DEPARTMENTS.map((department) => (
                  <SelectItem key={department} value={department}>
                    {department}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Seniority Level</Label>
            <Select
              value={formData.seniority_level}
              onValueChange={(value) => setFormData({ ...formData, seniority_level: value })}
            >
              <SelectTrigger className={design.components.input.base}>
                <SelectValue placeholder="Select seniority level" />
              </SelectTrigger>
              <SelectContent>
                {SENIORITY_LEVELS.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={
            mode === 'select' 
              ? !selectedPersonaId 
              : (!formData.title || !formData.department || !formData.seniority_level)
          }
          className={design.components.button.primary}
        >
          Complete
        </Button>
      </div>
    </div>
  )
} 