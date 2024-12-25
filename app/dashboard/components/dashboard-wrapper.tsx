import { Suspense } from 'react'
import { Skeleton } from "@/components/ui/skeleton"
import { CompanySelectorWrapper } from './company-selector-wrapper'
import { DashboardContent } from './dashboard-content'
import { ClientWrapper } from './client-wrapper'

interface Company {
  id: number
  name: string
  industry: string | null
}

interface DashboardWrapperProps {
  selectedCompany: Company | null
}

function LoadingSkeleton() {
  return (
    <div className="flex h-16 items-center px-4">
      <Skeleton className="h-10 w-[200px]" />
    </div>
  )
}

export function DashboardWrapper({ 
  selectedCompany
}: DashboardWrapperProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="border-b">
        <Suspense fallback={<LoadingSkeleton />}>
          <ClientWrapper>
            <div className="flex h-16 items-center px-4">
              <CompanySelectorWrapper selectedCompany={selectedCompany} />
            </div>
          </ClientWrapper>
        </Suspense>
      </div>

      <Suspense 
        fallback={
          <div className="p-8">
            <Skeleton className="h-[calc(100vh-8rem)]" />
          </div>
        }
      >
        <ClientWrapper>
          <DashboardContent 
            selectedCompany={selectedCompany}
          />
        </ClientWrapper>
      </Suspense>
    </div>
  )
} 