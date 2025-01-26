'use client'

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Check, X, Trash2 } from "lucide-react"
import type { Keyword } from "../../types"

interface KeywordListProps {
  keywords: Keyword[]
  onApprove: (id: string) => void
  onReject: (id: string) => void
  onDelete: (id: string) => void
  isLoading?: boolean
}

export function KeywordList({ 
  keywords, 
  onApprove, 
  onReject, 
  onDelete,
  isLoading 
}: KeywordListProps) {
  if (keywords.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No keywords added yet. Add some keywords to get started.
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {keywords.map((keyword) => (
        <Card key={keyword.id} className="p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="font-medium">{keyword.term}</span>
            <Badge variant={
              keyword.status === 'approved' ? 'default' :
              keyword.status === 'rejected' ? 'destructive' :
              'secondary'
            }>
              {keyword.status}
            </Badge>
            <Badge variant="outline">{keyword.source}</Badge>
          </div>
          
          <div className="flex items-center space-x-2">
            {keyword.status === 'pending' && (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onApprove(keyword.id)}
                  disabled={isLoading}
                >
                  <Check className="h-4 w-4 text-green-500" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onReject(keyword.id)}
                  disabled={isLoading}
                >
                  <X className="h-4 w-4 text-red-500" />
                </Button>
              </>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete(keyword.id)}
              disabled={isLoading}
            >
              <Trash2 className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  )
} 