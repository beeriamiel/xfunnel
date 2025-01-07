'use client'

import { ChangeEvent, KeyboardEvent } from 'react'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { Query } from '../../types/analysis'

interface QuerySectionProps {
  queries: Query[];
  onAddQuery: (text: string) => void;
  newQuery: string;
  onNewQueryChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

export function QuerySection({ 
  queries, 
  onAddQuery, 
  newQuery,
  onNewQueryChange 
}: QuerySectionProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newQuery.trim()) {
      onAddQuery(newQuery)
    }
  }

  return (
    <div className="py-4 px-6 bg-[#f6efff]/50 space-y-4">
      <ScrollArea className="h-[200px] rounded-md border border-[#f9a8c9]/20 bg-white">
        <div className="p-4 space-y-3">
          {queries.map((query) => (
            <div 
              key={query.id}
              className="p-3 rounded-lg bg-white border border-[#f9a8c9]/20 hover:border-[#f9a8c9]/40 hover:bg-[#f6efff]/30 transition-all duration-200"
            >
              <p className="text-sm text-[#30035e]">{query.text}</p>
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="flex gap-2">
        <Input
          placeholder="Add a new query..."
          value={newQuery}
          onChange={onNewQueryChange}
          className="flex-1 focus-visible:ring-[#30035e]"
          onKeyDown={handleKeyDown}
        />
        <Button
          onClick={() => onAddQuery(newQuery)}
          disabled={!newQuery.trim()}
          className="bg-[#30035e] hover:bg-[#30035e]/90"
        >
          Add Query
        </Button>
      </div>
    </div>
  )
} 