'use client'

import { useState, ChangeEvent, useEffect } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronRight, Plus, Package, Pencil, X, Building2, Users2, AlertCircle, Loader2 } from "lucide-react"
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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import { design } from '../../../lib/design-system'
import type { Product } from '../../../types/setup'
import { useDashboardStore } from '@/app/dashboard/store'
import { createClient } from '@/app/supabase/client'
import type { Database } from '@/types/supabase'

interface ProductStepProps {
  products: Product[];
  onAddProduct: (product: Product) => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onNext: () => void;
}

interface DbProduct {
  id: number;
  name: string;
  company_id: number;
}

type MainProduct = string | { id: string; name: string; businessModel?: 'B2B' | 'B2C'; description?: string };

function mapMainProductToProduct(p: MainProduct, generateId: () => string): Product {
  return {
    id: typeof p === 'string' ? generateId() : p.id,
    name: typeof p === 'string' ? p : p.name,
    businessModel: typeof p === 'string' ? 'B2B' : (p.businessModel || 'B2B'),
    description: typeof p === 'string' ? '' : (p.description || '')
  }
}

export function ProductStep({ 
  products, 
  onAddProduct, 
  onEditProduct, 
  onDeleteProduct,
  onNext 
}: ProductStepProps) {
  console.log('🔵 ProductStep Render:', {
    productsCount: products.length,
    products: products.map(p => ({ id: p.id, name: p.name }))
  })

  const supabase = createClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingGeneratedData, setIsLoadingGeneratedData] = useState(true)
  const [hasLoadedInitialData, setHasLoadedInitialData] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    description: '',
    businessModel: 'B2B'
  })

  // Log products prop changes
  useEffect(() => {
    console.log('🟡 ProductStep products prop changed:', products)
  }, [products])

  // Log state changes
  useEffect(() => {
    console.log('🟡 ProductStep state changed:', {
      dialogOpen,
      editingProduct,
      isSubmitting,
      isLoadingGeneratedData,
      hasLoadedInitialData,
      error,
      newProduct
    })
  }, [dialogOpen, editingProduct, isSubmitting, isLoadingGeneratedData, hasLoadedInitialData, error, newProduct])

  const { 
    onboarding: { stepData },
    selectedCompanyId,
    setStepData
  } = useDashboardStore()

  // Function to generate unique IDs
  const generateUniqueId = () => {
    return crypto.randomUUID()
  }

  // Load generated data once when mounted
  useEffect(() => {
    let isMounted = true;

    async function loadGeneratedData() {
      console.log('🟡 ProductStep loadGeneratedData starting:', {
        selectedCompanyId,
        hasLoadedInitialData,
        currentProducts: products.length
      })

      if (!selectedCompanyId || hasLoadedInitialData || products.length > 0) {
        console.log('🔴 ProductStep loadGeneratedData skipped:', {
          reason: !selectedCompanyId 
            ? 'no selectedCompanyId' 
            : hasLoadedInitialData 
              ? 'already loaded' 
              : 'products already exist'
        })
        return
      }

      try {
        // First try to get products from the products table
        const { data: dbProducts } = await supabase
          .from('products')
          .select('id, name, company_id')
          .eq('company_id', selectedCompanyId)

        console.log('🟡 ProductStep: DB products fetched:', dbProducts)

        if (dbProducts?.length && isMounted) {
          // Map the products from the database
          const mappedProducts: Product[] = (dbProducts as DbProduct[]).map(p => ({
            id: p.id.toString(),
            name: p.name,
            businessModel: 'B2B' as const,
            description: ''
          }))

          console.log('🟢 ProductStep: Adding mapped products:', mappedProducts)

          // Update the store
          if (isMounted) {
            setStepData({
              ...stepData,
              hasProducts: true
            })
          }
          
          // Add each new product that doesn't already exist
          const existingIds = new Set(products.map(p => p.id))
          for (const dbProduct of mappedProducts) {
            if (isMounted && !existingIds.has(dbProduct.id)) {
              console.log('🟢 ProductStep: Adding new product:', dbProduct)
              onAddProduct(dbProduct)
            } else {
              console.log('🟡 ProductStep: Skipping existing product:', dbProduct)
            }
          }
        } else {
          // Fallback to checking main_products if no products found in products table
          console.log('🟡 ProductStep: No products in products table, checking main_products')
          
          const { data: company } = await supabase
            .from('companies')
            .select('main_products')
            .eq('id', selectedCompanyId)
            .single()

          console.log('🟡 ProductStep: DB main_products fetched:', company?.main_products)

          if (company?.main_products?.length && isMounted) {
            // Map the products from the database
            const mainProductsList = (company.main_products as MainProduct[]).map(p => 
              mapMainProductToProduct(p, generateUniqueId)
            )

            console.log('🟢 ProductStep: Adding mapped main_products:', mainProductsList)

            // Update the store
            if (isMounted) {
              setStepData({
                ...stepData,
                hasProducts: true
              })
            }
            
            // Add each new product that doesn't already exist
            const existingIds = new Set(products.map(p => p.id))
            for (const dbProduct of mainProductsList) {
              if (isMounted && !existingIds.has(dbProduct.id)) {
                console.log('🟢 ProductStep: Adding new product:', dbProduct)
                onAddProduct(dbProduct)
              } else {
                console.log('🟡 ProductStep: Skipping existing product:', dbProduct)
              }
            }
          }
        }
      } catch (error) {
        console.error('🔴 ProductStep Error loading products:', error)
        if (isMounted) {
          setError(error instanceof Error ? error.message : 'Failed to load products')
        }
      } finally {
        if (isMounted) {
          setIsLoadingGeneratedData(false)
          setHasLoadedInitialData(true)
          console.log('🟢 ProductStep loadGeneratedData complete')
        }
      }
    }

    loadGeneratedData()

    return () => {
      isMounted = false
    }
  }, [selectedCompanyId, setStepData, stepData, onAddProduct, hasLoadedInitialData, products])

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.businessModel || !selectedCompanyId) return
    
    setIsSubmitting(true)
    setError(null)
    
    try {
      // Get current products
      const { data: company } = await supabase
        .from('companies')
        .select('main_products')
        .eq('id', selectedCompanyId)
        .single()

      const mainProducts = company?.main_products || []
      
      // Check for duplicates
      const isDuplicate = mainProducts.some((p: any) => 
        (typeof p === 'string' ? p : p.name).toLowerCase() === newProduct.name!.toLowerCase()
      )
      
      if (isDuplicate) {
        setError('This product already exists')
        return
      }

      // Create new product for UI
      const productToAdd = {
        id: generateUniqueId(),
        name: newProduct.name,
        businessModel: newProduct.businessModel,
        description: newProduct.description || ''
      }

      // Update DB first - store just the name
      const { error: updateError } = await supabase
        .from('companies')
        .update({ 
          main_products: [...mainProducts, newProduct.name]
        })
        .eq('id', selectedCompanyId)

      if (updateError) throw updateError

      // Then update UI via parent callback with full product object
      onAddProduct(productToAdd)
      
      setDialogOpen(false)
      setNewProduct({ name: '', businessModel: 'B2B' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add product')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setNewProduct(product)
    setDialogOpen(true)
  }

  const handleUpdateProduct = async () => {
    if (!editingProduct || !newProduct.name || !newProduct.businessModel || !selectedCompanyId) return
    
    setIsSubmitting(true)
    setError(null)
    
    try {
      // Get current products
      const { data: company } = await supabase
        .from('companies')
        .select('main_products')
        .eq('id', selectedCompanyId)
        .single()

      const mainProducts = company?.main_products || []
      
      // Check for duplicates, excluding the current product
      const isDuplicate = mainProducts.some((p: any) => {
        const productName = typeof p === 'string' ? p : p.name
        return productName.toLowerCase() === newProduct.name!.toLowerCase() && 
               (typeof p === 'string' ? p : p.id) !== editingProduct.id
      })
      
      if (isDuplicate) {
        setError('A product with this name already exists')
        return
      }

      // Create updated product for UI
      const updatedProduct = {
        ...editingProduct,
        ...newProduct as Product
      }

      // Update the product in the array - store just the name
      const updatedProducts = mainProducts.map((p: any) => {
        const productId = typeof p === 'string' ? p : p.id
        return productId === editingProduct.id ? newProduct.name : p
      })

      // Update DB first
      const { error: updateError } = await supabase
        .from('companies')
        .update({ main_products: updatedProducts })
        .eq('id', selectedCompanyId)

      if (updateError) throw updateError

      // Then update UI via parent callback with full product object
      onEditProduct(updatedProduct)
      
      setEditingProduct(null)
      setNewProduct({ name: '', description: '', businessModel: 'B2B' })
      setDialogOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update product')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (productId: string) => {
    if (!selectedCompanyId) return
    
    setIsSubmitting(true)
    setError(null)
    
    try {
      // Get current products
      const { data: company } = await supabase
        .from('companies')
        .select('main_products')
        .eq('id', selectedCompanyId)
        .single()

      const mainProducts = company?.main_products || []
      
      // Find product name to remove
      const productToRemove = products.find(p => p.id === productId)
      if (!productToRemove) {
        throw new Error('Product not found')
      }
      
      // Remove the product from the array by name
      const updatedProducts = mainProducts.filter(p => 
        typeof p === 'string' ? p !== productToRemove.name : p.name !== productToRemove.name
      )

      // Update DB first
      const { error: updateError } = await supabase
        .from('companies')
        .update({ main_products: updatedProducts })
        .eq('id', selectedCompanyId)

      if (updateError) throw updateError

      // Then update UI via parent callback
      onDeleteProduct(productId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete product')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Validation for next step
  const canProceed = products.length > 0 && stepData.hasProducts

  if (isLoadingGeneratedData) {
    return (
      <Card className={cn(design.layout.card, design.spacing.card)}>
        <div className="flex flex-col items-center justify-center p-8 space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-[#30035e]" />
          <div className="space-y-2 text-center">
            <h3 className={design.typography.title}>
              Loading Products
            </h3>
            <p className={design.typography.subtitle}>
              Checking for generated product data...
            </p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className={cn(design.layout.card, design.spacing.card)}>
      <div className={design.layout.container}>
        <div className={design.layout.header}>
          <div className={design.layout.headerContent}>
            <h3 className={design.typography.title}>Products</h3>
            <p className={design.typography.subtitle}>Review generated products or add your own</p>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

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
                    disabled={isSubmitting}
                  >
                    <Pencil className={design.components.button.iconSize} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(design.components.button.icon, "text-destructive")}
                    onClick={() => handleDelete(product.id)}
                    disabled={isSubmitting}
                  >
                    <X className={design.components.button.iconSize} />
                  </Button>
                </div>
              </motion.div>
            ))}
            {products.length === 0 && (
              <div className="h-[100px] flex items-center justify-center">
                <p className={design.typography.subtitle}>Waiting for products to be generated...</p>
              </div>
            )}
          </div>
        </AnimatePresence>

        <div className="flex justify-between items-center pt-2">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                className={design.components.button.outline}
                disabled={isSubmitting}
              >
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
                  disabled={!newProduct.name || !newProduct.businessModel || isSubmitting}
                  className={design.components.button.primary}
                >
                  {isSubmitting ? 'Saving...' : editingProduct ? 'Update' : 'Add'} Product
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button
            onClick={onNext}
            disabled={!canProceed || isSubmitting}
            className={design.components.button.primary}
          >
            Continue <ChevronRight className={cn("ml-2", design.components.button.iconSize)} />
          </Button>
        </div>
      </div>
    </Card>
  )
} 