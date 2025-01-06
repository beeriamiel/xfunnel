"use client"

import { useEffect } from "react"
import { useUrlState } from "../hooks/use-url-state"
import { useBuyingJourneyStore } from "../store"

export function UrlStateProvider({ children }: { children: React.ReactNode }) {
  const { updateUrl, initFromUrl } = useUrlState()
  const {
    currentStage,
    selectedRegion,
    selectedVertical,
    selectedPersona,
    selectedQuery,
    sortBy,
    timeFrame,
  } = useBuyingJourneyStore()

  // Initialize state from URL on mount
  useEffect(() => {
    initFromUrl()
  }, [initFromUrl])

  // Update URL when state changes
  useEffect(() => {
    updateUrl()
  }, [
    updateUrl,
    currentStage,
    selectedRegion,
    selectedVertical,
    selectedPersona,
    selectedQuery,
    sortBy,
    timeFrame,
  ])

  return <>{children}</>
} 