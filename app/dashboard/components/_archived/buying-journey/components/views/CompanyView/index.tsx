'use client';

import { Card } from "@/components/ui/card";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { Selection, ViewMetrics } from "../../../types";
import { MetricsSummary } from "../../metrics/MetricsSummary";
import { motion } from "framer-motion";

interface CompanyViewProps {
  metrics: ViewMetrics;
  onSelect: (selection: Selection) => void;
  regions: Array<{
    name: string;
    metrics: {
      sentiment: number;
      position: number | null;
      mentions: number;
      features: number;
      totalResponses: number;
    };
  }>;
}

export function CompanyView({ metrics, onSelect, regions }: CompanyViewProps) {
  return (
    <div className="space-y-8">
      {/* Company-wide Metrics */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Company Overview</h3>
        <MetricsSummary metrics={metrics} />
      </section>

      {/* Region Selection */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Regions</h3>
          <span className="text-sm text-muted-foreground">
            Select a region to explore
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {regions.map((region) => (
            <RegionCard
              key={region.name}
              region={region}
              onClick={() => onSelect({ type: 'region', value: region.name })}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

interface RegionCardProps {
  region: {
    name: string;
    metrics: {
      sentiment: number;
      position: number | null;
      mentions: number;
      features: number;
      totalResponses: number;
    };
  };
  onClick: () => void;
}

function RegionCard({ region, onClick }: RegionCardProps) {
  // Get theme color based on standardized region name
  const getThemeColor = (region: string) => {
    const standardizedRegion = region.toLowerCase().trim();
    switch (standardizedRegion) {
      case 'north_america':
      case 'north america':
      case 'na':
        return 'bg-purple-100/80 hover:bg-purple-100';
      case 'latam':
      case 'latin_america':
      case 'latin america':
        return 'bg-blue-100/80 hover:bg-blue-100';
      case 'emea':
        return 'bg-emerald-100/80 hover:bg-emerald-100';
      case 'europe':
        return 'bg-amber-100/80 hover:bg-amber-100';
      default:
        return 'bg-blue-100/80 hover:bg-blue-100';
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        className={cn(
          "p-6 cursor-pointer transition-colors duration-200",
          "hover:shadow-md hover:border-primary/20",
          getThemeColor(region.name)
        )}
        onClick={onClick}
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-background/50">
              <Globe className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-medium">{region.name}</h4>
              <p className="text-sm text-muted-foreground">
                {region.metrics.totalResponses} responses
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <MetricRow
              label="Company Mentions"
              value={region.metrics.mentions}
              suffix="%"
            />
            <MetricRow
              label="Average Position"
              value={region.metrics.position}
              decimals={1}
            />
            <MetricRow
              label="Feature Score"
              value={region.metrics.features}
              suffix="%"
            />
            <MetricRow
              label="Sentiment"
              value={region.metrics.sentiment}
              suffix="%"
            />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

interface MetricRowProps {
  label: string;
  value: number | null;
  suffix?: string;
  decimals?: number;
}

function MetricRow({ label, value, suffix = '', decimals = 0 }: MetricRowProps) {
  const formattedValue = value === null 
    ? 'N/A'
    : `${value.toFixed(decimals)}${suffix}`;

  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{formattedValue}</span>
    </div>
  );
} 