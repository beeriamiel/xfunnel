'use client'

import { useState, useEffect } from 'react'
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, Package, Users, Globe2, Briefcase, DollarSign } from "lucide-react"
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

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-5 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-red-500">Error loading company data: {error}</div>
      </Card>
    )
  }

  if (!companyData) {
    return (
      <Card className="p-6">
        <div className="text-muted-foreground">No company data available</div>
      </Card>
    )
  }

  return (
    <Card className="p-6 space-y-6">
      {/* Company Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-purple-700" />
          <h2 className="text-lg font-semibold">{companyData.name}</h2>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-[#f6efff] text-purple-700 hover:bg-[#f6efff] px-2 py-0.5 text-xs font-normal">
            <Briefcase className="h-3 w-3 mr-1" />
            HR Tech
          </Badge>
          <Badge className="bg-[#f6efff] text-purple-700 hover:bg-[#f6efff] px-2 py-0.5 text-xs font-normal">
            <DollarSign className="h-3 w-3 mr-1" />
            $50 million
          </Badge>
        </div>
      </div>

      {/* Stats */}
      <div className="flex justify-center gap-16">
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 mb-1">
            <Package className="h-4 w-4 text-purple-700" />
            <span className="text-xl font-semibold">{companyData.main_products.length}</span>
          </div>
          <span className="text-sm text-gray-600">Products</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 mb-1">
            <Globe2 className="h-4 w-4 text-purple-700" />
            <span className="text-xl font-semibold">{companyData.markets_operating_in.length}</span>
          </div>
          <span className="text-sm text-gray-600">Markets</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="h-4 w-4 text-purple-700" />
            <span className="text-xl font-semibold">{companyProfile?.icps?.length || 0}</span>
          </div>
          <span className="text-sm text-gray-600">ICPs</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 mb-1">
            <Users className="h-4 w-4 text-purple-700" />
            <span className="text-xl font-semibold">{companyProfile?.personas?.length || 0}</span>
          </div>
          <span className="text-sm text-gray-600">Personas</span>
        </div>
      </div>

      {/* Products & Markets */}
      <div className="space-y-4">
        {companyData.main_products.length > 0 && (
          <div>
            <h3 className="text-xs font-medium uppercase text-gray-600 mb-2">Products</h3>
            <div className="flex flex-wrap gap-2">
              {companyData.main_products.map((product, index) => (
                <Badge 
                  key={index}
                  className="bg-[#f6efff] text-purple-700 hover:bg-[#f6efff] px-3 py-1 text-sm font-normal"
                >
                  {product}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {companyData.markets_operating_in.length > 0 && (
          <div>
            <h3 className="text-xs font-medium uppercase text-gray-600 mb-2">Markets</h3>
            <div className="flex flex-wrap gap-2">
              {companyData.markets_operating_in.map((market, index) => (
                <Badge 
                  key={index}
                  className="bg-[#f6efff] text-purple-700 hover:bg-[#f6efff] px-3 py-1 text-sm font-normal"
                >
                  {market.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
} 