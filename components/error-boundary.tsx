'use client'

import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  FallbackComponent: React.ComponentType<{ error: Error }>
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  }

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    }
  }

  public render() {
    const { hasError, error } = this.state
    const { FallbackComponent, children } = this.props

    if (hasError && error) {
      return <FallbackComponent error={error} />
    }

    return children
  }
} 