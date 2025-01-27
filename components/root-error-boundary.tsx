'use client'

import { useEffect } from 'react'

interface Props {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function RootErrorBoundary({ children, fallback = <div>Something went wrong</div> }: Props) {
  useEffect(() => {
    window.onerror = (message, source, lineno, colno, error) => {
      console.error('Root Error Boundary caught:', {
        message,
        source,
        lineno,
        colno,
        error
      })
    }
  }, [])

  return (
    <div>
      {children}
    </div>
  )
} 