"use client"

import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useBuyingJourneyStore } from "../store"

interface ErrorBoundaryProps {
  error: Error
  reset: () => void
}

export function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  const { reset: resetStore } = useBuyingJourneyStore()

  const handleReset = () => {
    resetStore()
    reset()
  }

  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription className="mt-2 flex flex-col gap-4">
        <p>
          {error.message || "Something went wrong while loading the dashboard."}
        </p>
        <div className="flex items-center gap-4">
          <Button variant="secondary" onClick={handleReset}>
            Try again
          </Button>
          <Button variant="outline" onClick={resetStore}>
            Reset filters
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
} 