'use client'

import { Suspense } from 'react'
import { Skeleton } from "@/components/ui/skeleton"
import { CompanySelectorWrapper } from './components/company-selector-wrapper'
import { ClientWrapper } from './components/client-wrapper'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { useDashboardStore } from './store'
import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

interface LayoutProps {
  children: React.ReactNode
}

function LoadingSkeleton() {
  return (
    <div className="flex h-16 items-center px-4">
      <Skeleton className="h-10 w-[200px]" />
    </div>
  )
}

export default function DashboardLayout({ children }: LayoutProps) {
  const searchParams = useSearchParams()
  const setSelectedCompanyId = useDashboardStore(state => state.setSelectedCompanyId)
  
  // Set company ID from URL if provided
  useEffect(() => {
    const companyId = searchParams.get('companyId')
    if (companyId) {
      setSelectedCompanyId(Number(companyId))
    }
  }, [searchParams, setSelectedCompanyId])

  return (
    <ClientWrapper>
      <SidebarProvider>
        <div className="flex min-h-screen">
          <AppSidebar />
          <div className="flex-1 flex flex-col">
            <div className="border-b">
              <Suspense fallback={<LoadingSkeleton />}>
                <div className="flex h-16 items-center px-4">
                  <CompanySelectorWrapper />
                </div>
              </Suspense>
            </div>

            <Suspense 
              fallback={
                <div className="p-8">
                  <Skeleton className="h-[calc(100vh-8rem)]" />
                </div>
              }
            >
              {children}
            </Suspense>
          </div>
        </div>
      </SidebarProvider>
    </ClientWrapper>
  )
} 