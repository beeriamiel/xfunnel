"use client"

import { useRef, useEffect, KeyboardEvent } from "react"
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
  const containerRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])

  // Update card refs when cards change
  useEffect(() => {
    cardRefs.current = cardRefs.current.slice(0, cards.length)
  }, [cards])

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>, index: number) => {
    const cardElements = cardRefs.current.filter(Boolean)
    const currentIndex = index

    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown": {
        event.preventDefault()
        const nextIndex = (currentIndex + 1) % cardElements.length
        cardElements[nextIndex]?.focus()
        break
      }
      case "ArrowLeft":
      case "ArrowUp": {
        event.preventDefault()
        const prevIndex = (currentIndex - 1 + cardElements.length) % cardElements.length
        cardElements[prevIndex]?.focus()
        break
      }
      case "Enter":
      case " ": {
        event.preventDefault()
        onSelect(cards[currentIndex].id)
        break
      }
      case "Home": {
        event.preventDefault()
        cardElements[0]?.focus()
        break
      }
      case "End": {
        event.preventDefault()
        cardElements[cardElements.length - 1]?.focus()
        break
      }
    }
  }

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
    <div
      ref={containerRef}
      className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-3", className)}
      role="listbox"
      aria-label="Selection options"
      aria-orientation="horizontal"
    >
      {cards.map((card, index) => {
        const Icon = card.icon
        const isSelected = selectedId === card.id

        return (
          <Card
            key={card.id}
            ref={el => cardRefs.current[index] = el}
            className={cn(
              "cursor-pointer transition-colors hover:bg-muted/50 outline-none focus-visible:ring-2 focus-visible:ring-primary",
              isSelected && "ring-2 ring-primary"
            )}
            onClick={() => onSelect(card.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            tabIndex={0}
            role="option"
            aria-selected={isSelected}
          >
            <CardHeader>
              <div className="flex items-center gap-2">
                {Icon && <Icon className="h-5 w-5 text-muted-foreground" aria-hidden="true" />}
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