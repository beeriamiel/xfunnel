'use client'

import { useState, useEffect } from 'react'
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Building2, Package, Users, Globe2 } from "lucide-react"
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
    <Card className="p-4">
      <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
        {/* Company Name */}
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-purple-700" />
          <h2 className="text-lg font-semibold">{companyData.name}</h2>
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
            {companyData.main_products.map((product, index) => (
              <Badge 
                key={index}
                className="bg-[#f6efff] text-purple-700 hover:bg-[#f6efff] px-2 py-0.5 text-xs font-normal"
              >
                {product}
              </Badge>
            ))}
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {companyData.markets_operating_in.map((market, index) => (
              <Badge 
                key={index}
                className="bg-[#f6efff] text-purple-700 hover:bg-[#f6efff] px-2 py-0.5 text-xs font-normal"
              >
                {market.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
} 