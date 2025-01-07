'use client'

import { useState, useEffect } from 'react'
import { Card } from "@/components/ui/card"
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
      <div className="p-6 bg-white rounded-lg">
        <div className="animate-pulse flex items-center gap-4">
          <div className="w-11 h-11 bg-gray-100 rounded-full"></div>
          <div className="space-y-2.5 flex-1">
            <div className="h-5 bg-gray-100 rounded w-40"></div>
            <div className="flex gap-6">
              <div className="h-4 bg-gray-100 rounded w-20"></div>
              <div className="h-4 bg-gray-100 rounded w-24"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 bg-white rounded-lg">
        <div className="flex items-center gap-2 text-red-500">
          <span className="font-medium">Error:</span>
          <span>{error}</span>
        </div>
      </div>
    )
  }

  if (!companyData) {
    return (
      <div className="p-6 bg-white rounded-lg">
        <div className="text-muted-foreground">No company data available</div>
      </div>
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
    <div className="px-6 py-5 bg-white rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-11 w-11 bg-[#f6efff]">
            <AvatarFallback className="text-[#30035e] font-medium">
              {getInitials(companyData.name)}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h2 className="text-[15px] font-semibold">
              {companyData.name}
            </h2>
            <div className="flex items-center gap-6 text-muted-foreground">
              <div className="flex items-center gap-1.5 text-[13px]">
                <Briefcase className="h-[14px] w-[14px]" />
                <span>HR Tech</span>
              </div>
              <div className="flex items-center gap-1.5 text-[13px]">
                <DollarSign className="h-[14px] w-[14px]" />
                <span>$50 million</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-5 text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Package className="h-[15px] w-[15px]" />
            <span className="text-[13px]">{companyData.main_products.length}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Globe2 className="h-[15px] w-[15px]" />
            <span className="text-[13px]">{companyData.markets_operating_in.length}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Building2 className="h-[15px] w-[15px]" />
            <span className="text-[13px]">{companyProfile?.icps?.length || 0}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="h-[15px] w-[15px]" />
            <span className="text-[13px]">{companyProfile?.personas?.length || 0}</span>
          </div>
        </div>
      </div>
    </div>
  )
} 