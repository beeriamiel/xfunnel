'use client'

import { Suspense } from 'react'
import { Skeleton } from "@/components/ui/skeleton"
import { CompanySelectorWrapper } from './components/company-selector-wrapper'
import { ClientWrapper } from './components/client-wrapper'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { createClient } from '@/app/supabase/server'
import { unstable_noStore as noStore } from 'next/cache'

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

async function getCompanyData() {
  noStore()
  const supabase = await createClient()
  
  // Get companies for the selector
  const { data: companies } = await supabase
    .from('companies')
    .select('id, name, industry')
    .order('name')

  return companies || []
}

export default async function DashboardLayout({ children }: LayoutProps) {
  const companies = await getCompanyData()

  return (
    <ClientWrapper>
      <SidebarProvider>
        <div className="flex min-h-screen">
          <AppSidebar />
          <div className="flex-1 flex flex-col">
            <div className="border-b">
              <Suspense fallback={<LoadingSkeleton />}>
                <div className="flex h-16 items-center px-4">
                  <CompanySelectorWrapper companies={companies} />
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