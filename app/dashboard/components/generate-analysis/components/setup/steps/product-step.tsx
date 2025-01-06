'use client'

import { useState, ChangeEvent } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronRight, Plus, Package, Pencil, X } from "lucide-react"
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
import type { Product } from '../../../types/setup'

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
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    description: ''
  })

  const handleAddProduct = () => {
    if (!newProduct.name) return
    onAddProduct(newProduct as Omit<Product, 'id'>)
    setNewProduct({ name: '', description: '' })
    setDialogOpen(false)
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setNewProduct(product)
    setDialogOpen(true)
  }

  const handleUpdateProduct = () => {
    if (!editingProduct || !newProduct.name) return
    onEditProduct({ ...editingProduct, ...newProduct as Product })
    setEditingProduct(null)
    setNewProduct({ name: '', description: '' })
    setDialogOpen(false)
  }

  return (
    <Card className="w-full max-w-xl p-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-[#30035e]">Products</h3>
            <p className="text-sm text-muted-foreground">Add your main products or services</p>
          </div>
        </div>

        <AnimatePresence>
          <div className="min-h-[100px] flex flex-col">
            {products.map((product) => (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                key={product.id}
                className="group flex items-center justify-between p-2 hover:bg-[#f6efff]/50 rounded-md transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-[#f9a8c9]" />
                  <span className="font-medium">{product.name}</span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleEditProduct(product)}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive"
                    onClick={() => onDeleteProduct(product.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </motion.div>
            ))}
            {products.length === 0 && (
              <div className="h-[100px] flex items-center justify-center">
                <p className="text-sm text-muted-foreground">Add your first product</p>
              </div>
            )}
          </div>
        </AnimatePresence>

        <div className="flex justify-between items-center pt-2">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-[#30035e] text-[#30035e] hover:bg-[#30035e]/10">
                Add Product <Plus className="ml-2 h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{editingProduct ? 'Edit' : 'Add'} Product</DialogTitle>
                <DialogDescription>
                  Add details about your product. All fields are required.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>Product Name</Label>
                  <Input
                    placeholder="Enter product name"
                    value={newProduct.name}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => 
                      setNewProduct({ ...newProduct, name: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  onClick={editingProduct ? handleUpdateProduct : handleAddProduct}
                  disabled={!newProduct.name}
                  className="bg-[#30035e] hover:bg-[#30035e]/90"
                >
                  {editingProduct ? 'Update' : 'Add'} Product
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button
            onClick={onNext}
            disabled={products.length === 0}
            className="bg-[#30035e] hover:bg-[#30035e]/90"
          >
            Continue <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
} 