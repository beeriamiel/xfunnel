import { useSearchParams } from "next/navigation"
import { useCallback } from "react"
import { Stage, SortOption, TimeFrame } from "../types"
import { useBuyingJourneyStore } from "../store"

export function useUrlState() {
  const searchParams = useSearchParams()
  const {
    currentStage,
    selectedRegion,
    selectedVertical,
    selectedPersona,
    selectedQuery,
    sortBy,
    timeFrame,
    setStage,
    setSelection,
    setSortBy,
    setTimeFrame,
  } = useBuyingJourneyStore()

  const updateUrl = useCallback(() => {
    const params = new URLSearchParams()
    
    // Add current selections to URL
    params.set("stage", currentStage)
    if (selectedRegion) params.set("region", selectedRegion)
    if (selectedVertical) params.set("vertical", selectedVertical)
    if (selectedPersona) params.set("persona", selectedPersona)
    if (selectedQuery) params.set("query", selectedQuery)
    if (sortBy) params.set("sortBy", sortBy)
    if (timeFrame) params.set("timeFrame", timeFrame)

    // Update URL without triggering navigation
    window.history.replaceState(null, "", `?${params.toString()}`)
  }, [
    currentStage,
    selectedRegion,
    selectedVertical,
    selectedPersona,
    selectedQuery,
    sortBy,
    timeFrame,
  ])

  const initFromUrl = useCallback(() => {
    // Set stage from URL
    const stage = searchParams.get("stage") as Stage
    if (stage) setStage(stage)

    // Set selections from URL
    const region = searchParams.get("region")
    if (region) setSelection("region", region)

    const vertical = searchParams.get("vertical")
    if (vertical) setSelection("vertical", vertical)

    const persona = searchParams.get("persona")
    if (persona) setSelection("persona", persona)

    const query = searchParams.get("query")
    if (query) setSelection("query", query)

    // Set sort and time frame from URL
    const sort = searchParams.get("sortBy") as SortOption
    if (sort) setSortBy(sort)

    const time = searchParams.get("timeFrame") as TimeFrame
    if (time) setTimeFrame(time)
  }, [searchParams, setStage, setSelection, setSortBy, setTimeFrame])

  return {
    updateUrl,
    initFromUrl,
  }
} 