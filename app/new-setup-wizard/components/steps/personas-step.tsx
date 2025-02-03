'use client'

import { useState } from 'react'
import { useWizard } from '../../context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Plus, Pencil, X, Users, Building2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { StepHeader } from '../step-header'
import type { ICP, Persona } from '../../types'

interface PersonaFormData {
  icpIndex: number
  title: string
  seniority_level: string
  department: string
}

const initialFormData: PersonaFormData = {
  icpIndex: 0,
  title: '',
  seniority_level: '',
  department: ''
}

const SENIORITY_LEVELS = [
  'C-Level',
  'VP',
  'Director',
  'Manager',
  'Individual Contributor'
]

const COMMON_DEPARTMENTS = [
  'Executive',
  'Sales',
  'Marketing',
  'Product',
  'Engineering',
  'Finance',
  'HR',
  'Operations',
  'Customer Success',
  'Legal'
]

export function PersonasStep() {
  const { dispatch, icps, isLoading } = useWizard()
  const [formData, setFormData] = useState<PersonaFormData>(initialFormData)
  const [editingData, setEditingData] = useState<{ icpIndex: number; personaIndex: number } | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleInputChange = (field: keyof PersonaFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setValidationError(null)
  }

  const handleSubmit = () => {
    if (!formData.title || !formData.seniority_level || !formData.department) {
      setValidationError('All fields are required')
      return
    }

    dispatch({ type: 'SET_LOADING', payload: true })

    try {
      const updatedICPs = [...icps]
      const icp = updatedICPs[formData.icpIndex]

      if (editingData) {
        icp.personas[editingData.personaIndex] = {
          title: formData.title,
          seniority_level: formData.seniority_level,
          department: formData.department
        }
      } else {
        icp.personas.push({
          title: formData.title,
          seniority_level: formData.seniority_level,
          department: formData.department
        })
      }

      dispatch({
        type: 'SET_ICPS',
        payload: updatedICPs
      })

      setDialogOpen(false)
      setFormData(initialFormData)
      setEditingData(null)
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const handleEdit = (icpIndex: number, personaIndex: number) => {
    const persona = icps[icpIndex].personas[personaIndex]
    setFormData({
      icpIndex,
      title: persona.title,
      seniority_level: persona.seniority_level,
      department: persona.department
    })
    setEditingData({ icpIndex, personaIndex })
    setDialogOpen(true)
  }

  const handleDelete = (icpIndex: number, personaIndex: number) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      const updatedICPs = [...icps]
      updatedICPs[icpIndex].personas = updatedICPs[icpIndex].personas.filter((_, i) => i !== personaIndex)
      dispatch({
        type: 'SET_ICPS',
        payload: updatedICPs
      })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <StepHeader 
          title="Buyer Personas"
          description="Identify the key decision makers and influencers in your target accounts"
        />
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (icps.length === 0) {
    return (
      <div className="space-y-6">
        <StepHeader 
          title="Buyer Personas"
          description="Identify the key decision makers and influencers in your target accounts"
        />
        <Alert>
          <AlertDescription>
            Please add at least one ICP before defining personas.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div>
      <StepHeader 
        title="Buyer Personas"
        description="Identify the key decision makers and influencers in your target accounts"
      />

      <div className="mt-6 space-y-4">
        {icps.map((icp, icpIndex) => (
          <Card key={icpIndex} className="p-6 hover:shadow-md transition-shadow">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <p className="font-medium">{icp.vertical}</p>
                <Badge variant="secondary">{icp.company_size}</Badge>
                <Badge variant="outline">{icp.region}</Badge>
              </div>

              {icp.personas.length > 0 && (
                <div className="pl-4 border-l-2 border-muted space-y-3">
                  {icp.personas.map((persona, personaIndex) => (
                    <div key={personaIndex} className="group flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="font-medium">{persona.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {persona.seniority_level} • {persona.department}
                        </p>
                      </div>
                      <div className="flex space-x-2 opacity-0 group-hover:opacity-100">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(icpIndex, personaIndex)}
                          disabled={isLoading}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(icpIndex, personaIndex)}
                          disabled={isLoading}
                          className="text-destructive hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFormData({ ...initialFormData, icpIndex })
                  setDialogOpen(true)
                }}
                disabled={isLoading}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Persona
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingData ? 'Edit' : 'Add'} Persona</DialogTitle>
            <DialogDescription>
              Define your buyer persona. All fields are required.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="icpIndex">Select ICP</Label>
              <Select
                value={formData.icpIndex.toString()}
                onValueChange={(value) => handleInputChange('icpIndex', parseInt(value))}
                disabled={isLoading || editingData !== null}
              >
                <SelectTrigger id="icpIndex">
                  <SelectValue placeholder="Select an ICP" />
                </SelectTrigger>
                <SelectContent>
                  {icps.map((icp, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {icp.vertical} ({icp.company_size})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="e.g. Chief Technology Officer"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="seniority_level">Seniority Level</Label>
              <Select
                value={formData.seniority_level}
                onValueChange={(value) => handleInputChange('seniority_level', value)}
                disabled={isLoading}
              >
                <SelectTrigger id="seniority_level">
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

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select
                value={formData.department}
                onValueChange={(value) => handleInputChange('department', value)}
                disabled={isLoading}
              >
                <SelectTrigger id="department">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {COMMON_DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {validationError && (
              <Alert variant="destructive">
                <AlertDescription>{validationError}</AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {editingData ? 'Update' : 'Add'} Persona
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 