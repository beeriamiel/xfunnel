'use client'

import { Suspense } from 'react'
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
import { GenerateAnalysis } from './generate-analysis'
import { FAQs } from './faqs'
import { useDashboardStore } from '../store'
import { NewICPAnalysis } from "./new-icp-analysis"
import { PersonalSettings } from "./personal-settings"

interface Company {
  id: number
  name: string
  industry: string | null
}

interface Props {
  selectedCompany: Company | null;
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

function DashboardView({ selectedCompany }: { selectedCompany: Company }) {
  const { activeView } = useDashboardStore()
  
  return (
    <div className="space-y-4 p-8">
      <div className="grid gap-4">
        <Suspense fallback={<MetricsSkeleton />}>
          {activeView === 'response' ? (
            <GenerateAnalysis />
          ) : activeView === 'faqs' ? (
            <FAQs />
          ) : activeView === 'icp' ? (
            <NewICPAnalysis companyId={selectedCompany.id} />
          ) : activeView === 'citation' ? (
            <CitationAnalysis companyId={selectedCompany.id} />
          ) : activeView === 'takeaways' ? (
            <KeyTakeaways companyId={selectedCompany.id} />
          ) : activeView === 'personal' ? (
            <PersonalSettings />
          ) : (
            <>
              <EngineMetricsChart companyId={selectedCompany.id} />
              <CompetitorAnalysis companyId={selectedCompany.id} />
            </>
          )}
        </Suspense>
      </div>
    </div>
  )
}

export function DashboardContent({ selectedCompany }: Props) {
  const { activeView } = useDashboardStore()
  
  return (
    <SidebarProvider>
      <div className="flex flex-1">
        <AppSidebar />
        <div className="flex-1">
          <DashboardHeader 
            title={
              !selectedCompany
                ? 'Select Company'
                : activeView === 'engine'
                ? 'AI Engine Performance'
                : activeView === 'icp'
                ? 'ICP Analysis'
                : activeView === 'citation'
                ? 'Citation Analysis'
                : activeView === 'takeaways'
                ? 'Key Takeaways'
                : activeView === 'response'
                ? 'Generate Analysis'
                : activeView === 'personal'
                ? 'Personal Settings'
                : activeView === 'faqs'
                ? 'FAQs'
                : 'Dashboard'
            }
          />
          <Suspense fallback={<div className="p-8"><MetricsSkeleton /></div>}>
            {selectedCompany ? (
              <DashboardView selectedCompany={selectedCompany} />
            ) : (
              <NoCompanySelected />
            )}
          </Suspense>
        </div>
      </div>
    </SidebarProvider>
  )
} 