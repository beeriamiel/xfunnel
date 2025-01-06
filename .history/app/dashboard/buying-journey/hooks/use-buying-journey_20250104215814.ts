import { useQuery } from "@tanstack/react-query"
import { useBuyingJourneyStore } from "../store"
import { useDashboardStore } from "../../store"
import { SelectionCard, Metrics, ChartData } from "../types"
import { useMemo } from "react"

async function fetchData(companyId: number | null, params: Record<string, string>) {
  if (!companyId) throw new Error("No company selected")
  
  const searchParams = new URLSearchParams(params)
  const response = await fetch(`/api/buying-journey/data?companyId=${companyId}&${searchParams.toString()}`)
  if (!response.ok) throw new Error("Failed to fetch data")
  return response.json() as Promise<{
    cards: SelectionCard[]
    metrics: Metrics
    trends: ChartData[]
  }>
}

export function useBuyingJourney() {
  const {
    currentStage,
    selectedRegion,
    selectedVertical,
    selectedPersona,
    selectedQuery,
    sortBy,
    timeFrame,
  } = useBuyingJourneyStore()

  const selectedCompanyId = useDashboardStore(state => state.selectedCompanyId)

  // Memoize params to prevent unnecessary query key changes
  const params = useMemo(() => {
    const p: Record<string, string> = {}
    if (selectedRegion) p.region = selectedRegion
    if (selectedVertical) p.vertical = selectedVertical
    if (selectedPersona) p.persona = selectedPersona
    if (selectedQuery) p.query = selectedQuery
    if (sortBy) p.sortBy = sortBy
    if (timeFrame) p.timeFrame = timeFrame
    return p
  }, [
    selectedRegion,
    selectedVertical,
    selectedPersona,
    selectedQuery,
    sortBy,
    timeFrame,
  ])

  const { data, isLoading, error } = useQuery({
    queryKey: ["buying-journey", selectedCompanyId, currentStage, JSON.stringify(params)],
    queryFn: () => fetchData(selectedCompanyId, params),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!selectedCompanyId, // Only fetch if we have a company ID
  })

  return {
    cards: data?.cards ?? [],
    metrics: data?.metrics,
    trends: data?.trends ?? [],
    isLoading,
    error,
  }
} 