'use client'

import { ErrorBoundary } from 'react-error-boundary'
import { DashboardError } from './error-boundary'

interface ClientWrapperProps {
  children: React.ReactNode
}

export function ClientWrapper({ children }: ClientWrapperProps) {
  const handleError = (error: Error) => {
    // Log to error reporting service
    console.error('Dashboard error:', error)
  }

  return (
    <ErrorBoundary 
      FallbackComponent={DashboardError}
      onError={handleError}
      onReset={() => {
        // Additional reset logic if needed
      }}
    >
      {children}
    </ErrorBoundary>
  )
} 