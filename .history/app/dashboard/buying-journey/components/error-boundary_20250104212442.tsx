"use client"

import { Component, ErrorInfo, ReactNode } from "react"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useBuyingJourneyStore } from "../store"

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo)
  }

  private handleReset = () => {
    const store = useBuyingJourneyStore.getState()
    store.reset()
    this.setState({ hasError: false, error: null })
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  public render() {
    if (this.state.hasError) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription>
            <p className="mt-2 text-sm">
              {this.state.error?.message || "An unexpected error occurred"}
            </p>
            <div className="mt-4 flex gap-2">
              <Button variant="secondary" onClick={this.handleRetry}>
                Try again
              </Button>
              <Button variant="outline" onClick={this.handleReset}>
                Reset filters
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )
    }

    return this.props.children
  }
} 