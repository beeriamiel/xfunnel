'use client'

import { MessageSquare, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import type { Query } from '../../types/analysis'
import { motion, AnimatePresence } from "framer-motion"
import { useQueryStore } from '../../store/queryStore'
import { QueryRow } from './query-row'
import { useState, useEffect } from 'react'

interface QuerySectionProps {
  queries: Query[]
  onAddQuery: (text: string) => void
  newQuery: string
  onNewQueryChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function QuerySection({ queries }: { queries: Query[] }) {
  const [expandedQueryId, setExpandedQueryId] = useState<string | null>(null)

  // Initialize all queries on mount
  useEffect(() => {
    queries.forEach(query => {
      if (query.id) {
        useQueryStore.getState().initializeQuery(query.id, {
          availableActions: ['generate_queries', 'view_queries'],
          status: 'idle',
          isLoading: false,
          error: null
        })
      }
    })
  }, [queries])

  return (
    <div className="space-y-4">
      {queries.map((query) => (
        query?.id ? (
          <QueryRow
            key={query.id}
            query={query}
            isExpanded={expandedQueryId === query.id}
            onToggle={() => setExpandedQueryId(
              expandedQueryId === query.id ? null : query.id
            )}
          />
        ) : null
      ))}
    </div>
  )
} 