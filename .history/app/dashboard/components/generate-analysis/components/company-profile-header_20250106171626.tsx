'use client'

import { useState, useEffect } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Building2, 
  Package, 
  Users, 
  Globe2, 
  Briefcase, 
  DollarSign,
  ChevronDown,
  ChevronUp
} from "lucide-react"
import { useDashboardStore } from '@/app/dashboard/store'
import type { Company } from '../types/company'
import { getCompanyById } from '../utils/actions'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface CompanyProfileHeaderProps {
  companyId: number
}

export function CompanyProfileHeader({ companyId }: CompanyProfileHeaderProps) {
  const { companyProfile } = useDashboardStore()
  const [companyData, setCompanyData] = useState<Company | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)

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
      <div className="space-y-6">
        <Card className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div className="space-y-2">
                <div className="h-6 bg-gray-200 rounded w-48"></div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
              </div>
            </div>
          </div>
        </Card>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="h-[120px] animate-pulse bg-gray-100" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 text-red-500">
          <span className="font-medium">Error:</span>
          <span>{error}</span>
        </div>
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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="space-y-6">
      {/* Company Identity Card */}
      <Card className="p-6 bg-white">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12 border-2 border-primary/10 bg-primary/5">
              <AvatarFallback className="bg-primary/5 text-primary font-semibold">
                {getInitials(companyData.name)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1.5">
              <h2 className="text-xl font-semibold">
                {companyData.name}
              </h2>
              <div className="flex items-center gap-3">
                {companyData.industry && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Briefcase className="h-4 w-4" />
                    <span>{companyData.industry}</span>
                  </div>
                )}
                {companyData.annual_revenue && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <DollarSign className="h-4 w-4" />
                    <span>{companyData.annual_revenue}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-muted-foreground hover:text-primary"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </Card>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Products Card */}
        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-200">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-1 text-muted-foreground">
              <Package className="h-4 w-4" />
              <span className="text-sm font-medium">Products</span>
            </div>
            <p className="text-3xl font-semibold">
              {companyData.main_products.length}
            </p>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </Card>

        {/* Markets Card */}
        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-200">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-1 text-muted-foreground">
              <Globe2 className="h-4 w-4" />
              <span className="text-sm font-medium">Markets</span>
            </div>
            <p className="text-3xl font-semibold">
              {companyData.markets_operating_in.length}
            </p>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </Card>

        {/* ICPs Card */}
        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-200">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-1 text-muted-foreground">
              <Building2 className="h-4 w-4" />
              <span className="text-sm font-medium">ICPs</span>
            </div>
            <p className="text-3xl font-semibold">
              {companyProfile?.icps?.length || 0}
            </p>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </Card>

        {/* Personas Card */}
        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-200">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-1 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span className="text-sm font-medium">Personas</span>
            </div>
            <p className="text-3xl font-semibold">
              {companyProfile?.personas?.length || 0}
            </p>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </Card>
      </div>

      {/* Expandable Details */}
      <div className={cn(
        "grid grid-cols-1 md:grid-cols-2 gap-6 overflow-hidden transition-all duration-300",
        isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
      )}>
        {companyData.main_products.length > 0 && (
          <Card className="p-6 hover:shadow-md transition-shadow">
            <h4 className="text-sm font-medium text-muted-foreground mb-3">Main Products</h4>
            <div className="flex flex-wrap gap-2">
              {companyData.main_products.map((product, index) => (
                <Badge 
                  key={index} 
                  variant="secondary"
                  className="bg-primary/5 hover:bg-primary/10 transition-colors px-3 py-1"
                >
                  {product}
                </Badge>
              ))}
            </div>
          </Card>
        )}

        {companyData.markets_operating_in.length > 0 && (
          <Card className="p-6 hover:shadow-md transition-shadow">
            <h4 className="text-sm font-medium text-muted-foreground mb-3">Markets</h4>
            <div className="flex flex-wrap gap-2">
              {companyData.markets_operating_in.map((market, index) => (
                <Badge 
                  key={index} 
                  variant="secondary"
                  className="bg-primary/5 hover:bg-primary/10 transition-colors px-3 py-1"
                >
                  {market.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Badge>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
} 