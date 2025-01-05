"use client"

import { Component, ErrorInfo, ReactNode } from "react"
import { ErrorBoundary } from "./error-boundary"

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

export class ErrorBoundaryWrapper extends Component<Props, State> {
  public state: State = {
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo)
  }

  public render() {
    if (this.state.error) {
      return (
        <ErrorBoundary
          error={this.state.error}
          reset={() => this.setState({ error: null })}
        />
      )
    }

    return this.props.children
  }
} 