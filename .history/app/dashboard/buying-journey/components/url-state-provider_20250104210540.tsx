"use client"

import { useUrlState } from "../hooks/use-url-state"

interface UrlStateProviderProps {
  children: React.ReactNode
}

export function UrlStateProvider({ children }: UrlStateProviderProps) {
  useUrlState()
  return <>{children}</>
} 