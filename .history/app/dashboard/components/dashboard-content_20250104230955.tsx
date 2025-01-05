'use client'

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useDashboardStore } from "../store"
import { EngineMetricsChart } from "./engine-metrics-chart"
import { BuyingJourneyAnalysis } from "./buying-journey-analysis"

export function DashboardContent() {
  const router = useRouter()
  const activeView = useDashboardStore(state => state.activeView)
  const selectedCompanyId = useDashboardStore(state => state.selectedCompanyId)

  // Handle routing for new buying journey
  useEffect(() => {
    if (activeView === 'new-journey' && selectedCompanyId) {
      // Use replace instead of push to avoid browser history stack
      router.replace(`/dashboard/buying-journey?companyId=${selectedCompanyId}`)
    }
  }, [activeView, selectedCompanyId, router])

  // Don't render anything while redirecting or if no company selected
  if (activeView === 'new-journey' || !selectedCompanyId) {
    return null
  }

  // Render appropriate view
  return (
    <div className="space-y-8">
      {activeView === 'engine-metrics' && (
        <EngineMetricsChart companyId={selectedCompanyId} />
      )}
      {activeView === 'buying-journey' && (
        <BuyingJourneyAnalysis companyId={selectedCompanyId} />
      )}
    </div>
  )
}

function ViewSelector({ activeView }: { activeView: string }) {
  switch (activeView) {
    case 'engine':
      return <EngineMetricsChart />;
    case 'journey':
      return <BuyingJourneyAnalysis />;
    case 'citation':
      return <CitationAnalysis />;
    case 'takeaways':
      return <KeyTakeaways />;
    case 'response':
      return <ResponseAnalysis />;
    case 'personal':
      return <PersonalSettings />;
    case 'faqs':
      return <FAQs />;
    default:
      return null;
  }
} 