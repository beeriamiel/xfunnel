'use client';

import { Card } from "@/components/ui/card";
import { ViewMetrics } from "../../types";
import { cn } from "@/lib/utils";

interface MetricsSummaryProps {
  metrics: ViewMetrics;
}

export function MetricsSummary({ metrics }: MetricsSummaryProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <MetricCard
        title="Company Mentions"
        value={metrics.mentions}
        change={metrics.timeComparison?.mentions}
        format="percentage"
      />
      <MetricCard
        title="Average Position"
        value={metrics.position}
        change={metrics.timeComparison?.position}
        format="number"
        lowerIsBetter
      />
      <MetricCard
        title="Feature Score"
        value={metrics.features}
        change={metrics.timeComparison?.features}
        format="percentage"
      />
      <MetricCard
        title="Sentiment Score"
        value={metrics.sentiment}
        change={metrics.timeComparison?.sentiment}
        format="percentage"
      />
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: number | null;
  change?: number;
  format: 'percentage' | 'number';
  lowerIsBetter?: boolean;
}

function MetricCard({
  title,
  value,
  change,
  format,
  lowerIsBetter = false
}: MetricCardProps) {
  const formatValue = (val: number | null) => {
    if (val === null) return 'N/A';
    return format === 'percentage'
      ? `${Math.round(val * 100)}%`
      : val.toFixed(1);
  };

  const getTrendColor = () => {
    if (!change) return 'text-muted-foreground';
    const isPositive = lowerIsBetter ? change < 0 : change > 0;
    return isPositive ? 'text-green-600' : 'text-red-600';
  };

  const getChangeDescription = () => {
    if (!change) return 'No previous data available';
    if (value === 0) return 'No change from zero';
    const direction = change > 0 ? 'increase' : 'decrease';
    return `${Math.abs(Math.round(change * 100))}% ${direction}`;
  };

  return (
    <Card className="p-4 group relative">
      <h3 className="text-sm font-medium text-muted-foreground mb-2">{title}</h3>
      <div className="text-2xl font-bold mb-2">{formatValue(value)}</div>
      {change !== undefined && (
        <>
          <div className={cn("text-sm flex items-center gap-1", getTrendColor())}>
            {change > 0 ? '+' : ''}{Math.round(change * 100)}%
            {change !== 0 && (
              <span className="text-xs">
                {lowerIsBetter ? (change < 0 ? '↓' : '↑') : (change > 0 ? '↑' : '↓')}
              </span>
            )}
          </div>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-popover/95 rounded-lg p-3">
            <div className="h-full flex items-center justify-center text-center">
              <p className="text-sm text-popover-foreground">
                {getChangeDescription()}
              </p>
            </div>
          </div>
        </>
      )}
    </Card>
  );
} 