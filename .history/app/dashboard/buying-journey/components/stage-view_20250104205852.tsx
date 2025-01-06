"use client"

import { useBuyingJourneyStore } from "../store"
import { CompanyView } from "./views/company-view"
import { RegionView } from "./views/region-view"
import { VerticalView } from "./views/vertical-view"
import { PersonaView } from "./views/persona-view"
import { QueryView } from "./views/query-view"

export function StageView() {
  const { currentStage } = useBuyingJourneyStore()

  switch (currentStage) {
    case "company":
      return <CompanyView />
    case "region":
      return <RegionView />
    case "vertical":
      return <VerticalView />
    case "persona":
      return <PersonaView />
    case "query":
      return <QueryView />
    default:
      return (
        <div className="flex items-center justify-center h-[200px] text-muted-foreground">
          View not implemented yet
        </div>
      )
  }
} 