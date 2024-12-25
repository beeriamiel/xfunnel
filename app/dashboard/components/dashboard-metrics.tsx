import { Suspense } from 'react'
import { Card } from "@/components/ui/card"
import { LoadingOverlay } from './loading-overlay'
import { ErrorMessage } from './error-message'
import { DashboardError } from './error-boundary'
import { EngineMetricsChart } from './engine-metrics-chart'
import { ErrorBoundary } from 'react-error-boundary'

interface DashboardMetricsProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

function MetricsSkeleton() {
  return (
    <Card className="p-6">
      <div className="h-[500px] animate-pulse bg-muted rounded-lg" />
    </Card>
  )
}

export default function DashboardMetrics({
  searchParams,
}: DashboardMetricsProps) {
  const companyId = searchParams.companyId ? Number(searchParams.companyId) : null;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <ErrorBoundary FallbackComponent={DashboardError}>
        <Suspense fallback={<MetricsSkeleton />}>
          <EngineMetricsChart companyId={companyId} />
        </Suspense>
      </ErrorBoundary>
    </div>
  )
} 