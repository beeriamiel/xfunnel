'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { Skeleton } from "@/components/ui/skeleton"
import { CompanySelector } from './company-selector'
import { DashboardContent } from './dashboard-content'
import { ErrorBoundary } from '@/components/error-boundary'
import { ErrorFallback } from '@/components/error-fallback'
import { useDashboardStore } from '../store'
import { DashboardHeader } from './dashboard-header'
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import type { Company } from '../generate-analysis/types/company'
import { useRouter, useSearchParams } from 'next/navigation'

interface DashboardWrapperProps {
  children: React.ReactNode;
  selectedCompany: Company | null;
  accountId: string;
  initialCompanies: Company[];
  isSuperAdmin?: boolean;
}

function LoadingSkeleton() {
  return (
    <div className="flex h-16 items-center px-4">
      <Skeleton className="h-10 w-[200px]" />
    </div>
  )
}

function NoCompanySelected() {
  const { isSuperAdmin, companies } = useDashboardStore()
  
  // For super admins or users with multiple companies
  if (isSuperAdmin || companies.length > 1) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Please Select a Company</h2>
          <p className="mt-1 text-sm text-gray-500">
            Choose a company from the dropdown above to view the dashboard
          </p>
        </div>
      </div>
    )
  }

  // For regular users during loading
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900">Loading Dashboard</h2>
        <p className="mt-1 text-sm text-gray-500">
          Please wait while we load your company data
        </p>
      </div>
    </div>
  )
}

export function DashboardWrapper({ 
  selectedCompany,
  accountId,
  initialCompanies,
  children,
  isSuperAdmin
}: DashboardWrapperProps) {
  console.log('🔵 DashboardWrapper Render:', {
    selectedCompany,
    accountId,
    initialCompaniesCount: initialCompanies.length,
    storeState: useDashboardStore.getState(),
    pathname: window?.location?.pathname,
    search: window?.location?.search
  })

  const router = useRouter()
  const searchParams = useSearchParams()
  const { 
    setSelectedCompanyId, 
    setCompanies,
    setIsSuperAdmin,
    companyProfile,
    setSelectedProductId
  } = useDashboardStore()
  
  const hasRedirected = useRef(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  // Handle company auto-selection
  useEffect(() => {
    console.log('🟡 DashboardWrapper setting companies:', {
      initialCompanies,
      currentStoreState: useDashboardStore.getState(),
      pathname: window?.location?.pathname
    })
    setCompanies(initialCompanies)
    setIsSuperAdmin(isSuperAdmin ?? false)
    
    // Only auto-select if no company is selected in URL
    const urlCompanyId = searchParams.get('company')
    
    // Auto-select for regular users with single company
    if (!isSuperAdmin && initialCompanies.length === 1 && !hasRedirected.current) {
      const company = initialCompanies[0]
      console.log('🟡 Auto-selecting company for regular user:', {
        companyId: company.id,
        hasRedirected: hasRedirected.current
      })
      
      // Update store
      setSelectedCompanyId(company.id)
      
      // Update URL if needed
      if (!urlCompanyId || urlCompanyId !== company.id.toString()) {
        const params = new URLSearchParams(searchParams.toString())
        params.set('company', company.id.toString())
        
        // Prevent multiple redirects
        hasRedirected.current = true
        
        // Replace URL to include company ID
        router.replace(`/dashboard?${params.toString()}`)
      }
      
      setIsInitialLoad(false)
    } else {
      setIsInitialLoad(false)
    }
  }, [initialCompanies, searchParams, router, setCompanies, setSelectedCompanyId, setIsSuperAdmin, isSuperAdmin])

  // Handle product auto-selection
  useEffect(() => {
    // Only proceed if we have a company profile and no product is selected in URL
    if (companyProfile && !searchParams.get('product')) {
      const products = companyProfile.products || []
      // Auto-select if there's only one product
      if (products.length === 1 && !isSuperAdmin) {
        console.log('🟡 Auto-selecting single product:', products[0])
        setSelectedProductId(products[0].id.toString())
      }
    }
  }, [companyProfile, searchParams, setSelectedProductId, isSuperAdmin])

  let mainContent
  
  if (!selectedCompany) {
    // Show loading state during initial load
    if (isInitialLoad) {
      mainContent = <LoadingSkeleton />
    } else if (isSuperAdmin || initialCompanies.length > 1) {
      // Only show NoCompanySelected for super admins or users with multiple companies
      mainContent = <NoCompanySelected />
    } else {
      // Show loading for regular users
      mainContent = <LoadingSkeleton />
    }
  } else {
    console.log('🟡 Rendering main content:', {
      selectedCompany,
      hasCompanyId: !!searchParams.get('companyId'),
      hasCompany: !!searchParams.get('company'),
      pathname: window?.location?.pathname,
      children: !!children
    })
    mainContent = (
      <div className="w-full h-full">
        {children || <DashboardContent accountId={accountId} />}
      </div>
    )
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <SidebarProvider>
        <div className="flex flex-col min-h-screen w-full">
          <Suspense fallback={<LoadingSkeleton />}>
            <DashboardHeader accountId={accountId} />
          </Suspense>
          <div className="flex flex-1 h-[calc(100vh-4rem)] relative">
            <AppSidebar />
            <main className="flex-1 w-full overflow-auto">
              {mainContent}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </ErrorBoundary>
  )
} 
