import { useQuery } from "@tanstack/react-query"
import { useBuyingJourneyStore } from "../store"
import { SelectionCard, Metrics, ChartData } from "../types"

async function fetchCards(stage: string, params: URLSearchParams) {
  const response = await fetch(`/api/buying-journey/cards?stage=${stage}&${params.toString()}`)
  if (!response.ok) throw new Error("Failed to fetch cards")
  return response.json() as Promise<SelectionCard[]>
}

async function fetchMetrics(params: URLSearchParams) {
  const response = await fetch(`/api/buying-journey/metrics?${params.toString()}`)
  if (!response.ok) throw new Error("Failed to fetch metrics")
  return response.json() as Promise<Metrics>
}

async function fetchTrends(params: URLSearchParams) {
  const response = await fetch(`/api/buying-journey/trends?${params.toString()}`)
  if (!response.ok) throw new Error("Failed to fetch trends")
  return response.json() as Promise<ChartData[]>
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
    setLoading,
  } = useBuyingJourneyStore()

  const params = new URLSearchParams()
  if (selectedRegion) params.append("region", selectedRegion)
  if (selectedVertical) params.append("vertical", selectedVertical)
  if (selectedPersona) params.append("persona", selectedPersona)
  if (selectedQuery) params.append("query", selectedQuery)
  if (sortBy) params.append("sortBy", sortBy)
  if (timeFrame) params.append("timeFrame", timeFrame)

  const { data: cards, isLoading: isLoadingCards } = useQuery({
    queryKey: ["buying-journey", "cards", currentStage, params.toString()],
    queryFn: () => fetchCards(currentStage, params),
  })

  const { data: metrics, isLoading: isLoadingMetrics } = useQuery({
    queryKey: ["buying-journey", "metrics", params.toString()],
    queryFn: () => fetchMetrics(params),
  })

  const { data: trends, isLoading: isLoadingTrends } = useQuery({
    queryKey: ["buying-journey", "trends", params.toString()],
    queryFn: () => fetchTrends(params),
  })

  // Update global loading state
  setLoading(isLoadingCards || isLoadingMetrics || isLoadingTrends)

  return {
    cards,
    metrics,
    trends,
    isLoading: isLoadingCards || isLoadingMetrics || isLoadingTrends,
  }
} 