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

interface DashboardHeaderProps {
  title?: string
}

export function DashboardHeader({ title }: DashboardHeaderProps) {
  const { activeView } = useDashboardStore()
  
  const viewTitle = title || (
    activeView === 'engine' 
      ? 'AI Engine Performance' 
      : activeView === 'journey'
      ? 'Buying Journey Analysis'
      : activeView === 'citation'
      ? 'Citation Analysis'
      : activeView === 'response'
      ? 'Response Analysis'
      : activeView === 'personal'
      ? 'Personal Settings'
      : activeView === 'faqs'
      ? 'FAQs'
      : 'Key Takeaways'
  )

  // Determine the section based on activeView
  const section = 
    activeView === 'response' 
      ? 'Generate'
      : activeView === 'personal' || activeView === 'faqs'
      ? 'System'
      : 'Dashboard'

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem className="hidden md:block">
            <BreadcrumbLink href="/dashboard">{section}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="hidden md:block" />
          <BreadcrumbItem>
            <BreadcrumbPage>{viewTitle}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  )
} 