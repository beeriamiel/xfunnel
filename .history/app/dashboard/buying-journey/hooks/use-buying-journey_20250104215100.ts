import { useQuery } from "@tanstack/react-query"
import { useBuyingJourneyStore } from "../store"
import { SelectionCard, Metrics, ChartData } from "../types"
import { useMemo } from "react"

async function fetchData(params: Record<string, string>) {
  const searchParams = new URLSearchParams(params)
  const response = await fetch(`/api/buying-journey/data?${searchParams.toString()}`)
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

  const { data, isLoading } = useQuery({
    queryKey: ["buying-journey", currentStage, JSON.stringify(params)],
    queryFn: () => fetchData(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  return {
    cards: data?.cards ?? [],
    metrics: data?.metrics,
    trends: data?.trends ?? [],
    isLoading,
  }
} 