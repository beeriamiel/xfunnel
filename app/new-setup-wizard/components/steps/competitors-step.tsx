'use client'

import { useState } from 'react'
import { useWizard } from '../../context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Pencil, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { StepHeader } from '../step-header'
import type { Competitor } from '../../types'

interface CompetitorFormData {
  name: string
  description: string
}

const initialFormData: CompetitorFormData = {
  name: '',
  description: ''
}

export function CompetitorsStep() {
  const { dispatch, competitors, isLoading } = useWizard()
  const [formData, setFormData] = useState<CompetitorFormData>(initialFormData)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleInputChange = (field: keyof CompetitorFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setValidationError(null)
  }

  const handleSubmit = () => {
    if (!formData.name || !formData.description) {
      setValidationError('All fields are required')
      return
    }

    dispatch({ type: 'SET_LOADING', payload: true })

    try {
      if (editingIndex !== null) {
        const updatedCompetitors = [...competitors]
        updatedCompetitors[editingIndex] = formData
        dispatch({
          type: 'SET_COMPETITORS',
          payload: updatedCompetitors
        })
      } else {
        dispatch({
          type: 'SET_COMPETITORS',
          payload: [...competitors, formData]
        })
      }

      setDialogOpen(false)
      setFormData(initialFormData)
      setEditingIndex(null)
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const handleEdit = (index: number) => {
    setFormData(competitors[index])
    setEditingIndex(index)
    setDialogOpen(true)
  }

  const handleDelete = (index: number) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      const updatedCompetitors = competitors.filter((_, i) => i !== index)
      dispatch({
        type: 'SET_COMPETITORS',
        payload: updatedCompetitors
      })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const handleAddNew = () => {
    setFormData(initialFormData)
    setEditingIndex(null)
    setDialogOpen(true)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <StepHeader 
          title="Competitors"
          description="Tell us about your main competitors"
        />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <StepHeader 
        title="Competitors"
        description="Tell us about your main competitors"
      />
      
      <div className="mt-6 space-y-4">
        {competitors.map((competitor, index) => (
          <Card key={index} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="font-medium">{competitor.name}</p>
                <p className="text-sm text-muted-foreground">{competitor.description}</p>
              </div>
              <div className="flex space-x-2 opacity-80 hover:opacity-100">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(index)}
                  disabled={isLoading}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(index)}
                  disabled={isLoading}
                  className="text-destructive hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}

        <Button
          onClick={handleAddNew}
          variant="outline"
          className="w-full"
          disabled={isLoading}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Competitor
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingIndex !== null ? 'Edit' : 'Add'} Competitor</DialogTitle>
            <DialogDescription>
              Enter the details of your competitor below.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Competitor Name</Label>
              <Input
                id="name"
                placeholder="Enter competitor name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Details</Label>
              <Textarea
                id="description"
                placeholder="What makes them a competitor? What are their strengths and weaknesses?"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                disabled={isLoading}
                className="min-h-[100px]"
              />
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
              {editingIndex !== null ? 'Update' : 'Add'} Competitor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 