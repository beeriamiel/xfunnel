'use client'

import { useState } from 'react'
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Building2, Package, Users, Globe2, Pencil, X, Plus, Save } from "lucide-react"
import { useDashboardStore } from '@/app/dashboard/store'

interface CompanyProfileHeaderProps {
  companyId: number
}

export function CompanyProfileHeader({ companyId }: CompanyProfileHeaderProps) {
  const { companyProfile } = useDashboardStore()
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState(companyProfile?.name || '')
  const [editedProducts, setEditedProducts] = useState<string[]>(companyProfile?.products?.map(p => p.name) || [])
  const [editedMarkets, setEditedMarkets] = useState<string[]>(companyProfile?.markets_operating_in || [])
  const [newProduct, setNewProduct] = useState('')
  const [newMarket, setNewMarket] = useState('')

  if (!companyProfile) {
    return (
      <Card className="p-4">
        <div className="text-muted-foreground">No company data available</div>
      </Card>
    )
  }

  const handleSave = async () => {
    // TODO: Implement save functionality
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedName(companyProfile.name)
    setEditedProducts(companyProfile.products?.map(p => p.name) || [])
    setEditedMarkets(companyProfile.markets_operating_in || [])
    setIsEditing(false)
  }

  return (
    <div className="relative">
      {/* Edit Controls - now outside the card */}
      <div className="absolute -top-3 right-2 flex items-center gap-1 z-10">
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 hover:bg-transparent"
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
        >
          {isEditing ? (
            <Save className="h-3.5 w-3.5 text-purple-700" />
          ) : (
            <Pencil className="h-3.5 w-3.5 text-purple-700" />
          )}
        </Button>
        {isEditing && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-transparent"
            onClick={handleCancel}
          >
            <X className="h-3.5 w-3.5 text-gray-500" />
          </Button>
        )}
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
          {/* Company Name */}
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-purple-700" />
            {isEditing ? (
              <Input
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="h-8 w-[200px]"
              />
            ) : (
              <h2 className="text-lg font-semibold">{companyProfile.name}</h2>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Package className="h-3.5 w-3.5 text-purple-700" />
              <span className="text-sm font-medium">{companyProfile.products?.length || 0}</span>
              <span className="text-sm text-gray-500">Products</span>
            </div>
            <div className="flex items-center gap-1">
              <Globe2 className="h-3.5 w-3.5 text-purple-700" />
              <span className="text-sm font-medium">{companyProfile.markets_operating_in?.length || 0}</span>
              <span className="text-sm text-gray-500">Markets</span>
            </div>
            <div className="flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5 text-purple-700" />
              <span className="text-sm font-medium">{companyProfile.icps?.length || 0}</span>
              <span className="text-sm text-gray-500">ICPs</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5 text-purple-700" />
              <span className="text-sm font-medium">{companyProfile.personas?.length || 0}</span>
              <span className="text-sm text-gray-500">Personas</span>
            </div>
          </div>

          {/* Products and Markets */}
          <div className="flex items-center gap-4 ml-auto">
            <div className="flex items-center gap-1.5 flex-wrap">
              {isEditing ? (
                <>
                  {editedProducts.map((product, index) => (
                    <Badge 
                      key={index}
                      className="bg-[#f6efff] text-purple-700 hover:bg-[#f6efff] px-2 py-0.5 text-xs font-normal group"
                    >
                      {product}
                      <X 
                        className="h-3 w-3 ml-1 cursor-pointer opacity-0 group-hover:opacity-100" 
                        onClick={() => setEditedProducts(prev => prev.filter((_, i) => i !== index))}
                      />
                    </Badge>
                  ))}
                  <div className="flex items-center gap-1">
                    <Input
                      value={newProduct}
                      onChange={(e) => setNewProduct(e.target.value)}
                      className="h-6 w-24 text-xs"
                      placeholder="New product"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newProduct) {
                          setEditedProducts(prev => [...prev, newProduct])
                          setNewProduct('')
                        }
                      }}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => {
                        if (newProduct) {
                          setEditedProducts(prev => [...prev, newProduct])
                          setNewProduct('')
                        }
                      }}
                    >
                      <Plus className="h-3 w-3 text-purple-700" />
                    </Button>
                  </div>
                </>
              ) : (
                companyProfile.products?.map((product, index) => (
                  <Badge 
                    key={index}
                    className="bg-[#f6efff] text-purple-700 hover:bg-[#f6efff] px-2 py-0.5 text-xs font-normal"
                  >
                    {product.name}
                  </Badge>
                ))
              )}
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {isEditing ? (
                <>
                  {editedMarkets.map((market, index) => (
                    <Badge 
                      key={index}
                      className="bg-[#f6efff] text-purple-700 hover:bg-[#f6efff] px-2 py-0.5 text-xs font-normal group"
                    >
                      {market.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      <X 
                        className="h-3 w-3 ml-1 cursor-pointer opacity-0 group-hover:opacity-100" 
                        onClick={() => setEditedMarkets(prev => prev.filter((_, i) => i !== index))}
                      />
                    </Badge>
                  ))}
                  <div className="flex items-center gap-1">
                    <Input
                      value={newMarket}
                      onChange={(e) => setNewMarket(e.target.value)}
                      className="h-6 w-24 text-xs"
                      placeholder="New market"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newMarket) {
                          setEditedMarkets(prev => [...prev, newMarket])
                          setNewMarket('')
                        }
                      }}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => {
                        if (newMarket) {
                          setEditedMarkets(prev => [...prev, newMarket])
                          setNewMarket('')
                        }
                      }}
                    >
                      <Plus className="h-3 w-3 text-purple-700" />
                    </Button>
                  </div>
                </>
              ) : (
                companyProfile.markets_operating_in?.map((market, index) => (
                  <Badge 
                    key={index}
                    className="bg-[#f6efff] text-purple-700 hover:bg-[#f6efff] px-2 py-0.5 text-xs font-normal"
                  >
                    {market.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Badge>
                ))
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
} 