'use client'

import { Suspense, useEffect } from 'react'
import { Skeleton } from "@/components/ui/skeleton"
import { Card } from '@/components/ui/card'
import { EngineMetricsChart } from './engine-metrics-chart'
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
import { OverallCitations } from './source-analysis/overall-citations'
import { AIOverviews } from './ai-overviews'

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
    <div className="h-full py-6" data-testid="dashboard-view">
      <div className="space-y-6">
        <Suspense fallback={<MetricsSkeleton />}>
          {activeView === 'response' ? (
            <GenerateAnalysis accountId={accountId} isOnboarding={false} />
          ) : activeView === 'faqs' ? (
            <FAQs accountId={accountId} />
          ) : activeView === 'icp' ? (
            <NewICPAnalysis companyId={selectedCompany.id} accountId={accountId} />
          ) : activeView === 'citation' ? (
            <>
              <OverallCitations 
                companyId={selectedCompany.id}
                accountId={accountId}
              />
              <CitationAnalysis 
                companyId={selectedCompany.id}
                accountId={accountId}
              />
            </>
          ) : activeView === 'takeaways' ? (
            <KeyTakeaways 
              companyId={selectedCompany.id}
              accountId={accountId}
            />
          ) : activeView === 'personal' ? (
            <PersonalSettings accountId={accountId} />
          ) : activeView === 'ai-overviews' ? (
            <AIOverviews
              companyId={selectedCompany.id}
              accountId={accountId}
            />
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
    console.log('DashboardContent state:', {
      selectedCompanyId,
      companiesCount: companies.length,
      hasSelectedCompany: !!selectedCompany,
      activeView
    })
  }, [selectedCompanyId, companies, selectedCompany, activeView])

  if (!selectedCompany) {
    return <NoCompanySelected />
  }

  return (
    <div className="h-full overflow-hidden" data-testid="main-content">
      <Suspense fallback={<div className="p-4"><MetricsSkeleton /></div>}>
        <DashboardView 
          selectedCompany={selectedCompany} 
          accountId={accountId}
        />
      </Suspense>
    </div>
  )
} 