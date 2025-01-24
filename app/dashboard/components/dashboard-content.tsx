'use client'

import { Suspense, useEffect } from 'react'
import { AppSidebar } from "@/components/app-sidebar"
import { DashboardHeader } from './dashboard-header'
import { Skeleton } from "@/components/ui/skeleton"
import { Card } from '@/components/ui/card'
import { EngineMetricsChart } from './engine-metrics-chart'
import { SidebarProvider } from "@/components/ui/sidebar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CompetitorAnalysis } from './competitor-analysis'
import { CitationAnalysis } from './citation-analysis'
import { KeyTakeaways } from './key-takeaways/key-takeaways'
import { GenerateAnalysis } from '@/app/dashboard/generate-analysis'
import { FAQs } from './faqs'
import { useDashboardStore } from '../store'
import { NewICPAnalysis } from "./new-icp-analysis"
import { PersonalSettings } from "./personal-settings"
import { Button } from "@/components/ui/button"
import { ErrorBoundary } from '@/components/error-boundary'
import { createClient } from '@/app/supabase/client'

interface Company {
  id: number
  name: string
  industry: string | null
}

function MetricsSkeleton() {
  return (
    <Card className="p-6">
      <div className="h-[400px] animate-pulse bg-muted rounded-lg" />
    </Card>
  )
}

function NoCompanySelected() {
  return (
    <div className="flex h-full items-center justify-center p-8">
      <div className="text-center">
        <h2 className="text-2xl font-semibold tracking-tight">No Company Selected</h2>
        <p className="text-muted-foreground mt-2">Please select a company to view the dashboard</p>
      </div>
    </div>
  )
}

function ErrorState({ error }: { error: string }) {
  return (
    <Alert variant="destructive" className="m-4">
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  )
}

function DashboardView({ 
  selectedCompany,
  accountId
}: { 
  selectedCompany: Company;
  accountId: string;
}) {
  const { activeView } = useDashboardStore()
  
  useEffect(() => {
    const view = document.querySelector('[data-testid="dashboard-view"]') as HTMLDivElement
    if (view) {
      console.log('DashboardView dimensions:', {
        width: view.clientWidth,
        offsetWidth: view.offsetWidth,
        scrollWidth: view.scrollWidth,
        parentWidth: view.parentElement?.clientWidth
      })
    }
  }, [])

  return (
    <div className="w-full p-8" data-testid="dashboard-view">
      <div className="w-full">
        <Suspense fallback={<MetricsSkeleton />}>
          {activeView === 'response' ? (
            <GenerateAnalysis accountId={accountId} isOnboarding={false} />
          ) : activeView === 'faqs' ? (
            <FAQs accountId={accountId} />
          ) : activeView === 'icp' ? (
            <NewICPAnalysis companyId={selectedCompany.id} accountId={accountId} />
          ) : activeView === 'citation' ? (
            <CitationAnalysis 
              companyId={selectedCompany.id}
              accountId={accountId}
            />
          ) : activeView === 'takeaways' ? (
            <KeyTakeaways 
              companyId={selectedCompany.id}
              accountId={accountId}
            />
          ) : activeView === 'personal' ? (
            <PersonalSettings accountId={accountId} />
          ) : (
            <>
              <EngineMetricsChart 
                companyId={selectedCompany.id}
                accountId={accountId}
              />
              <CompetitorAnalysis 
                companyId={selectedCompany.id}
                accountId={accountId}
              />
            </>
          )}
        </Suspense>
      </div>
    </div>
  )
}

export function DashboardError() {
  return (
    <div className="flex items-center justify-center p-6">
      <div className="text-center">
        <h2 className="text-lg font-semibold">Something went wrong</h2>
        <Button onClick={() => window.location.reload()}>
          Try again
        </Button>
      </div>
    </div>
  )
}

export function DashboardContent({ accountId }: { accountId: string }) {
  const { activeView, selectedCompanyId, companies } = useDashboardStore()
  const selectedCompany = companies.find(c => c.id === selectedCompanyId)

  useEffect(() => {
    const containers = {
      root: document.querySelector('[data-testid="dashboard-root"]') as HTMLDivElement | null,
      sidebarWrapper: document.querySelector('[data-testid="sidebar-wrapper"]') as HTMLDivElement | null,
      contentWrapper: document.querySelector('[data-testid="content-wrapper"]') as HTMLDivElement | null,
      main: document.querySelector('main') as HTMLElement | null,
      mainContent: document.querySelector('[data-testid="main-content"]') as HTMLDivElement | null
    }

    // Only log if we have all containers
    if (containers.root && containers.contentWrapper && containers.main && containers.mainContent) {
      console.log('Layout dimensions:', {
        window: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        root: {
          width: containers.root.clientWidth,
          offsetWidth: containers.root.offsetWidth,
          scrollWidth: containers.root.scrollWidth
        },
        contentWrapper: {
          width: containers.contentWrapper.clientWidth,
          offsetWidth: containers.contentWrapper.offsetWidth,
          scrollWidth: containers.contentWrapper.scrollWidth
        },
        main: {
          width: containers.main.clientWidth,
          offsetWidth: containers.main.offsetWidth,
          scrollWidth: containers.main.scrollWidth
        },
        mainContent: {
          width: containers.mainContent.clientWidth,
          offsetWidth: containers.mainContent.offsetWidth,
          scrollWidth: containers.mainContent.scrollWidth
        }
      })
    }
  }, [])

  return (
    <SidebarProvider>
      <div className="flex min-h-screen" data-testid="dashboard-root">
        <AppSidebar />
        <div className="flex-1 flex flex-col" data-testid="content-wrapper">
          <ErrorBoundary 
            FallbackComponent={() => <div>Error loading header</div>}
          >
            <DashboardHeader />
          </ErrorBoundary>
          <main className="flex-1">
            <div className="w-full h-full" data-testid="main-content">
              <Suspense fallback={<div className="p-8"><MetricsSkeleton /></div>}>
                {selectedCompany ? (
                  <DashboardView 
                    selectedCompany={selectedCompany} 
                    accountId={accountId}
                  />
                ) : (
                  <NoCompanySelected />
                )}
              </Suspense>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
} 