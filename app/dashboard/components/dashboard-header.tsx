'use client'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useDashboardStore } from "../store"
import AuthButton from "@/components/header-auth"
import { ErrorBoundary } from "@/components/error-boundary"
import { createClient } from '@/app/supabase/client'
import { useEffect } from 'react'
import { CompanySelector } from "./company-selector"
import { ProductSelector } from "./product-selector"
import { StaticCompanyDisplay } from "./static-company-display"
import type { Company } from '../generate-analysis/types/company'
import { getCompanyProfile } from '../generate-analysis/utils/actions'
import { useParams } from 'next/navigation'

interface DashboardHeaderProps {
  title?: string;
  accountId: string;
}

export function DashboardHeader({ title, accountId }: DashboardHeaderProps) {
  const { activeView, isSuperAdmin, companies, selectedCompanyId, companyProfile, selectedProductId, setCompanyProfile, setSelectedProductId } = useDashboardStore()
  const selectedCompany = companies.find(c => c.id === selectedCompanyId) || null
  const selectedProduct = companyProfile?.products?.find(p => p.id.toString() === selectedProductId) || null
  const supabase = createClient()
  
  // Add logging
  useEffect(() => {
    const header = document.querySelector('header')
    if (header) {
      console.log('Header dimensions:', {
        width: header.clientWidth,
        offsetWidth: header.offsetWidth,
        scrollWidth: header.scrollWidth,
        parentWidth: header.parentElement?.clientWidth
      })
    }
  }, [])

  // Fetch company profile when selectedCompanyId changes
  useEffect(() => {
    async function fetchCompanyProfile() {
      if (!selectedCompanyId || !accountId) {
        console.log('Missing required IDs:', { selectedCompanyId, accountId })
        return
      }
      
      try {
        console.log('Fetching company profile for:', { selectedCompanyId, accountId })
        const profile = await getCompanyProfile(selectedCompanyId, accountId)
        console.log('Received profile:', profile)
        
        if (!profile) {
          console.log('No profile received, resetting state')
          setCompanyProfile(null)
          setSelectedProductId(null)
          return
        }

        // Transform API response to match CompanyProfile interface
        const transformedProfile = {
          ...profile,
          icps: profile.ideal_customer_profiles || [],
          personas: profile.ideal_customer_profiles?.flatMap(icp => icp.personas || []) || [],
          products: profile.products || [],
          competitors: (profile.competitors || []).map(c => ({
            id: String(c.id),
            name: c.competitor_name
          }))
        }

        // Deep compare relevant fields to check for changes
        const hasRelevantChanges = !companyProfile || 
          transformedProfile.name !== companyProfile.name ||
          JSON.stringify(transformedProfile.products) !== JSON.stringify(companyProfile.products) ||
          JSON.stringify(transformedProfile.competitors) !== JSON.stringify(companyProfile.competitors)

        if (hasRelevantChanges) {
          console.log('Profile has relevant changes, updating state')
          
          // Check if current product still exists and is valid
          const currentProduct = selectedProductId && transformedProfile.products?.find(
            p => p.id.toString() === selectedProductId
          )
          
          if (!currentProduct) {
            console.log('Selected product no longer valid, resetting selection')
            setSelectedProductId(null)
          } else {
            console.log('Keeping current product selection:', currentProduct.name)
          }
          
          setCompanyProfile(transformedProfile)
        } else {
          console.log('No relevant changes detected, skipping update')
        }
      } catch (error) {
        console.error('Error fetching company profile:', error)
        // Don't reset everything on error, just log it
        console.warn('Keeping existing state due to fetch error')
      }
    }

    fetchCompanyProfile()
  }, [selectedCompanyId, accountId, setCompanyProfile, setSelectedProductId, companyProfile, selectedProductId])
  
  // Add logging for products being passed to selector
  console.log('Products being passed to selector:', companyProfile?.products || [])

  const viewTitle = title || (
    activeView === 'engine' 
      ? 'AI Engine Performance' 
      : activeView === 'journey'
      ? 'Buying Journey Analysis'
      : activeView === 'new-journey'
      ? 'New Buying Journey Analysis'
      : activeView === 'citation'
      ? 'Citation Analysis'
      : activeView === 'response'
      ? 'Generate Analysis'
      : activeView === 'icp'
      ? 'ICP Analysis'
      : activeView === 'takeaways'
      ? 'Key Takeaways'
      : activeView === 'personal'
      ? 'Personal Settings'
      : activeView === 'faqs'
      ? 'FAQs'
      : activeView === 'ai-overviews'
      ? 'AI Overviews'
      : 'Dashboard'
  )

  // Determine the section based on activeView
  const section = 
    activeView === 'response' 
      ? 'Generate'
      : activeView === 'faqs' || activeView === 'personal'
      ? 'System'
      : 'Dashboard'

  // Determine if we should show the section link
  const showSectionLink = section !== 'Dashboard' || activeView !== 'engine'

  // Determine if we should show company selector
  const shouldShowCompanySelector = isSuperAdmin || companies.length > 1

  // Determine if we should show product selector
  const shouldShowProductSelector = selectedCompany && (isSuperAdmin || (companyProfile?.products?.length ?? 0) > 1)

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b px-4">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            {selectedCompany && (
              <>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbPage className="text-muted-foreground font-medium">
                    {selectedCompany.name}
                  </BreadcrumbPage>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
              </>
            )}
            {showSectionLink && (
              <>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">{section}</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
              </>
            )}
            <BreadcrumbItem>
              <BreadcrumbPage>{viewTitle}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="flex items-center gap-4">
        {shouldShowCompanySelector ? (
          <CompanySelector selectedCompany={selectedCompany} companies={companies} />
        ) : selectedCompany && (
          <StaticCompanyDisplay companyName={selectedCompany.name} />
        )}
        {shouldShowProductSelector && (
          <ProductSelector 
            selectedProduct={selectedProduct} 
            products={companyProfile?.products || []} 
          />
        )}
        <AuthButton />
      </div>
    </header>
  )
} 