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
import type { ICP } from '../../types'

interface ICPFormData {
  vertical: string
  company_size: string
  region: string
}

const initialFormData: ICPFormData = {
  vertical: '',
  company_size: '',
  region: ''
}

const COMPANY_SIZES = [
  'Less than 10',
  '10-50',
  '51-200',
  '201-500',
  '501-1000',
  '1001-5000',
  '5000+'
]

const REGIONS = [
  { value: 'north_america', label: 'North America' },
  { value: 'europe', label: 'Europe' },
  { value: 'asia_pacific', label: 'Asia Pacific' },
  { value: 'middle_east', label: 'Middle East' },
  { value: 'latin_america', label: 'Latin America' }
]

export function ICPStep() {
  const { dispatch, icps, isLoading, error, generatedData } = useWizard()
  const [formData, setFormData] = useState<ICPFormData>(initialFormData)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleInputChange = (field: keyof ICPFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setValidationError(null)
  }

  const validateForm = () => {
    if (!formData.vertical || !formData.company_size || !formData.region) {
      setValidationError('All fields are required')
      return false
    }

    // Check for duplicates
    const isDuplicate = icps.some((icp, index) => {
      if (editingIndex !== null && index === editingIndex) return false
      return icp.vertical.toLowerCase() === formData.vertical.toLowerCase() &&
             icp.company_size === formData.company_size &&
             icp.region === formData.region
    })

    if (isDuplicate) {
      setValidationError('This ICP combination already exists')
      return false
    }

    return true
  }

  const handleSubmit = () => {
    if (!validateForm()) return

    dispatch({ type: 'SET_LOADING', payload: true })

    try {
      const updatedIcps = [...icps]
      if (editingIndex !== null) {
        updatedIcps[editingIndex] = {
          ...formData,
          personas: icps[editingIndex].personas
        }
      } else {
        updatedIcps.push({ ...formData, personas: [] })
      }

      dispatch({ type: 'SET_ICPS', payload: updatedIcps })
      setFormData(initialFormData)
      setEditingIndex(null)
      setDialogOpen(false)
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const handleEdit = (index: number) => {
    setFormData(icps[index])
    setEditingIndex(index)
    setDialogOpen(true)
  }

  const handleDelete = (index: number) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      const updatedIcps = icps.filter((_, i) => i !== index)
      dispatch({ type: 'SET_ICPS', payload: updatedIcps })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const handleUseGenerated = () => {
    if (generatedData?.icps) {
      dispatch({ type: 'SET_ICPS', payload: generatedData.icps })
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
          title="Ideal Customer Profiles"
          description="Define the types of companies that would benefit most from your solution"
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
        title="Ideal Customer Profiles"
        description="Define the types of companies that would benefit most from your solution"
      />
      
      {/* AI Suggestions Alert */}
      {generatedData?.icps && icps.length === 0 && (
        <Alert className="mt-6">
          <div className="flex justify-between items-center">
            <AlertDescription>
              We've identified {generatedData.icps.length} ideal customer profile{generatedData.icps.length !== 1 ? 's' : ''} for your business.
            </AlertDescription>
            <Button variant="outline" size="sm" onClick={handleUseGenerated}>
              Use Suggestions
            </Button>
          </div>
        </Alert>
      )}

      {/* ICPs List */}
      <div className="mt-6 space-y-4">
        {icps.map((icp, index) => (
          <Card key={index} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{icp.vertical}</p>
                  <Badge variant="secondary">{icp.company_size}</Badge>
                  <Badge variant="outline">{icp.region}</Badge>
                </div>
                {icp.personas.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {icp.personas.length} persona{icp.personas.length !== 1 ? 's' : ''} defined
                  </p>
                )}
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
          Add ICP
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingIndex !== null ? 'Edit' : 'Add'} ICP</DialogTitle>
            <DialogDescription>
              Define your ideal customer profile. All fields are required.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="vertical">Industry/Vertical</Label>
              <Input
                id="vertical"
                placeholder="e.g., Healthcare, Finance, Education"
                value={formData.vertical}
                onChange={(e) => handleInputChange('vertical', e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company_size">Company Size</Label>
              <Select
                value={formData.company_size}
                onValueChange={(value) => handleInputChange('company_size', value)}
                disabled={isLoading}
              >
                <SelectTrigger id="company_size">
                  <SelectValue placeholder="Select company size" />
                </SelectTrigger>
                <SelectContent>
                  {COMPANY_SIZES.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="region">Region</Label>
              <Select
                value={formData.region}
                onValueChange={(value) => handleInputChange('region', value)}
                disabled={isLoading}
              >
                <SelectTrigger id="region">
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  {REGIONS.map((region) => (
                    <SelectItem key={region.value} value={region.value}>
                      {region.label}
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
              {editingIndex !== null ? 'Update' : 'Add'} ICP
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}