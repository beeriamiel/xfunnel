import { useQuery } from "@tanstack/react-query"
import { useBuyingJourneyStore } from "../store"
import { SelectionCard, Metrics, ChartData } from "../types"

async function fetchCards(stage: string, params: Record<string, string>) {
  const searchParams = new URLSearchParams(params)
  const response = await fetch(`/api/buying-journey/cards?stage=${stage}&${searchParams.toString()}`)
  if (!response.ok) throw new Error("Failed to fetch cards")
  return response.json() as Promise<SelectionCard[]>
}

async function fetchMetrics(params: Record<string, string>) {
  const searchParams = new URLSearchParams(params)
  const response = await fetch(`/api/buying-journey/metrics?${searchParams.toString()}`)
  if (!response.ok) throw new Error("Failed to fetch metrics")
  return response.json() as Promise<Metrics>
}

async function fetchTrends(params: Record<string, string>) {
  const searchParams = new URLSearchParams(params)
  const response = await fetch(`/api/buying-journey/trends?${searchParams.toString()}`)
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

  const params: Record<string, string> = {}
  if (selectedRegion) params.region = selectedRegion
  if (selectedVertical) params.vertical = selectedVertical
  if (selectedPersona) params.persona = selectedPersona
  if (selectedQuery) params.query = selectedQuery
  if (sortBy) params.sortBy = sortBy
  if (timeFrame) params.timeFrame = timeFrame

  const { data: cards, isLoading: isLoadingCards } = useQuery({
    queryKey: ["buying-journey", "cards", currentStage, JSON.stringify(params)],
    queryFn: () => fetchCards(currentStage, params),
  })

  const { data: metrics, isLoading: isLoadingMetrics } = useQuery({
    queryKey: ["buying-journey", "metrics", JSON.stringify(params)],
    queryFn: () => fetchMetrics(params),
  })

  const { data: trends, isLoading: isLoadingTrends } = useQuery({
    queryKey: ["buying-journey", "trends", JSON.stringify(params)],
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