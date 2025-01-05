"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { SelectionCard } from "../types"
import { MetricsDisplay } from "./metrics-display"

interface SelectionCardsProps {
  cards: SelectionCard[]
  onSelect: (id: string) => void
  selectedId?: string | null
  isLoading?: boolean
  className?: string
}

export function SelectionCards({
  cards,
  onSelect,
  selectedId,
  isLoading,
  className,
}: SelectionCardsProps) {
  if (isLoading) {
    return (
      <div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-3", className)}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="opacity-50 animate-pulse">
            <CardHeader className="space-y-2">
              <div className="h-4 w-1/3 bg-muted rounded" />
              <div className="h-3 w-2/3 bg-muted rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-20 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-3", className)}>
      {cards.map((card) => {
        const Icon = card.icon
        const isSelected = selectedId === card.id

        return (
          <Card
            key={card.id}
            className={cn(
              "cursor-pointer transition-colors hover:bg-muted/50",
              isSelected && "ring-2 ring-primary"
            )}
            onClick={() => onSelect(card.id)}
          >
            <CardHeader>
              <div className="flex items-center gap-2">
                {Icon && <Icon className="h-5 w-5 text-muted-foreground" />}
                <CardTitle className="text-lg">{card.title}</CardTitle>
              </div>
              <CardDescription>{card.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <MetricsDisplay metrics={card.metrics} className="mt-2" />
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
} 