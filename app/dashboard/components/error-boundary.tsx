'use client'

import { useEffect } from 'react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useRouter } from 'next/navigation'
import { FallbackProps } from 'react-error-boundary'
import { DashboardException } from '../errors'

function getErrorMessage(error: Error) {
  if (error instanceof DashboardException) {
    switch (error.code) {
      case 'COMPANY_FETCH_ERROR':
        return 'Failed to load company data. Please try again.'
      case 'METRICS_FETCH_ERROR':
        return 'Failed to load metrics data. Please try again.'
      case 'METRICS_PROCESSING_ERROR':
        return 'Failed to process metrics data. Please try again.'
      default:
        return 'An error occurred while loading the dashboard.'
    }
  }
  return error.message || 'An unexpected error occurred.'
}

export function DashboardError({ error, resetErrorBoundary }: FallbackProps) {
  const router = useRouter()

  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Dashboard error:', error)
  }, [error])

  const handleReset = () => {
    // Clear any error-related state/cache if needed
    resetErrorBoundary()
  }

  const handleResetFilters = () => {
    router.push('/dashboard')
    resetErrorBoundary()
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-4">
      <Alert variant="destructive" className="max-w-md">
        <AlertTitle>Something went wrong!</AlertTitle>
        <AlertDescription>
          {getErrorMessage(error)}
        </AlertDescription>
      </Alert>
      <div className="flex gap-4 mt-4">
        <Button onClick={handleReset} variant="outline">
          Try again
        </Button>
        <Button onClick={handleResetFilters}>
          Reset filters
        </Button>
      </div>
    </div>
  )
} 