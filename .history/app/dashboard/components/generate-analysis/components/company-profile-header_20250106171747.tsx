'use client'

import { useState, useEffect } from 'react'
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Building2, 
  Package, 
  Users, 
  Globe2, 
  Briefcase, 
  DollarSign,
} from "lucide-react"
import { useDashboardStore } from '@/app/dashboard/store'
import type { Company } from '../types/company'
import { getCompanyById } from '../utils/actions'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

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
        <div className="animate-pulse flex items-center gap-4">
          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
          <div className="space-y-2 flex-1">
            <div className="h-5 bg-gray-200 rounded w-48"></div>
            <div className="flex gap-4">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-2 text-red-500">
          <span className="font-medium">Error:</span>
          <span>{error}</span>
        </div>
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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Card className="p-4 bg-white hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-10 w-10 border-2 border-[#f9a8c9]/20 bg-[#f6efff]">
            <AvatarFallback className="text-[#30035e] font-semibold text-sm">
              {getInitials(companyData.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-lg font-semibold text-[#30035e] mb-0.5">
              {companyData.name}
            </h2>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {companyData.industry && (
                <div className="flex items-center gap-1.5">
                  <Briefcase className="h-3.5 w-3.5" />
                  <span>{companyData.industry}</span>
                </div>
              )}
              {companyData.annual_revenue && (
                <div className="flex items-center gap-1.5">
                  <DollarSign className="h-3.5 w-3.5" />
                  <span>{companyData.annual_revenue}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1.5 text-muted-foreground hover:text-[#30035e] transition-colors">
            <Package className="h-4 w-4" />
            <span className="text-sm">{companyData.main_products.length}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground hover:text-[#30035e] transition-colors">
            <Globe2 className="h-4 w-4" />
            <span className="text-sm">{companyData.markets_operating_in.length}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground hover:text-[#30035e] transition-colors">
            <Building2 className="h-4 w-4" />
            <span className="text-sm">{companyProfile?.icps?.length || 0}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground hover:text-[#30035e] transition-colors">
            <Users className="h-4 w-4" />
            <span className="text-sm">{companyProfile?.personas?.length || 0}</span>
          </div>
        </div>
      </div>
    </Card>
  )
} 