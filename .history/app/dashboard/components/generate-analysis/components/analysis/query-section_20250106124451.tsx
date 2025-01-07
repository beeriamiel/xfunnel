'use client'

import { MessageSquare, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import type { Query } from '../../types/analysis'
import { motion, AnimatePresence } from "framer-motion"

interface QuerySectionProps {
  queries: Query[]
  onAddQuery: (text: string) => void
  newQuery: string
  onNewQueryChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function QuerySection({
  queries,
  onAddQuery,
  newQuery,
  onNewQueryChange
}: QuerySectionProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newQuery.trim()) {
      e.preventDefault()
      onAddQuery(newQuery)
    }
  }

  return (
    <div className="p-4 space-y-4 bg-[#f6efff]/50 rounded-lg">
      <AnimatePresence mode="popLayout">
        <div className="space-y-2">
          {queries.map((query, index) => (
            <motion.div
              key={query.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ 
                duration: 0.3,
                delay: index * 0.1, // Stagger effect
                ease: "easeOut"
              }}
              className="flex items-start gap-3 p-3 bg-white rounded-md border group hover:border-[#30035e] transition-colors"
            >
              <MessageSquare className="h-4 w-4 mt-1 text-[#f9a8c9]" />
              <div className="flex-1 space-y-1">
                <p className="text-sm">{query.text}</p>
                <Badge 
                  variant={query.status === 'completed' ? 'default' : 'secondary'}
                  className={query.status === 'completed' ? 'bg-[#30035e]' : ''}
                >
                  {query.status === 'completed' ? 'Completed' : 'Pending Analysis'}
                </Badge>
              </div>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>

      <div className="flex gap-2">
        <Input
          placeholder="Add a custom query..."
          value={newQuery}
          onChange={onNewQueryChange}
          onKeyDown={handleKeyDown}
          className="flex-1"
        />
        <Button
          onClick={() => onAddQuery(newQuery)}
          disabled={!newQuery.trim()}
          className="bg-[#30035e] hover:bg-[#30035e]/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Query
        </Button>
      </div>
    </div>
  )
} 