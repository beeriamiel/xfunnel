'use client'

import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface MetricDisplay {
  label: string
  value: number
  change?: number
}

interface SelectionCardProps {
  title: string
  description?: string
  metrics?: MetricDisplay[]
  isSelected?: boolean
  onClick?: () => void
  className?: string
}

export function SelectionCard({
  title,
  description,
  metrics,
  isSelected,
  onClick,
  className,
}: SelectionCardProps) {
  return (
    <Card
      className={cn(
        "relative p-6 cursor-pointer transition-all hover:shadow-md",
        isSelected && "ring-2 ring-primary",
        className
      )}
      onClick={onClick}
    >
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>

        {metrics && metrics.length > 0 && (
          <div className="grid grid-cols-2 gap-4">
            {metrics.map((metric, index) => (
              <div key={index} className="space-y-1">
                <p className="text-sm text-muted-foreground">{metric.label}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-semibold">
                    {metric.value.toFixed(1)}%
                  </span>
                  {metric.change !== undefined && (
                    <span
                      className={cn(
                        "text-sm",
                        metric.change > 0 && "text-green-600",
                        metric.change < 0 && "text-red-600"
                      )}
                    >
                      {metric.change > 0 ? "+" : ""}
                      {metric.change.toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
} 