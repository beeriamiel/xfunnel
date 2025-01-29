'use client'

import { Suspense, useEffect, useRef } from 'react'
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
import type { Database } from '@/types/supabase'
import type { Step } from '../generate-analysis/types/setup'
import { useRouter, useSearchParams } from 'next/navigation'
import { checkOnboardingStatus } from '../actions/check-onboarding'

interface DashboardWrapperProps {
  children: React.ReactNode;
  selectedCompany: Company | null;
  accountId: string;
  initialCompanies: Company[];
  isOnboarding: boolean;
  currentStep?: Step;
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
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900">No Company Selected</h2>
        <p className="mt-1 text-sm text-gray-500">
          Please select a company to view the dashboard
        </p>
      </div>
    </div>
  )
}

export function DashboardWrapper({ 
  selectedCompany,
  accountId,
  initialCompanies,
  isOnboarding,
  currentStep,
  children,
  isSuperAdmin
}: DashboardWrapperProps) {
  console.log('🔵 DashboardWrapper Render:', {
    selectedCompany,
    accountId,
    initialCompaniesCount: initialCompanies.length,
    isOnboarding,
    storeState: useDashboardStore.getState(),
    pathname: window?.location?.pathname,
    search: window?.location?.search
  })

  const router = useRouter()
  const searchParams = useSearchParams()
  const { setSelectedCompanyId, setCompanies, setWizardStep, setIsSuperAdmin } = useDashboardStore()
  const hasRedirected = useRef(false)

  useEffect(() => {
    console.log('🟡 DashboardWrapper setting companies:', {
      initialCompanies,
      currentStoreState: useDashboardStore.getState(),
      pathname: window?.location?.pathname
    })
    setCompanies(initialCompanies)
    setIsSuperAdmin(isSuperAdmin ?? false)
    
    // Only check onboarding for single company
    if (initialCompanies.length === 1 && !hasRedirected.current) {
      const company = initialCompanies[0]
      console.log('🟡 Setting selectedCompanyId for single company:', {
        companyId: company.id,
        hasRedirected: hasRedirected.current,
        pathname: window?.location?.pathname
      })
      setSelectedCompanyId(company.id)
      
      // Prevent multiple redirects
      hasRedirected.current = true
      
      // Check onboarding status and redirect if needed
      checkOnboardingStatus(company.id).then(incompleteStep => {
        console.log('🟡 Onboarding check result:', { 
          incompleteStep,
          currentStep: searchParams.get('step'),
          pathname: window?.location?.pathname
        })
        if (incompleteStep) {
          // Only redirect if we're not already on the correct step
          const currentStep = searchParams.get('step')
          if (currentStep !== incompleteStep) {
            console.log('🟡 Redirecting to step:', incompleteStep)
            router.replace(`/dashboard/generate-analysis?step=${incompleteStep}`)
          }
          setWizardStep(incompleteStep)
        }
      })
    }
  }, [initialCompanies, setCompanies, setSelectedCompanyId, router, searchParams, setWizardStep, isSuperAdmin, setIsSuperAdmin])

  let mainContent
  if (isOnboarding || searchParams.get('step')) {
    console.log('🟡 Rendering onboarding content:', {
      isOnboarding,
      step: searchParams.get('step'),
      pathname: window?.location?.pathname
    })
    mainContent = <div className="w-full h-full">{children}</div>
  } else if (!selectedCompany && !searchParams.get('companyId') && !searchParams.get('company')) {
    // Only show NoCompanySelected if we don't have a company ID in URL
    console.log('🟡 Rendering NoCompanySelected:', {
      initialCompaniesCount: initialCompanies.length,
      selectedCompany,
      hasCompanyId: !!searchParams.get('companyId'),
      hasCompany: !!searchParams.get('company'),
      pathname: window?.location?.pathname
    })
    mainContent = <NoCompanySelected />
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
          <div className="flex flex-1 h-[calc(100vh-4rem)]">
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