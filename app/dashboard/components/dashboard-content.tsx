'use client'

import { Suspense } from 'react'
import { AppSidebar } from "@/components/app-sidebar"
import { DashboardHeader } from './dashboard-header'
import { Skeleton } from "@/components/ui/skeleton"
import { Card } from '@/components/ui/card'
import { EngineMetricsChart } from './engine-metrics-chart'
import { SidebarProvider } from "@/components/ui/sidebar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BuyingJourneyAnalysis } from './buying-journey-analysis'
import { useDashboardStore } from '../store'

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
          {activeView === 'engine' ? (
            <EngineMetricsChart companyId={selectedCompany.id} />
          ) : (
            <BuyingJourneyAnalysis companyId={selectedCompany.id} />
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
            title={activeView === 'engine' ? 'AI Engine Performance' : 'Buying Journey Analysis'}
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