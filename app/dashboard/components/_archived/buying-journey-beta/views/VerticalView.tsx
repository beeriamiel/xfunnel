'use client';

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, User, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

interface VerticalViewProps {
  vertical: string;
  onBack: () => void;
  onPersonaSelect: (persona: string) => void;
}

export function VerticalView({ vertical, onBack, onPersonaSelect }: VerticalViewProps) {
  const personas = [
    {
      id: 'technical_decision_maker',
      name: 'Technical Decision Maker',
      description: 'CTO, VP of Engineering, Tech Lead',
      metrics: {
        mentions: 0.75,
        position: 2.1,
        sentiment: 0.82,
        features: 0.88
      }
    },
    {
      id: 'business_decision_maker',
      name: 'Business Decision Maker',
      description: 'CEO, CFO, COO',
      metrics: {
        mentions: 0.68,
        position: 2.6,
        sentiment: 0.74,
        features: 0.81
      }
    },
    {
      id: 'end_user',
      name: 'End User',
      description: 'Developer, Engineer, Analyst',
      metrics: {
        mentions: 0.71,
        position: 2.4,
        sentiment: 0.77,
        features: 0.84
      }
    }
  ];

  const getVerticalName = (id: string) => {
    switch (id) {
      case 'enterprise_software':
        return 'Enterprise Software';
      case 'fintech':
        return 'FinTech';
      case 'healthcare':
        return 'Healthcare';
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
          <h3 className="text-lg font-semibold">{getVerticalName(vertical)}</h3>
          <p className="text-sm text-muted-foreground">
            Select a persona to explore queries
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {personas.map((persona) => (
          <motion.div
            key={persona.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card 
              className="p-6 cursor-pointer hover:shadow-md hover:border-primary/20"
              onClick={() => onPersonaSelect(persona.id)}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    <h4 className="font-medium">{persona.name}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {persona.description}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Mentions</div>
                  <div className="font-medium">{(persona.metrics.mentions * 100).toFixed(0)}%</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Position</div>
                  <div className="font-medium">{persona.metrics.position.toFixed(1)}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Sentiment</div>
                  <div className="font-medium">{(persona.metrics.sentiment * 100).toFixed(0)}%</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Features</div>
                  <div className="font-medium">{(persona.metrics.features * 100).toFixed(0)}%</div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
} 