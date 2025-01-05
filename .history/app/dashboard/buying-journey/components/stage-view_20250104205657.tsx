"use client"

import { useBuyingJourneyStore } from "../store"
import { CompanyView } from "./views/company-view"
import { RegionView } from "./views/region-view"

export function StageView() {
  const { currentStage } = useBuyingJourneyStore()

  switch (currentStage) {
    case "company":
      return <CompanyView />
    case "region":
      return <RegionView />
    // Other views will be added here
    default:
      return (
        <div className="flex items-center justify-center h-[200px] text-muted-foreground">
          View not implemented yet
        </div>
      )
  }
} 