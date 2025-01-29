import { createServerClient } from '@supabase/ssr'
import { ProductSelector } from './product-selector'
import { ClientWrapper } from './client-wrapper'
import type { Database } from '@/types/supabase'
import { Skeleton } from "@/components/ui/skeleton"

interface Product {
  id: number
  name: string
  company_id: number
  account_id: string
  created_at: string | null
}

interface ProductSelectorWrapperProps {
  selectedProduct: Product | null
  companyId: number
}

function ProductSelectorFallback() {
  return (
    <ClientWrapper>
      <div className="flex items-center space-x-2">
        <Skeleton className="h-10 w-[180px]" />
      </div>
    </ClientWrapper>
  )
}

export async function ProductSelectorWrapper({ 
  selectedProduct, 
  companyId 
}: ProductSelectorWrapperProps) {
  try {
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return null // Let middleware handle auth
          },
          set(name: string, value: string) {},
          remove(name: string) {}
        }
      }
    )
    
    // Keep RLS and data fetching logic
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, company_id, account_id, created_at')
      .eq('company_id', companyId)
      .order('name')

    if (error) {
      console.error('Error fetching products:', error)
      return <ProductSelectorFallback />
    }

    return (
      <ClientWrapper>
        <ProductSelector 
          selectedProduct={selectedProduct} 
          products={products || []} 
        />
      </ClientWrapper>
    )
  } catch (error) {
    console.error('Error in ProductSelectorWrapper:', error)
    return <ProductSelectorFallback />
  }
} 
