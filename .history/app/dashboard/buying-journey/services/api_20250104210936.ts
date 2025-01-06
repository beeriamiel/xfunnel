import { Stage, Metrics, SelectionCard, ChartData } from "../types"

interface FetchMetricsParams {
  stage: Stage
  region?: string
  vertical?: string
  persona?: string
  query?: string
  sortBy: "batch" | "time"
  timeFrame: "week" | "month"
}

interface FetchCardsParams {
  stage: Stage
  region?: string
  vertical?: string
  persona?: string
  sortBy: "batch" | "time"
  timeFrame: "week" | "month"
}

interface FetchTrendsParams {
  stage: Stage
  region?: string
  vertical?: string
  persona?: string
  query?: string
  sortBy: "batch" | "time"
  timeFrame: "week" | "month"
  metric: "mentions" | "sentiment"
}

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 5000) {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })
    clearTimeout(id)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  } catch (error) {
    clearTimeout(id)
    throw error
  }
}

export async function fetchMetrics(params: FetchMetricsParams): Promise<Metrics> {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value) searchParams.set(key, value)
  })

  return fetchWithTimeout(`/api/buying-journey/metrics?${searchParams.toString()}`)
}

export async function fetchCards(params: FetchCardsParams): Promise<SelectionCard[]> {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value) searchParams.set(key, value)
  })

  return fetchWithTimeout(`/api/buying-journey/cards?${searchParams.toString()}`)
}

export async function fetchTrends(params: FetchTrendsParams): Promise<ChartData[]> {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value) searchParams.set(key, value)
  })

  return fetchWithTimeout(`/api/buying-journey/trends?${searchParams.toString()}`)
} 