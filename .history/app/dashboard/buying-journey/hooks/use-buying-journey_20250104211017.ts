import { useQuery } from "@tanstack/react-query"
import { useBuyingJourneyStore } from "../store"
import { fetchMetrics, fetchCards, fetchTrends } from "../services/api"

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

  // Fetch metrics
  const metricsQuery = useQuery({
    queryKey: [
      "metrics",
      currentStage,
      selectedRegion,
      selectedVertical,
      selectedPersona,
      selectedQuery,
      sortBy,
      timeFrame,
    ],
    queryFn: () =>
      fetchMetrics({
        stage: currentStage,
        region: selectedRegion || undefined,
        vertical: selectedVertical || undefined,
        persona: selectedPersona || undefined,
        query: selectedQuery || undefined,
        sortBy,
        timeFrame,
      }),
  })

  // Fetch cards for the current stage
  const cardsQuery = useQuery({
    queryKey: [
      "cards",
      currentStage,
      selectedRegion,
      selectedVertical,
      selectedPersona,
      sortBy,
      timeFrame,
    ],
    queryFn: () =>
      fetchCards({
        stage: currentStage,
        region: selectedRegion || undefined,
        vertical: selectedVertical || undefined,
        persona: selectedPersona || undefined,
        sortBy,
        timeFrame,
      }),
  })

  // Fetch trend data for mentions
  const mentionsTrendQuery = useQuery({
    queryKey: [
      "trends",
      "mentions",
      currentStage,
      selectedRegion,
      selectedVertical,
      selectedPersona,
      selectedQuery,
      sortBy,
      timeFrame,
    ],
    queryFn: () =>
      fetchTrends({
        stage: currentStage,
        region: selectedRegion || undefined,
        vertical: selectedVertical || undefined,
        persona: selectedPersona || undefined,
        query: selectedQuery || undefined,
        sortBy,
        timeFrame,
        metric: "mentions",
      }),
  })

  // Fetch trend data for sentiment
  const sentimentTrendQuery = useQuery({
    queryKey: [
      "trends",
      "sentiment",
      currentStage,
      selectedRegion,
      selectedVertical,
      selectedPersona,
      selectedQuery,
      sortBy,
      timeFrame,
    ],
    queryFn: () =>
      fetchTrends({
        stage: currentStage,
        region: selectedRegion || undefined,
        vertical: selectedVertical || undefined,
        persona: selectedPersona || undefined,
        query: selectedQuery || undefined,
        sortBy,
        timeFrame,
        metric: "sentiment",
      }),
  })

  // Update global loading state
  const isLoading =
    metricsQuery.isLoading ||
    cardsQuery.isLoading ||
    mentionsTrendQuery.isLoading ||
    sentimentTrendQuery.isLoading

  // Update global metrics state
  if (metricsQuery.data && !metricsQuery.isLoading) {
    setMetrics(metricsQuery.data)
  }

  // Update global loading state
  setLoading(isLoading)

  return {
    metrics: metricsQuery.data,
    cards: cardsQuery.data,
    trends: {
      mentions: mentionsTrendQuery.data,
      sentiment: sentimentTrendQuery.data,
    },
    isLoading,
    isError:
      metricsQuery.isError ||
      cardsQuery.isError ||
      mentionsTrendQuery.isError ||
      sentimentTrendQuery.isError,
    error:
      metricsQuery.error ||
      cardsQuery.error ||
      mentionsTrendQuery.error ||
      sentimentTrendQuery.error,
  }
} 