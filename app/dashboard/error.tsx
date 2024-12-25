'use client'

import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex h-screen items-center justify-center p-4">
      <div className="max-w-md text-center">
        <h2 className="mb-4 text-lg font-semibold">Something went wrong!</h2>
        <p className="mb-4 text-muted-foreground">
          {error.message || 'An unexpected error occurred. Please try again.'}
        </p>
        <div className="flex justify-center gap-4">
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
          >
            Refresh Page
          </Button>
          <Button
            onClick={() => reset()}
            variant="default"
          >
            Try Again
          </Button>
        </div>
      </div>
    </div>
  )
} 