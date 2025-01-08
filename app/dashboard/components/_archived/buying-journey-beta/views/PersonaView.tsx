'use client';

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Search, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

interface PersonaViewProps {
  persona: string;
  onBack: () => void;
}

export function PersonaView({ persona, onBack }: PersonaViewProps) {
  const queries = [
    {
      id: 'q1',
      text: 'What are the best practices for implementing AI in enterprise software?',
      stage: 'problem_exploration',
      metrics: {
        mentions: 0.82,
        position: 1.8,
        sentiment: 0.85,
        features: 0.90,
        responses: 245
      }
    },
    {
      id: 'q2',
      text: 'How does your solution compare to traditional software development approaches?',
      stage: 'solution_comparison',
      metrics: {
        mentions: 0.75,
        position: 2.2,
        sentiment: 0.79,
        features: 0.85,
        responses: 189
      }
    },
    {
      id: 'q3',
      text: 'What are the integration capabilities with existing systems?',
      stage: 'solution_evaluation',
      metrics: {
        mentions: 0.78,
        position: 2.0,
        sentiment: 0.81,
        features: 0.87,
        responses: 210
      }
    }
  ];

  const getPersonaName = (id: string) => {
    switch (id) {
      case 'technical_decision_maker':
        return 'Technical Decision Maker';
      case 'business_decision_maker':
        return 'Business Decision Maker';
      case 'end_user':
        return 'End User';
      default:
        return id;
    }
  };

  const getStageBadge = (stage: string) => {
    switch (stage) {
      case 'problem_exploration':
        return <Badge variant="secondary">Problem Exploration</Badge>;
      case 'solution_comparison':
        return <Badge variant="secondary">Solution Comparison</Badge>;
      case 'solution_evaluation':
        return <Badge variant="secondary">Solution Evaluation</Badge>;
      default:
        return null;
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
          <h3 className="text-lg font-semibold">{getPersonaName(persona)}</h3>
          <p className="text-sm text-muted-foreground">
            Common queries and their performance
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {queries.map((query) => (
          <motion.div
            key={query.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Search className="h-4 w-4 text-primary" />
                      <h4 className="font-medium">{query.text}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStageBadge(query.stage)}
                      <span className="text-sm text-muted-foreground">
                        {query.metrics.responses} responses
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Mentions</div>
                    <div className="font-medium">{(query.metrics.mentions * 100).toFixed(0)}%</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Position</div>
                    <div className="font-medium">{query.metrics.position.toFixed(1)}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Sentiment</div>
                    <div className="font-medium">{(query.metrics.sentiment * 100).toFixed(0)}%</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Features</div>
                    <div className="font-medium">{(query.metrics.features * 100).toFixed(0)}%</div>
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {}}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  View Responses
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
} 