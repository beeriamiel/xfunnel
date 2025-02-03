'use client'

import { useState } from 'react'
import { useWizard } from '../../context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Pencil, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { StepHeader } from '../step-header'
import type { Product } from '../../types'

interface ProductFormData {
  name: string
  description: string
}

const initialFormData: ProductFormData = {
  name: '',
  description: ''
}

export function ProductStep() {
  const { dispatch, products, isLoading } = useWizard()
  const [formData, setFormData] = useState<ProductFormData>(initialFormData)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleInputChange = (field: keyof ProductFormData, value: string) => {
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
        const updatedProducts = [...products]
        updatedProducts[editingIndex] = formData
        dispatch({
          type: 'SET_PRODUCTS',
          payload: updatedProducts
        })
      } else {
        dispatch({
          type: 'SET_PRODUCTS',
          payload: [...products, formData]
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
    setFormData(products[index])
    setEditingIndex(index)
    setDialogOpen(true)
  }

  const handleDelete = (index: number) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      const updatedProducts = products.filter((_, i) => i !== index)
      dispatch({
        type: 'SET_PRODUCTS',
        payload: updatedProducts
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
      <div>
        <StepHeader 
          title="Products & Services"
          description="Tell us about what you offer to your customers"
        />
        <div className="mt-6 space-y-4">
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
        title="Products & Services"
        description="Tell us about what you offer to your customers"
      />
      
      <div className="mt-6 space-y-4">
        {products.map((product, index) => (
          <Card key={index} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="font-medium">{product.name}</p>
                <p className="text-sm text-muted-foreground">{product.description}</p>
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
          Add Product
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingIndex !== null ? 'Edit' : 'Add'} Product</DialogTitle>
            <DialogDescription>
              Enter the details of your product below.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                placeholder="Enter product name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Product Description</Label>
              <Textarea
                id="description"
                placeholder="Enter product description"
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
              {editingIndex !== null ? 'Update' : 'Add'} Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 