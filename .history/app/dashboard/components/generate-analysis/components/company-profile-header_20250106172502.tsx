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
      <Card className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="flex justify-between items-center">
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            <div className="flex gap-2">
              <div className="h-5 bg-gray-200 rounded w-20"></div>
              <div className="h-5 bg-gray-200 rounded w-20"></div>
            </div>
          </div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
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
    <Card className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-[#30035e]" />
          <h2 className="text-lg font-semibold text-[#30035e]">{companyData.name}</h2>
        </div>
        <div className="flex gap-2">
          {companyData.industry && (
            <Badge variant="secondary" className="text-xs bg-[#f6efff] text-[#30035e] font-normal">
              <Briefcase className="h-3 w-3 mr-1" />
              {companyData.industry}
            </Badge>
          )}
          {companyData.annual_revenue && (
            <Badge variant="secondary" className="text-xs bg-[#f6efff] text-[#30035e] font-normal">
              <DollarSign className="h-3 w-3 mr-1" />
              {companyData.annual_revenue}
            </Badge>
          )}
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1 text-[#30035e]">
            <Package className="h-4 w-4" />
            <span className="text-lg font-semibold">{companyData.main_products.length}</span>
          </div>
          <span className="text-xs text-[#30035e]/70">Products</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1 text-[#30035e]">
            <Globe2 className="h-4 w-4" />
            <span className="text-lg font-semibold">{companyData.markets_operating_in.length}</span>
          </div>
          <span className="text-xs text-[#30035e]/70">Markets</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1 text-[#30035e]">
            <Building2 className="h-4 w-4" />
            <span className="text-lg font-semibold">{companyProfile?.icps?.length || 0}</span>
          </div>
          <span className="text-xs text-[#30035e]/70">ICPs</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1 text-[#30035e]">
            <Users className="h-4 w-4" />
            <span className="text-lg font-semibold">{companyProfile?.personas?.length || 0}</span>
          </div>
          <span className="text-xs text-[#30035e]/70">Personas</span>
        </div>
      </div>

      {/* Lists */}
      <div className="space-y-3">
        {companyData.main_products.length > 0 && (
          <div>
            <h3 className="text-xs font-medium text-[#30035e] uppercase mb-2">Products</h3>
            <div className="flex flex-wrap gap-1.5">
              {companyData.main_products.map((product, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="text-xs bg-[#f6efff] text-[#30035e] font-normal"
                >
                  {product}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {companyData.markets_operating_in.length > 0 && (
          <div>
            <h3 className="text-xs font-medium text-[#30035e] uppercase mb-2">Markets</h3>
            <div className="flex flex-wrap gap-1.5">
              {companyData.markets_operating_in.map((market, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="text-xs bg-[#f6efff] text-[#30035e] font-normal"
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