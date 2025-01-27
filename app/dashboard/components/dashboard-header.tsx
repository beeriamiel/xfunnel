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
import type { Company } from '../generate-analysis/types/company'

interface DashboardHeaderProps {
  title?: string
}

export function DashboardHeader({ title }: DashboardHeaderProps) {
  const { activeView, isSuperAdmin, companies, selectedCompanyId } = useDashboardStore()
  const selectedCompany = companies.find(c => c.id === selectedCompanyId) || null
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
        {isSuperAdmin && (
          <CompanySelector selectedCompany={selectedCompany} companies={companies} />
        )}
        <AuthButton />
      </div>
    </header>
  )
} 