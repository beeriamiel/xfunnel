'use client'

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { ViewProps, ViewCard } from "../types"
import { cn } from "@/lib/utils"

const viewTransitions = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 }
};

const cardTransitions = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

interface BaseViewProps extends ViewProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function BaseView({ 
  title, 
  description, 
  children 
}: BaseViewProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={viewTransitions}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
      </div>

      {/* Future metrics/charts section */}
      <div className="grid grid-cols-4 gap-4">
        {/* Placeholder for future metrics */}
      </div>

      {children}
    </motion.div>
  );
}

interface SelectableCardProps {
  card: ViewCard;
  isSelected?: boolean;
  onClick: () => void;
  renderIcon?: () => React.ReactNode;
  renderContent?: () => React.ReactNode;
}

export function SelectableCard({
  card,
  isSelected,
  onClick,
  renderIcon,
  renderContent
}: SelectableCardProps) {
  return (
    <motion.div
      variants={cardTransitions}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <Card
        className={cn(
          "p-4 hover:bg-accent/10 cursor-pointer transition-all duration-200 border-[0.5px] border-border/40",
          isSelected && "shadow-[0_0_15px_rgba(147,51,234,0.15)] border-purple-500/30 bg-purple-50/30"
        )}
        onClick={onClick}
      >
        <div className="space-y-3">
          <div className="flex items-start gap-3 mb-3">
            {renderIcon && (
              <div className="p-2 rounded-lg shrink-0 mt-0.5 bg-primary/10">
                {renderIcon()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-medium line-clamp-2">{card.title}</h3>
              {card.subtitle && (
                <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
                  {card.subtitle}
                </p>
              )}
              {card.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {card.description}
                </p>
              )}
            </div>
          </div>

          {renderContent?.()}

          <div className="space-y-1">
            <MetricItem 
              label="Company Mentioned" 
              value={card.metrics.mentions}
              format="percentage"
            />
            <MetricItem 
              label="Average Position" 
              value={card.metrics.position}
            />
            <MetricItem 
              label="Feature Score" 
              value={card.metrics.features}
              format="percentage"
            />
            <MetricItem 
              label="Average Sentiment" 
              value={card.metrics.sentiment * 100}
              format="percentage"
            />
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{card.metrics.totalQueries} queries</span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

interface MetricItemProps {
  label: string;
  value: number | null;
  format?: 'percentage' | 'number';
}

function MetricItem({ label, value, format = 'number' }: MetricItemProps) {
  if (value === null) return null;

  const formattedValue = format === 'percentage'
    ? `${Math.round(value)}%`
    : value.toFixed(1);

  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{formattedValue}</span>
    </div>
  );
} 