"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import type { Query } from "../../types/query-types"

interface PhaseMetricsProps {
  phase: string;
  queries: Query[];
}

export function PhaseMetrics({ phase, queries }: PhaseMetricsProps) {
  if (!queries.length) return null;

  // Helper to calculate company mention percentage
  const calculateMentionPercentage = () => {
    // Use the average of companyMentionRate across queries
    const totalRate = queries.reduce((sum, query) => sum + query.companyMentionRate, 0);
    return totalRate / queries.length;
  };

  // Helper to calculate average ranking
  const calculateAverageRanking = () => {
    const validRankings = queries.flatMap(query => 
      Object.entries(query.engineResults)
        .filter(([_, result]) => typeof result.rank === 'number' && result.rank > 0)
        .map(([_, result]) => result.rank)
        .filter((rank): rank is number => typeof rank === 'number' && rank > 0)
    );

    if (!validRankings.length) return null;
    return validRankings.reduce((sum, rank) => sum + rank, 0) / validRankings.length;
  };

  // Helper to get status indicator
  const getStatusIndicator = (value: number, type: 'mention' | 'rank' | 'feature') => {
    switch (type) {
      case 'mention':
        if (value >= 40) return { icon: '✨', color: 'text-green-600' };
        if (value >= 15) return { icon: '⚡', color: 'text-orange-500' };
        return { icon: '⚠️', color: 'text-red-500' };
      case 'rank':
        if (value <= 3) return { icon: '🏆', color: 'text-amber-500' };
        if (value <= 7) return { icon: '🥈', color: 'text-zinc-400' };
        return { icon: '🥉', color: 'text-orange-400' };
      case 'feature':
        if (value >= 70) return { icon: '⭐⭐⭐', color: 'text-green-600' };
        if (value >= 40) return { icon: '⭐⭐', color: 'text-orange-500' };
        return { icon: '⭐', color: 'text-red-500' };
      default:
        return { icon: '', color: '' };
    }
  };

  switch (phase) {
    case 'problem_exploration':
    case 'solution_education': {
      const mentionPercentage = calculateMentionPercentage();
      const status = getStatusIndicator(mentionPercentage, 'mention');
      
      return (
        <div className="flex items-center gap-2 text-xs">
          <div className={cn(
            "flex items-center gap-1.5 px-2 py-0.5 rounded-full",
            "bg-background border border-border/50"
          )}>
            <span className="text-muted-foreground">Company Mentioned</span>
            <span className={status.color}>{Math.round(mentionPercentage)}%</span>
            <span className="ml-1">{status.icon}</span>
          </div>
        </div>
      );
    }

    case 'solution_comparison':
    case 'final_research': {
      const avgRanking = calculateAverageRanking();
      if (!avgRanking) return null;
      const status = getStatusIndicator(avgRanking, 'rank');

      return (
        <div className="flex items-center gap-2 text-xs">
          <div className={cn(
            "flex items-center gap-1.5 px-2 py-0.5 rounded-full",
            "bg-background border border-border/50"
          )}>
            <span className="text-muted-foreground">Avg Rank</span>
            <span className={status.color}>#{avgRanking.toFixed(1)}</span>
            <span className="ml-1">{status.icon}</span>
          </div>
        </div>
      );
    }

    case 'solution_evaluation': {
      const featureAnalysis = queries.reduce((acc, query) => {
        let hasValidResponse = false;
        Object.values(query.engineResults).forEach(result => {
          if (result?.solutionAnalysis?.has_feature) {
            hasValidResponse = true;
            const response = result.solutionAnalysis.has_feature;
            if (response === 'YES') acc.yes++;
            else if (response === 'NO') acc.no++;
            else acc.unknown++;
          }
        });
        if (!hasValidResponse) acc.unknown++;
        return acc;
      }, { yes: 0, no: 0, unknown: 0 });

      const total = featureAnalysis.yes + featureAnalysis.no + featureAnalysis.unknown;
      const featurePercentage = (featureAnalysis.yes / total) * 100;
      const status = getStatusIndicator(featurePercentage, 'feature');

      return (
        <div className="flex items-center gap-2 text-xs">
          <div className={cn(
            "flex items-center gap-1.5 px-2 py-0.5 rounded-full",
            "bg-background border border-border/50",
            "group relative"
          )}>
            <span className="text-muted-foreground">Features Present</span>
            <span className={status.color}>{Math.round(featurePercentage)}%</span>
            <span className="ml-1">{status.icon}</span>
            
            {/* Tooltip */}
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 
                          opacity-0 group-hover:opacity-100 transition-opacity
                          bg-popover text-popover-foreground rounded-md shadow-md
                          p-2 text-xs whitespace-nowrap">
              <div className="text-green-600">✓ Present: {Math.round(featurePercentage)}%</div>
              <div className="text-red-600">✗ Missing: {Math.round((featureAnalysis.no / total) * 100)}%</div>
              <div className="text-muted-foreground">? Unknown: {Math.round((featureAnalysis.unknown / total) * 100)}%</div>
            </div>
          </div>
        </div>
      );
    }

    default:
      return null;
  }
} 