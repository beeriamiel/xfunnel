'use client'

import { useCallback, useMemo, useTransition, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useToast } from "@/components/hooks/use-toast"
import { useDashboardStore } from "@/app/dashboard/store"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Product {
  id: number
  name: string
  company_id: number
  account_id: string
  created_at: string | null
}

interface ProductSelectorProps {
  selectedProduct: Product | null
  products: Product[]
}

export function ProductSelector({ selectedProduct, products }: ProductSelectorProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const setSelectedProductId = useDashboardStore(state => state.setSelectedProductId)

  // Sync with URL on mount and URL changes
  useEffect(() => {
    const urlProductId = searchParams.get('product')
    if (urlProductId) {
      const id = parseInt(urlProductId)
      if (!isNaN(id) && products.some(p => p.id === id)) {
        setSelectedProductId(id.toString())
      }
    }
  }, [searchParams, products, setSelectedProductId])

  // Memoize the current value to prevent unnecessary re-renders
  const currentValue = useMemo(() => 
    selectedProduct?.id.toString() ?? 'all'
  , [selectedProduct?.id])

  // Memoize products to prevent unnecessary re-renders
  const sortedProducts = useMemo(() => 
    [...products].sort((a, b) => a.name.localeCompare(b.name))
  , [products])

  // Handle URL updates when product changes
  const handleProductChange = useCallback((productId: string) => {
    if (isPending) return; // Prevent multiple transitions

    startTransition(() => {
      try {
        const params = new URLSearchParams(searchParams.toString())
        
        if (productId !== 'all') {
          params.set('product', productId)
          setSelectedProductId(productId)
        } else {
          params.delete('product')
          setSelectedProductId(null)
        }

        router.push(`/dashboard?${params.toString()}`)
      } catch (error) {
        console.error('Error updating product:', error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to update product selection. Please try again.",
        })
      }
    })
  }, [router, searchParams, toast, isPending, setSelectedProductId])

  return (
    <Select
      value={currentValue}
      onValueChange={handleProductChange}
      disabled={isPending}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select product">
          {selectedProduct?.name ?? 'All Products'}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Products</SelectItem>
        {sortedProducts.map((product) => (
          <SelectItem key={product.id} value={product.id.toString()}>
            {product.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
} 
