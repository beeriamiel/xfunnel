'use client'

import { MessageSquare, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import type { Query } from '../../types/analysis'
import { motion, AnimatePresence } from "framer-motion"
import { useQueryStore } from '../../store/query-store'
import { QueryRow } from './query-row'
import { useState, useEffect } from 'react'

interface QuerySectionProps {
  queries: Query[];
  onGenerateResponse?: (queryId: string) => Promise<void>;
}

export function QuerySection({ queries, onGenerateResponse }: QuerySectionProps) {
  const [expandedQueryId, setExpandedQueryId] = useState<string | null>(null)
  const initializeQuery = useQueryStore(state => state.initializeQuery)

  useEffect(() => {
    queries.forEach(query => {
      if (query.id) {
        initializeQuery(query.id, {
          availableActions: ['generate_response', 'view_responses'],
          status: 'idle',
          isLoading: false,
          error: null
        })
      }
    })
  }, [queries, initializeQuery])

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {queries.map((query) => (
          query?.id ? (
            <motion.div
              key={query.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <QueryRow
                query={query}
                isExpanded={expandedQueryId === query.id}
                onToggle={() => setExpandedQueryId(
                  expandedQueryId === query.id ? null : query.id
                )}
                onGenerateResponse={onGenerateResponse}
              />
            </motion.div>
          ) : null
        ))}
      </AnimatePresence>
    </div>
  )
} 