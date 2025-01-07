'use client'

import { useState, useEffect } from 'react'
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Building2, Package, Users, Globe2, Pencil, X, Plus, Save } from "lucide-react"
import { useDashboardStore } from '@/app/dashboard/store'
import type { Company } from '../types/company'
import { getCompanyById } from '../utils/actions'

interface CompanyProfileHeaderProps {
  companyId: number
}

export function CompanyProfileHeader({ companyId }: CompanyProfileHeaderProps) {
  const { companyProfile } = useDashboardStore()
  const [companyData, setCompanyData] = useState<Company | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState('')
  const [editedProducts, setEditedProducts] = useState<string[]>([])
  const [editedMarkets, setEditedMarkets] = useState<string[]>([])
  const [newProduct, setNewProduct] = useState('')
  const [newMarket, setNewMarket] = useState('')

  useEffect(() => {
    if (companyData) {
      setEditedName(companyData.name)
      setEditedProducts(companyData.main_products)
      setEditedMarkets(companyData.markets_operating_in)
    }
  }, [companyData])

  useEffect(() => {
    async function fetchCompanyData() {
      if (!companyId) return
      
      setIsLoading(true)
      try {
        const data = await getCompanyById(companyId)
        setCompanyData(data)
        setError(null)
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to fetch company data')
        setCompanyData(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCompanyData()
  }, [companyId])

  const handleSave = async () => {
    // TODO: Implement save functionality
    setIsEditing(false)
  }

  const handleCancel = () => {
    if (companyData) {
      setEditedName(companyData.name)
      setEditedProducts(companyData.main_products)
      setEditedMarkets(companyData.markets_operating_in)
    }
    setIsEditing(false)
  }

  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-5 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-4">
        <div className="text-red-500">Error loading company data: {error}</div>
      </Card>
    )
  }

  if (!companyData) {
    return (
      <Card className="p-4">
        <div className="text-muted-foreground">No company data available</div>
      </Card>
    )
  }

  return (
    <Card className="p-4 relative">
      {/* Edit Controls */}
      <div className="absolute top-3 right-3 flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
        >
          {isEditing ? (
            <Save className="h-4 w-4 text-purple-700" />
          ) : (
            <Pencil className="h-4 w-4 text-purple-700" />
          )}
        </Button>
        {isEditing && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={handleCancel}
          >
            <X className="h-4 w-4 text-gray-500" />
          </Button>
        )}
      </div>

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
            <h2 className="text-lg font-semibold">{companyData.name}</h2>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Package className="h-3.5 w-3.5 text-purple-700" />
            <span className="text-sm font-medium">{companyData.main_products.length}</span>
            <span className="text-sm text-gray-500">Products</span>
          </div>
          <div className="flex items-center gap-1">
            <Globe2 className="h-3.5 w-3.5 text-purple-700" />
            <span className="text-sm font-medium">{companyData.markets_operating_in.length}</span>
            <span className="text-sm text-gray-500">Markets</span>
          </div>
          <div className="flex items-center gap-1">
            <Building2 className="h-3.5 w-3.5 text-purple-700" />
            <span className="text-sm font-medium">{companyProfile?.icps?.length || 0}</span>
            <span className="text-sm text-gray-500">ICPs</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5 text-purple-700" />
            <span className="text-sm font-medium">{companyProfile?.personas?.length || 0}</span>
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
              companyData.main_products.map((product, index) => (
                <Badge 
                  key={index}
                  className="bg-[#f6efff] text-purple-700 hover:bg-[#f6efff] px-2 py-0.5 text-xs font-normal"
                >
                  {product}
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
              companyData.markets_operating_in.map((market, index) => (
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
  )
} 