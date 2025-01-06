'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardHeader } from './dashboard-header'
import { Skeleton } from "@/components/ui/skeleton"
import { Card } from '@/components/ui/card'
import { EngineMetricsChart } from './engine-metrics-chart'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BuyingJourneyAnalysis } from './buying-journey-analysis'
import { CompetitorAnalysis } from './competitor-analysis'
import { CitationAnalysis } from './citation-analysis'
import { KeyTakeaways } from './key-takeaways/key-takeaways'
import { ResponseAnalysis } from './response-analysis'
import { PersonalSettings } from './personal-settings'
import { FAQs } from './faqs'
import { useDashboardStore } from '../store'
import { createClient } from '@/app/supabase/server'

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
    <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
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

function DashboardView({ company }: { company: Company }) {
  const { activeView } = useDashboardStore()
  const router = useRouter()
  
  useEffect(() => {
    if (activeView === 'new-journey') {
      router.push(`/dashboard/buying-journey?companyId=${company.id}`)
    }
  }, [activeView, router, company.id])

  if (activeView === 'new-journey') {
    return null // Don't render anything while redirecting
  }
  
  return (
    <div className="space-y-4 p-8">
      <div className="grid gap-4">
        <Suspense fallback={<MetricsSkeleton />}>
          {activeView === 'engine' ? (
            <>
              <EngineMetricsChart companyId={company.id} />
              <CompetitorAnalysis companyId={company.id} />
            </>
          ) : activeView === 'journey' ? (
            <BuyingJourneyAnalysis companyId={company.id} />
          ) : activeView === 'citation' ? (
            <CitationAnalysis companyId={company.id} />
          ) : activeView === 'takeaways' ? (
            <KeyTakeaways companyId={company.id} />
          ) : activeView === 'response' ? (
            <ResponseAnalysis companyId={company.id} />
          ) : activeView === 'personal' ? (
            <PersonalSettings />
          ) : (
            <FAQs />
          )}
        </Suspense>
      </div>
    </div>
  )
}

export function DashboardContent() {
  const { activeView, selectedCompanyId } = useDashboardStore()
  const [company, setCompany] = useState<Company | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchCompany() {
      if (!selectedCompanyId) {
        setCompany(null)
        setIsLoading(false)
        return
      }

      try {
        const supabase = await createClient()
        const { data, error } = await supabase
          .from('companies')
          .select('id, name, industry')
          .eq('id', selectedCompanyId)
          .single()

        if (error) throw error
        setCompany(data)
      } catch (error) {
        console.error('Error fetching company:', error)
        setCompany(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCompany()
  }, [selectedCompanyId])

  if (isLoading) {
    return <div className="p-8"><MetricsSkeleton /></div>
  }
  
  return (
    <div className="flex-1">
      <DashboardHeader 
        title={
          !company
            ? 'Select Company'
            : activeView === 'engine'
            ? 'AI Engine Performance'
            : activeView === 'journey'
            ? 'Buying Journey Analysis'
            : activeView === 'citation'
            ? 'Citation Analysis'
            : activeView === 'takeaways'
            ? 'Key Takeaways'
            : activeView === 'response'
            ? 'Response Analysis'
            : activeView === 'personal'
            ? 'Personal Settings'
            : 'FAQs'
        }
      />
      <Suspense fallback={<div className="p-8"><MetricsSkeleton /></div>}>
        {company ? (
          <DashboardView company={company} />
        ) : (
          <NoCompanySelected />
        )}
      </Suspense>
    </div>
  )
} 