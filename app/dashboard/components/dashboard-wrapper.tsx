'use client'

import { Suspense, useEffect } from 'react'
import { Skeleton } from "@/components/ui/skeleton"
import { CompanySelector } from './company-selector'
import { DashboardContent } from './dashboard-content'
import { ErrorBoundary } from '@/components/error-boundary'
import { ErrorFallback } from '@/components/error-fallback'
import { useDashboardStore } from '../store'
import type { Company } from '../components/generate-analysis/types/company'
import type { Database } from '@/types/supabase'

interface DashboardWrapperProps {
  selectedCompany: Company | null
  accountId: string
  initialCompanies: Company[]
}

function LoadingSkeleton() {
  return (
    <div className="flex h-16 items-center px-4">
      <Skeleton className="h-10 w-[200px]" />
    </div>
  )
}

export function DashboardWrapper({ 
  selectedCompany,
  accountId,
  initialCompanies
}: DashboardWrapperProps) {
  const { setSelectedCompanyId, setCompanies } = useDashboardStore()

  useEffect(() => {
    setCompanies(initialCompanies)
  }, [initialCompanies, setCompanies])

  useEffect(() => {
    if (selectedCompany) {
      setSelectedCompanyId(selectedCompany.id)
    }
  }, [selectedCompany, setSelectedCompanyId])

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div className="flex flex-col min-h-screen">
        <div className="border-b">
          <Suspense fallback={<LoadingSkeleton />}>
            <div className="flex h-16 items-center px-4">
              <CompanySelector 
                selectedCompany={selectedCompany}
                companies={initialCompanies}
              />
            </div>
          </Suspense>
        </div>

        <div className="flex-1">
          <Suspense 
            fallback={
              <div className="p-8">
                <Skeleton className="h-[calc(100vh-8rem)]" />
              </div>
            }
          >
            <DashboardContent 
              accountId={accountId}
            />
          </Suspense>
        </div>
      </div>
    </ErrorBoundary>
  )
} 