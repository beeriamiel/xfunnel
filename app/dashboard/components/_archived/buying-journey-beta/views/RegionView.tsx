'use client';

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, Building2, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

interface RegionViewProps {
  region: string;
  onBack: () => void;
  onVerticalSelect: (vertical: string) => void;
}

export function RegionView({ region, onBack, onVerticalSelect }: RegionViewProps) {
  const verticals = [
    {
      id: 'enterprise_software',
      name: 'Enterprise Software',
      description: 'B2B software solutions',
      metrics: {
        mentions: 0.72,
        position: 2.3,
        sentiment: 0.78,
        features: 0.85
      }
    },
    {
      id: 'fintech',
      name: 'FinTech',
      description: 'Financial technology solutions',
      metrics: {
        mentions: 0.65,
        position: 2.8,
        sentiment: 0.71,
        features: 0.79
      }
    },
    {
      id: 'healthcare',
      name: 'Healthcare',
      description: 'Healthcare and medical solutions',
      metrics: {
        mentions: 0.68,
        position: 2.5,
        sentiment: 0.74,
        features: 0.81
      }
    }
  ];

  const getRegionName = (id: string) => {
    switch (id) {
      case 'north_america':
        return 'North America';
      case 'emea':
        return 'EMEA';
      case 'latam':
        return 'LATAM';
      default:
        return id;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h3 className="text-lg font-semibold">{getRegionName(region)}</h3>
          <p className="text-sm text-muted-foreground">
            Select a vertical to explore personas
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {verticals.map((vertical) => (
          <motion.div
            key={vertical.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card 
              className="p-6 cursor-pointer hover:shadow-md hover:border-primary/20"
              onClick={() => onVerticalSelect(vertical.id)}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary" />
                    <h4 className="font-medium">{vertical.name}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {vertical.description}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Mentions</div>
                  <div className="font-medium">{(vertical.metrics.mentions * 100).toFixed(0)}%</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Position</div>
                  <div className="font-medium">{vertical.metrics.position.toFixed(1)}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Sentiment</div>
                  <div className="font-medium">{(vertical.metrics.sentiment * 100).toFixed(0)}%</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Features</div>
                  <div className="font-medium">{(vertical.metrics.features * 100).toFixed(0)}%</div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
} 