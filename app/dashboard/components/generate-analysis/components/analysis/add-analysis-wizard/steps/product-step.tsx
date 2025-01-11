'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Building2, Users2, Plus } from "lucide-react"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { design } from '../../../../lib/design-system'
import type { Product } from '../../../../types/setup'

interface ProductStepProps {
  existingProducts?: Product[]
  onComplete: (data: { type: 'existing' | 'new', data: { id?: string; name: string; businessModel: 'B2B' | 'B2C' } }) => void
}

type Mode = 'select' | 'create'

export function ProductStep({ existingProducts = [], onComplete }: ProductStepProps) {
  const [mode, setMode] = useState<Mode>('select')
  const [selectedProductId, setSelectedProductId] = useState<string>('')
  const [formData, setFormData] = useState({
    name: '',
    businessModel: '' as 'B2B' | 'B2C' | ''
  })

  const handleSubmit = () => {
    if (mode === 'select') {
      if (!selectedProductId) return
      const selectedProduct = existingProducts.find(p => p.id === selectedProductId)
      if (!selectedProduct) return
      onComplete({
        type: 'existing',
        data: {
          id: selectedProduct.id,
          name: selectedProduct.name,
          businessModel: selectedProduct.businessModel
        }
      })
    } else {
      if (!formData.name || !formData.businessModel) return
      onComplete({
        type: 'new',
        data: {
          name: formData.name,
          businessModel: formData.businessModel as 'B2B' | 'B2C'
        }
      })
    }
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
            <Label>Select Product</Label>
            <Select
              value={selectedProductId}
              onValueChange={setSelectedProductId}
            >
              <SelectTrigger className={design.components.input.base}>
                <SelectValue placeholder="Choose a product" />
              </SelectTrigger>
              <SelectContent>
                {existingProducts.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    <div className="flex items-center gap-2">
                      <span>{product.name}</span>
                      <span className="text-muted-foreground text-sm">({product.businessModel})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      ) : (
        <>
          <div className={design.spacing.element}>
            <Label className={design.typography.label}>Business Model</Label>
            <div className="bg-gray-100 rounded-lg p-1 w-fit">
              <ToggleGroup
                type="single"
                value={formData.businessModel}
                onValueChange={(value) => {
                  if (value) setFormData({ ...formData, businessModel: value as 'B2B' | 'B2C' })
                }}
                className="justify-start"
              >
                <ToggleGroupItem
                  value="B2B"
                  aria-label="B2B"
                  className="flex items-center gap-2 data-[state=on]:bg-white rounded-md px-4 py-2"
                >
                  <Building2 className={design.components.button.iconSize} />
                  <span>B2B</span>
                </ToggleGroupItem>

                <ToggleGroupItem
                  value="B2C"
                  aria-label="B2C"
                  className="flex items-center gap-2 data-[state=on]:bg-white rounded-md px-4 py-2"
                >
                  <Users2 className={design.components.button.iconSize} />
                  <span>B2C</span>
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>

          <div className={design.spacing.element}>
            <Label className={design.typography.label}>Product Name</Label>
            <Input
              placeholder="Enter product name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={design.components.input.base}
            />
          </div>
        </>
      )}

      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={mode === 'select' ? !selectedProductId : (!formData.name || !formData.businessModel)}
          className={design.components.button.primary}
        >
          Continue
        </Button>
      </div>
    </div>
  )
} 