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
  children
}: DashboardWrapperProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setSelectedCompanyId, setCompanies, setCurrentStep } = useDashboardStore()
  const hasRedirected = useRef(false)

  useEffect(() => {
    setCompanies(initialCompanies)
    
    // Only check onboarding for single company
    if (initialCompanies.length === 1 && !hasRedirected.current) {
      const company = initialCompanies[0]
      setSelectedCompanyId(company.id)
      
      // Prevent multiple redirects
      hasRedirected.current = true
      
      // Check onboarding status and redirect if needed
      checkOnboardingStatus(company.id).then(incompleteStep => {
        if (incompleteStep) {
          // Only redirect if we're not already on the correct step
          const currentStep = searchParams.get('step')
          if (currentStep !== incompleteStep) {
            router.replace(`/dashboard/generate-analysis?step=${incompleteStep}`)
          }
          setCurrentStep(incompleteStep)
        }
      })
    }
  }, [initialCompanies, setCompanies, setSelectedCompanyId, router, searchParams, setCurrentStep])

  let mainContent
  if (isOnboarding || searchParams.get('step')) {
    mainContent = <div className="w-full px-8 py-6">{children}</div>
  } else if (initialCompanies.length > 0 && !selectedCompany) {
    mainContent = <NoCompanySelected />
  } else {
    mainContent = <div className="flex-1">{children}</div>
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <SidebarProvider>
        <div className="flex flex-col min-h-screen w-full">
          <Suspense fallback={<LoadingSkeleton />}>
            <DashboardHeader />
          </Suspense>
          <div className="flex flex-1 h-[calc(100vh-4rem)]">
            <AppSidebar className="h-full shrink-0" />
            <main className="flex-1 w-full overflow-auto">
              {mainContent}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </ErrorBoundary>
  )
} 