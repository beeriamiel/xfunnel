'use client'

import { useState, ChangeEvent, FormEvent } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronRight, Plus, Package, Pencil, X, Building2, Users2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
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
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"
import { design } from '../../../lib/design-system'
import type { Product } from '../../../types/setup'
import { useDashboardStore } from '@/app/dashboard/store'

interface ProductStepProps {
  products: Product[];
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onNext: () => void;
}

export function ProductStep({ 
  products, 
  onAddProduct, 
  onEditProduct, 
  onDeleteProduct,
  onNext 
}: ProductStepProps) {
  console.log('🔵 ProductStep Render:', {
    productsCount: products?.length,
    products,
    storeState: useDashboardStore.getState()
  })

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    description: '',
    businessModel: 'B2B'
  })

  console.log('ProductStep: Current products:', products)

  const handleAddProduct = () => {
    console.log('ProductStep: Adding product:', newProduct)
    onAddProduct(newProduct)
    setDialogOpen(false)
    setNewProduct({ name: '', businessModel: 'B2B' })
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setNewProduct(product)
    setDialogOpen(true)
  }

  const handleUpdateProduct = () => {
    if (!editingProduct || !newProduct.name || !newProduct.businessModel) return
    onEditProduct({ ...editingProduct, ...newProduct as Product })
    setEditingProduct(null)
    setNewProduct({ name: '', description: '', businessModel: 'B2B' })
    setDialogOpen(false)
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    console.log('🔵 ProductStep handleSubmit START:', form.values)
    e.preventDefault()
    
    try {
      console.log('🟡 Adding product...')
      await onAddProduct(form.values)
      console.log('🟢 Product added successfully')
      form.reset()
    } catch (error) {
      console.error('🔴 ProductStep Submit ERROR:', error)
    }
  }

  return (
    <Card className={cn(design.layout.card, design.spacing.card)}>
      <div className={design.layout.container}>
        <div className={design.layout.header}>
          <div className={design.layout.headerContent}>
            <h3 className={design.typography.title}>Products</h3>
            <p className={design.typography.subtitle}>Add your main products or services</p>
          </div>
        </div>

        <AnimatePresence>
          <div className="min-h-[100px] flex flex-col gap-2">
            {products.map((product) => (
              <motion.div
                initial={design.animations.listItem.initial}
                animate={design.animations.listItem.animate}
                exit={design.animations.listItem.exit}
                key={product.id}
                className={design.components.listItem.base}
              >
                <div className="flex items-center gap-2">
                  <Package className={design.components.listItem.icon} />
                  <div className="flex flex-col">
                    <span className="font-medium">{product.name}</span>
                    <span className={design.typography.subtitle}>
                      {product.businessModel}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={design.components.button.icon}
                    onClick={() => handleEditProduct(product)}
                  >
                    <Pencil className={design.components.button.iconSize} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(design.components.button.icon, "text-destructive")}
                    onClick={() => onDeleteProduct(product.id)}
                  >
                    <X className={design.components.button.iconSize} />
                  </Button>
                </div>
              </motion.div>
            ))}
            {products.length === 0 && (
              <div className="h-[100px] flex items-center justify-center">
                <p className={design.typography.subtitle}>Add your first product</p>
              </div>
            )}
          </div>
        </AnimatePresence>

        <div className="flex justify-between items-center pt-2">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className={design.components.button.outline}>
                Add Product <Plus className={cn("ml-2", design.components.button.iconSize)} />
              </Button>
            </DialogTrigger>
            <DialogContent className={design.components.dialog.content}>
              <DialogHeader>
                <DialogTitle>{editingProduct ? 'Edit' : 'Add'} Product</DialogTitle>
                <DialogDescription>
                  Add details about your product. All fields are required.
                </DialogDescription>
              </DialogHeader>
              <div className={design.components.dialog.body}>
                <div className={design.spacing.element}>
                  <Label className={design.typography.label}>Business Model</Label>
                  <div className="bg-gray-100 rounded-lg p-1 w-fit">
                    <ToggleGroup
                      type="single"
                      value={newProduct.businessModel}
                      onValueChange={(value) => {
                        if (value) setNewProduct({ ...newProduct, businessModel: value as 'B2B' | 'B2C' })
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
                    value={newProduct.name}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => 
                      setNewProduct({ ...newProduct, name: e.target.value })}
                    className={design.components.input.base}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  onClick={editingProduct ? handleUpdateProduct : handleAddProduct}
                  disabled={!newProduct.name || !newProduct.businessModel}
                  className={design.components.button.primary}
                >
                  {editingProduct ? 'Update' : 'Add'} Product
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button
            onClick={onNext}
            disabled={products.length === 0}
            className={design.components.button.primary}
          >
            Continue <ChevronRight className={cn("ml-2", design.components.button.iconSize)} />
          </Button>
        </div>
      </div>
    </Card>
  )
} 