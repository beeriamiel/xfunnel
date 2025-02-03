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
  const { products, dispatch, isLoading, error, generatedData } = useWizard()
  const [formData, setFormData] = useState<ProductFormData>(initialFormData)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleInputChange = (field: keyof ProductFormData, value: string) => {
    setValidationError(null)
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      setValidationError('Product name is required')
      return false
    }
    if (!formData.description.trim()) {
      setValidationError('Product description is required')
      return false
    }
    return true
  }

  const handleSubmit = () => {
    if (!validateForm()) return

    const updatedProducts = [...products]
    if (editingIndex !== null) {
      updatedProducts[editingIndex] = formData
    } else {
      updatedProducts.push(formData)
    }

    dispatch({ type: 'SET_PRODUCTS', payload: updatedProducts })
    setFormData(initialFormData)
    setEditingIndex(null)
    setDialogOpen(false)
  }

  const handleEdit = (index: number) => {
    setFormData(products[index])
    setEditingIndex(index)
    setDialogOpen(true)
  }

  const handleDelete = (index: number) => {
    const updatedProducts = products.filter((_, i) => i !== index)
    dispatch({ type: 'SET_PRODUCTS', payload: updatedProducts })
  }

  const handleUseGenerated = () => {
    if (generatedData?.products) {
      dispatch({ type: 'SET_PRODUCTS', payload: generatedData.products })
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
          title="Products & Services"
          description="Tell us about what you offer to your customers"
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
    <div className="space-y-6">
      <StepHeader 
        title="Products & Services"
        description="Tell us about what you offer to your customers"
      />

      {/* AI Suggestions Alert */}
      {generatedData?.products && products.length === 0 && (
        <Alert>
          <div className="flex justify-between items-center">
            <AlertDescription>
              We've generated {generatedData.products.length} product suggestion{generatedData.products.length !== 1 ? 's' : ''} based on your company profile.
            </AlertDescription>
            <Button variant="outline" size="sm" onClick={handleUseGenerated}>
              Use Suggestions
            </Button>
          </div>
        </Alert>
      )}

      {/* Products List */}
      <div className="space-y-4">
        {products.length > 0 && (
          <div className="grid gap-4">
            {products.map((product, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">{product.description}</p>
                  </div>
                  <div className="flex space-x-2">
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
          </div>
        )}

        {/* Add Product Button */}
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

      {/* Add/Edit Dialog */}
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