'use client'

import { useState } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Building2, Package, Users, Globe2, Pencil, Briefcase, DollarSign } from "lucide-react"
import { useDashboardStore } from '@/app/dashboard/store'
import type { Company } from '../types/company'

interface CompanyProfileHeaderProps {
  companyId: number
}

export function CompanyProfileHeader({ companyId }: CompanyProfileHeaderProps) {
  const { company, companyProfile } = useDashboardStore()
  const [editingSection, setEditingSection] = useState<'products' | 'competitors' | 'icps' | 'personas' | null>(null)

  if (company.isLoading) {
    return (
      <Card className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    )
  }

  if (company.error) {
    return (
      <Card className="p-4">
        <div className="text-red-500">Error loading company data: {company.error}</div>
      </Card>
    )
  }

  const companyData = company.data

  if (!companyData) {
    return (
      <Card className="p-4">
        <div className="text-muted-foreground">No company data available</div>
      </Card>
    )
  }

  return (
    <Card className="p-4">
      <div className="space-y-4">
        {/* Company Name and Info Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-[#f9a8c9]" />
              <h3 className="text-lg font-semibold text-[#30035e]">{companyData.name}</h3>
            </div>
            {companyData.industry && (
              <Badge variant="secondary" className="bg-[#f6efff]">
                <Briefcase className="h-3 w-3 mr-1" />
                {companyData.industry}
              </Badge>
            )}
            {companyData.annual_revenue && (
              <Badge variant="secondary" className="bg-[#f6efff]">
                <DollarSign className="h-3 w-3 mr-1" />
                {companyData.annual_revenue}
              </Badge>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Products */}
          <Badge 
            variant="outline" 
            className="w-full py-3 bg-[#f6efff] border-[#f9a8c9] text-[#30035e] flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <span>{companyData.main_products.length} Products</span>
            </div>
          </Badge>

          {/* Markets */}
          <Badge 
            variant="outline" 
            className="w-full py-3 bg-[#f6efff] border-[#f9a8c9] text-[#30035e] flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Globe2 className="h-4 w-4" />
              <span>{companyData.markets_operating_in.length} Markets</span>
            </div>
          </Badge>

          {/* ICPs */}
          <Badge 
            variant="outline" 
            className="w-full py-3 bg-[#f6efff] border-[#f9a8c9] text-[#30035e] flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span>{companyProfile?.icps?.length || 0} ICPs</span>
            </div>
          </Badge>

          {/* Personas */}
          <Badge 
            variant="outline" 
            className="w-full py-3 bg-[#f6efff] border-[#f9a8c9] text-[#30035e] flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>{companyProfile?.personas?.length || 0} Personas</span>
            </div>
          </Badge>
        </div>

        {/* Additional Company Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
          {companyData.main_products.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-[#30035e]">Main Products</h4>
              <div className="flex flex-wrap gap-2">
                {companyData.main_products.map((product, index) => (
                  <Badge key={index} variant="outline" className="bg-[#f6efff]">
                    {product}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {companyData.markets_operating_in.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-[#30035e]">Markets</h4>
              <div className="flex flex-wrap gap-2">
                {companyData.markets_operating_in.map((market, index) => (
                  <Badge key={index} variant="outline" className="bg-[#f6efff]">
                    {market.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
} 