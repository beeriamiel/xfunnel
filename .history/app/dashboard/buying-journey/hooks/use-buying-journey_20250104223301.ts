import { useQuery } from "@tanstack/react-query"
import { useBuyingJourneyStore } from "../store"
import { useDashboardStore } from "../../store"
import { SelectionCard, Metrics, ChartData } from "../types"
import { useMemo, useEffect } from "react"

interface ApiResponse {
  cards: SelectionCard[]
  metrics: Metrics
  trends: ChartData[]
}

async function fetchData(companyId: number | null, params: Record<string, string>) {
  if (!companyId) throw new Error("No company selected")
  
  const searchParams = new URLSearchParams(params)
  const response = await fetch(`/api/buying-journey/data?companyId=${companyId}&${searchParams.toString()}`)
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "Failed to fetch data")
  }
  return response.json() as Promise<ApiResponse>
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
    setMetrics,
    setLoading,
  } = useBuyingJourneyStore()

  const selectedCompanyId = useDashboardStore(state => state.selectedCompanyId)

  // Memoize params to prevent unnecessary query key changes
  const params = useMemo(() => {
    const p: Record<string, string> = {
      timeFrame: timeFrame,
      sortBy: sortBy,
    }
    if (selectedRegion) p.region = selectedRegion
    if (selectedVertical) p.vertical = selectedVertical
    if (selectedPersona) p.persona = selectedPersona
    if (selectedQuery) p.query = selectedQuery
    return p
  }, [
    selectedRegion,
    selectedVertical,
    selectedPersona,
    selectedQuery,
    sortBy,
    timeFrame,
  ])

  const query = useQuery<ApiResponse, Error>({
    queryKey: ["buying-journey", selectedCompanyId, currentStage, params],
    queryFn: () => fetchData(selectedCompanyId, params),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    enabled: !!selectedCompanyId,
    retry: 1,
  })

  // Handle loading and error states
  useEffect(() => {
    setLoading(query.isLoading)
    if (query.data) {
      setMetrics(query.data.metrics)
    } else if (query.error) {
      setMetrics(null)
    }
  }, [query.isLoading, query.data, query.error, setLoading, setMetrics])

  return {
    cards: query.data?.cards ?? [],
    metrics: query.data?.metrics,
    trends: query.data?.trends ?? [],
    isLoading: query.isLoading,
    error: query.error,
  }
} 