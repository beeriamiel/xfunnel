'use client'

import { ChangeEvent, KeyboardEvent } from 'react'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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

  const getStatusColor = (status: Query['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500'
      case 'failed':
        return 'bg-red-500'
      default:
        return 'bg-yellow-500'
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
              <div className="flex items-start justify-between gap-4">
                <p className="text-sm text-[#30035e]">{query.text}</p>
                <Badge variant="secondary" className={`${getStatusColor(query.status)} text-white`}>
                  {query.status}
                </Badge>
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <span>{query.icp.region} • {query.icp.vertical} • {query.icp.company_size}</span>
                <span>→</span>
                <span>{query.persona.title} • {query.persona.department}</span>
              </div>
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