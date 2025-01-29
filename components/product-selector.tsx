'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useSearchParams, useRouter } from 'next/navigation';
import { useCallback } from 'react';

interface Product {
  id: number;
  name: string;
}

interface ProductSelectorProps {
  products: Product[];
}

export function ProductSelector({ products }: ProductSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const currentProductId = searchParams.get('product');

  const handleProductChange = useCallback((productId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (productId !== 'all') {
      params.set('product', productId);
    } else {
      params.delete('product');
    }

    router.push(`?${params.toString()}`);
  }, [router, searchParams]);

  // Sort products by name
  const sortedProducts = [...products].sort((a, b) => 
    a.name.localeCompare(b.name)
  );

  return (
    <div className="flex flex-col space-y-2">
      <Label>Product</Label>
      <Select
        value={currentProductId || 'all'}
        onValueChange={handleProductChange}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select product" />
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
    </div>
  );
} 