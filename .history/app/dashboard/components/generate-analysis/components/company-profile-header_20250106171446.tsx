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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

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
      <Card className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
            <div className="space-y-2">
              <div className="h-6 bg-gray-200 rounded w-48"></div>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
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
    <Card className="p-6 bg-gradient-to-br from-white to-gray-50/50">
      <div className="space-y-6">
        {/* Company Identity Section */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12 border-2 border-primary/10">
              <AvatarFallback className="bg-primary/5 text-primary">
                {getInitials(companyData.name)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-primary">
                {companyData.name}
              </h2>
              <div className="flex items-center gap-2">
                {companyData.industry && (
                  <Badge variant="secondary" className="bg-primary/5 text-primary/80">
                    <Briefcase className="h-3 w-3 mr-1" />
                    {companyData.industry}
                  </Badge>
                )}
                {companyData.annual_revenue && (
                  <Badge variant="secondary" className="bg-primary/5 text-primary/80">
                    <DollarSign className="h-3 w-3 mr-1" />
                    {companyData.annual_revenue}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-muted-foreground"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <TooltipProvider>
            {/* Products */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Card className="p-4 transition-all hover:shadow-md hover:-translate-y-0.5 cursor-default">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-primary/60">
                      <Package className="h-4 w-4" />
                      <span className="text-sm font-medium">Products</span>
                    </div>
                    <p className="text-2xl font-semibold text-primary">
                      {companyData.main_products.length}
                    </p>
                  </div>
                </Card>
              </TooltipTrigger>
              <TooltipContent>
                <p>Number of main products</p>
              </TooltipContent>
            </Tooltip>

            {/* Markets */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Card className="p-4 transition-all hover:shadow-md hover:-translate-y-0.5 cursor-default">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-primary/60">
                      <Globe2 className="h-4 w-4" />
                      <span className="text-sm font-medium">Markets</span>
                    </div>
                    <p className="text-2xl font-semibold text-primary">
                      {companyData.markets_operating_in.length}
                    </p>
                  </div>
                </Card>
              </TooltipTrigger>
              <TooltipContent>
                <p>Operating markets</p>
              </TooltipContent>
            </Tooltip>

            {/* ICPs */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Card className="p-4 transition-all hover:shadow-md hover:-translate-y-0.5 cursor-default">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-primary/60">
                      <Building2 className="h-4 w-4" />
                      <span className="text-sm font-medium">ICPs</span>
                    </div>
                    <p className="text-2xl font-semibold text-primary">
                      {companyProfile?.icps?.length || 0}
                    </p>
                  </div>
                </Card>
              </TooltipTrigger>
              <TooltipContent>
                <p>Ideal Customer Profiles</p>
              </TooltipContent>
            </Tooltip>

            {/* Personas */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Card className="p-4 transition-all hover:shadow-md hover:-translate-y-0.5 cursor-default">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-primary/60">
                      <Users className="h-4 w-4" />
                      <span className="text-sm font-medium">Personas</span>
                    </div>
                    <p className="text-2xl font-semibold text-primary">
                      {companyProfile?.personas?.length || 0}
                    </p>
                  </div>
                </Card>
              </TooltipTrigger>
              <TooltipContent>
                <p>Target personas</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Expandable Details Section */}
        <div className={cn(
          "grid grid-cols-1 md:grid-cols-2 gap-6 overflow-hidden transition-all duration-200",
          isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}>
          {companyData.main_products.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-primary/80">Main Products</h4>
              <div className="flex flex-wrap gap-2">
                {companyData.main_products.map((product, index) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className="bg-primary/5 hover:bg-primary/10 transition-colors"
                  >
                    {product}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {companyData.markets_operating_in.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-primary/80">Markets</h4>
              <div className="flex flex-wrap gap-2">
                {companyData.markets_operating_in.map((market, index) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className="bg-primary/5 hover:bg-primary/10 transition-colors"
                  >
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