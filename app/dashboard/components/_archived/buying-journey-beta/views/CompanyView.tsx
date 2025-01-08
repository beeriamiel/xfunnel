'use client';

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, Globe } from "lucide-react";
import { ViewMetrics } from "../../buying-journey/types";
import { motion } from "framer-motion";

interface CompanyViewProps {
  metrics: ViewMetrics;
  onRegionSelect: (region: string) => void;
}

export function CompanyView({ metrics, onRegionSelect }: CompanyViewProps) {
  const regions = [
    {
      id: 'north_america',
      name: 'North America',
      description: 'United States and Canada',
      metrics: {
        mentions: 0.65,
        position: 2.5,
        sentiment: 0.75,
        features: 0.82
      }
    },
    {
      id: 'emea',
      name: 'EMEA',
      description: 'Europe, Middle East, and Africa',
      metrics: {
        mentions: 0.58,
        position: 3.2,
        sentiment: 0.68,
        features: 0.75
      }
    },
    {
      id: 'latam',
      name: 'LATAM',
      description: 'Latin America',
      metrics: {
        mentions: 0.62,
        position: 2.8,
        sentiment: 0.72,
        features: 0.79
      }
    }
  ];

  return (
    <div className="space-y-8">
      {/* Company-wide Metrics */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Company Mentions"
          value={metrics?.mentions || 0}
          change={metrics?.timeComparison?.mentions}
          format="percentage"
        />
        <MetricCard
          title="Average Position"
          value={metrics?.position || 0}
          change={metrics?.timeComparison?.position}
          format="number"
          lowerIsBetter
        />
        <MetricCard
          title="Feature Score"
          value={metrics?.features || 0}
          change={metrics?.timeComparison?.features}
          format="percentage"
        />
        <MetricCard
          title="Sentiment Score"
          value={metrics?.sentiment || 0}
          change={metrics?.timeComparison?.sentiment}
          format="percentage"
        />
      </section>

      {/* Region Selection */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Select a Region</h3>
          <span className="text-sm text-muted-foreground">
            Click a region to explore verticals
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {regions.map((region) => (
            <motion.div
              key={region.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card 
                className="p-6 cursor-pointer hover:shadow-md hover:border-primary/20"
                onClick={() => onRegionSelect(region.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-primary" />
                      <h4 className="font-medium">{region.name}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {region.description}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Mentions</div>
                    <div className="font-medium">{(region.metrics.mentions * 100).toFixed(0)}%</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Position</div>
                    <div className="font-medium">{region.metrics.position.toFixed(1)}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Sentiment</div>
                    <div className="font-medium">{(region.metrics.sentiment * 100).toFixed(0)}%</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Features</div>
                    <div className="font-medium">{(region.metrics.features * 100).toFixed(0)}%</div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: number;
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
  const formatValue = (val: number) => {
    return format === 'percentage'
      ? `${Math.round(val * 100)}%`
      : val.toFixed(1);
  };

  const getTrendColor = () => {
    if (!change) return 'text-muted-foreground';
    const isPositive = lowerIsBetter ? change < 0 : change > 0;
    return isPositive ? 'text-green-600' : 'text-red-600';
  };

  return (
    <Card className="p-4">
      <h3 className="text-sm font-medium text-muted-foreground mb-2">{title}</h3>
      <div className="text-2xl font-bold mb-2">{formatValue(value)}</div>
      {change && (
        <div className={`text-sm ${getTrendColor()}`}>
          {change > 0 ? '+' : ''}{Math.round(change * 100)}%
          {change !== 0 && (
            <span className="text-xs">
              {lowerIsBetter ? (change < 0 ? '↓' : '↑') : (change > 0 ? '↑' : '↓')}
            </span>
          )}
        </div>
      )}
    </Card>
  );
} 