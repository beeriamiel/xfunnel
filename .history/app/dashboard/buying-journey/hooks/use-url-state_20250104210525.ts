import { useCallback, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useRouter } from "next/navigation"
import { Stage, SortOption, TimeFrame } from "../types"
import { useBuyingJourneyStore } from "../store"

export function useUrlState() {
  const router = useRouter()
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

  // Update URL when state changes
  const updateUrl = useCallback(() => {
    const params = new URLSearchParams()

    // Add parameters only if they have values
    if (currentStage !== "company") {
      params.set("stage", currentStage)
    }
    if (selectedRegion) {
      params.set("region", selectedRegion)
    }
    if (selectedVertical) {
      params.set("vertical", selectedVertical)
    }
    if (selectedPersona) {
      params.set("persona", selectedPersona)
    }
    if (selectedQuery) {
      params.set("query", selectedQuery)
    }
    if (sortBy !== "batch") {
      params.set("sort", sortBy)
    }
    if (timeFrame !== "week") {
      params.set("time", timeFrame)
    }

    const queryString = params.toString()
    const url = queryString ? `?${queryString}` : ""
    router.replace(url)
  }, [
    router,
    currentStage,
    selectedRegion,
    selectedVertical,
    selectedPersona,
    selectedQuery,
    sortBy,
    timeFrame,
  ])

  // Update state from URL on mount and URL changes
  useEffect(() => {
    const stage = searchParams.get("stage") as Stage | null
    const region = searchParams.get("region")
    const vertical = searchParams.get("vertical")
    const persona = searchParams.get("persona")
    const query = searchParams.get("query")
    const sort = searchParams.get("sort") as SortOption | null
    const time = searchParams.get("time") as TimeFrame | null

    if (stage) {
      setStage(stage)
    }
    if (region) {
      setSelection("company", region)
    }
    if (vertical) {
      setSelection("region", vertical)
    }
    if (persona) {
      setSelection("vertical", persona)
    }
    if (query) {
      setSelection("persona", query)
    }
    if (sort) {
      setSortBy(sort)
    }
    if (time) {
      setTimeFrame(time)
    }
  }, [searchParams, setStage, setSelection, setSortBy, setTimeFrame])

  // Update URL when state changes
  useEffect(() => {
    updateUrl()
  }, [
    currentStage,
    selectedRegion,
    selectedVertical,
    selectedPersona,
    selectedQuery,
    sortBy,
    timeFrame,
    updateUrl,
  ])
} 