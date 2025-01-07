'use client'

import { useState, useEffect } from 'react'
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, Package, Users, Globe2, Briefcase, DollarSign } from "lucide-react"
import { useDashboardStore } from '@/app/dashboard/store'
import type { Company } from '../types/company'
import { getCompanyById } from '../utils/actions'
import { cn } from '@/lib/utils'

interface CompanyProfileHeaderProps {
  companyId: number
}

interface MetricCardProps {
  icon: React.ReactNode
  value: number
  label: string
}

function MetricCard({ icon, value, label }: MetricCardProps) {
  return (
    <div className="flex flex-col items-center justify-center p-4 bg-[#f6efff] rounded-lg border border-[#f9a8c9] hover:bg-[#f0e6ff] transition-colors">
      <div className="text-[#30035e] mb-2">{icon}</div>
      <span className="text-2xl font-bold text-[#30035e] mb-1">{value}</span>
      <span className="text-sm text-[#30035e]/80">{label}</span>
    </div>
  )
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
        <div className="animate-pulse space-y-6">
          <div className="flex justify-between items-center">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="flex gap-2">
              <div className="h-6 bg-gray-200 rounded w-24"></div>
              <div className="h-6 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
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
      {/* Primary Company Information */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#f6efff] rounded-lg">
            <Building2 className="h-6 w-6 text-[#30035e]" />
          </div>
          <h2 className="text-2xl font-bold text-[#30035e]">{companyData.name}</h2>
        </div>
        <div className="flex gap-3">
          {companyData.industry && (
            <Badge variant="secondary" className="px-3 py-1.5 bg-[#f6efff] text-[#30035e]">
              <Briefcase className="h-4 w-4 mr-2" />
              {companyData.industry}
            </Badge>
          )}
          {companyData.annual_revenue && (
            <Badge variant="secondary" className="px-3 py-1.5 bg-[#f6efff] text-[#30035e]">
              <DollarSign className="h-4 w-4 mr-2" />
              {companyData.annual_revenue}
            </Badge>
          )}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          icon={<Package className="h-5 w-5" />}
          value={companyData.main_products.length}
          label="Products"
        />
        <MetricCard
          icon={<Globe2 className="h-5 w-5" />}
          value={companyData.markets_operating_in.length}
          label="Markets"
        />
        <MetricCard
          icon={<Building2 className="h-5 w-5" />}
          value={companyProfile?.icps?.length || 0}
          label="ICPs"
        />
        <MetricCard
          icon={<Users className="h-5 w-5" />}
          value={companyProfile?.personas?.length || 0}
          label="Personas"
        />
      </div>

      {/* Detailed Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {companyData.main_products.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-[#30035e] uppercase tracking-wider">Products</h3>
            <div className="flex flex-wrap gap-2">
              {companyData.main_products.map((product, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="bg-[#f6efff] text-[#30035e] px-3 py-1"
                >
                  {product}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {companyData.markets_operating_in.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-[#30035e] uppercase tracking-wider">Markets</h3>
            <div className="flex flex-wrap gap-2">
              {companyData.markets_operating_in.map((market, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="bg-[#f6efff] text-[#30035e] px-3 py-1"
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