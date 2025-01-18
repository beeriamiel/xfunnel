'use client'

import { Button } from "@/components/ui/button"
import { Package, Pencil, X } from "lucide-react"
import { motion } from "framer-motion"
import type { Product } from '../../types/setup'

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

export function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
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
          onClick={() => onEdit(product)}
        >
          <Pencil className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-destructive"
          onClick={() => onDelete(product.id)}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </motion.div>
  )
} 