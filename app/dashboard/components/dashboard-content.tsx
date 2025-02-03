'use client'

import { Suspense, useEffect, useState } from 'react'
import { Skeleton } from "@/components/ui/skeleton"
import { Card } from '@/components/ui/card'
import { EngineMetricsChart as SearchEngineOverview } from './engine-metrics-chart'
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
import { useSession } from '@/app/providers/session-provider'
import { useSearchParams } from 'next/navigation'
import { getPersonalSettingsData } from '../actions/personal-settings-actions'
import { useCallback } from 'react'

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

function PersonalSettingsWrapper({ accountId }: { accountId: string }) {
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const settingsData = await getPersonalSettingsData(accountId)
        setData(settingsData)
      } catch (err) {
        console.error('Error fetching personal settings:', err)
        setError(err as Error)
      }
    }
    fetchData()
  }, [accountId])

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load personal settings. Please try again later.
        </AlertDescription>
      </Alert>
    )
  }

  if (!data) {
    return <MetricsSkeleton />
  }

  return (
    <PersonalSettings 
      accountId={accountId}
      accountData={data.accountData}
      userData={data.userData}
      companyData={data.companyData}
      responseStats={data.responseStats}
      analysisCoverage={data.analysisCoverage}
    />
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
            <PersonalSettingsWrapper accountId={accountId} />
          ) : activeView === 'ai-overviews' ? (
            <AIOverviews
              companyId={selectedCompany.id}
              accountId={accountId}
            />
          ) : (
            <>
              <SearchEngineOverview 
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
  const { activeView, selectedCompanyId, companies, setIsSuperAdmin } = useDashboardStore()
  const { isSuperAdmin } = useSession()
  const selectedCompany = companies.find(c => c.id === selectedCompanyId)
  const supabase = createClient()
  const searchParams = useSearchParams()
  const urlCompanyId = searchParams.get('company')

  // Set super admin status first
  useEffect(() => {
    setIsSuperAdmin(isSuperAdmin)
  }, [isSuperAdmin, setIsSuperAdmin])

  // Then fetch companies after super admin status is set
  useEffect(() => {
    async function fetchCompanies() {
      let query = supabase.from('companies').select('*')
      
      // If not super admin, filter by account_id
      if (!isSuperAdmin) {
        query = query.eq('account_id', accountId)
      }

      const { data: companiesData, error } = await query
      
      if (error) {
        console.error('Error fetching companies:', error)
        return
      }

      if (companiesData) {
        // Preserve the selected company ID from URL when updating companies
        const currentUrlCompanyId = urlCompanyId ? parseInt(urlCompanyId) : null
        const companyExists = companiesData.some(c => c.id === currentUrlCompanyId)
        
        useDashboardStore.getState().setCompanies(companiesData)
        
        // Only update selectedCompanyId if URL company exists in the fetched data
        if (currentUrlCompanyId && companyExists) {
          useDashboardStore.getState().setSelectedCompanyId(currentUrlCompanyId)
        }
      }
    }

    fetchCompanies()
  }, [accountId, isSuperAdmin, supabase, urlCompanyId])

  useEffect(() => {
    console.log('DashboardContent state:', {
      selectedCompanyId,
      companiesCount: companies.length,
      hasSelectedCompany: !!selectedCompany,
      activeView,
      isSuperAdmin
    })
  }, [selectedCompanyId, companies, selectedCompany, activeView, isSuperAdmin])

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