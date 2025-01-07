"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import type { Query } from "../../types/query-types"

interface PhaseMetricsProps {
  phase: string;
  queries: Query[];
}

// Animation variants for metrics
const metricVariants = {
  initial: { 
    opacity: 0,
    scale: 0.9,
    y: 10
  },
  animate: { 
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  },
  exit: { 
    opacity: 0,
    scale: 0.9,
    y: -10,
    transition: {
      duration: 0.2
    }
  }
}

export function PhaseMetrics({ phase, queries }: PhaseMetricsProps) {
  const getStatusIndicator = (value: number, type: 'mention' | 'feature' | 'rank') => {
    let color = "text-muted-foreground"
    let icon = null

    if (type === 'mention' || type === 'feature') {
      if (value >= 70) {
        color = "text-green-500"
        icon = "↑"
      } else if (value >= 40) {
        color = "text-yellow-500"
        icon = "→"
      } else {
        color = "text-red-500"
        icon = "↓"
      }
    } else if (type === 'rank') {
      if (value <= 3) {
        color = "text-green-500"
        icon = "↑"
      } else if (value <= 7) {
        color = "text-yellow-500"
        icon = "→"
      } else {
        color = "text-red-500"
        icon = "↓"
      }
    }

    return { color, icon }
  }

  switch (phase) {
    case 'problem_exploration':
    case 'solution_education': {
      const mentionAnalysis = queries.reduce((acc, query) => {
        let hasValidResponse = false;
        Object.values(query.engineResults).forEach(result => {
          if (result?.companyMentioned !== undefined) {
            hasValidResponse = true;
            if (result.companyMentioned) acc.mentioned++;
            else acc.notMentioned++;
          }
        });
        if (!hasValidResponse) acc.unknown++;
        return acc;
      }, { mentioned: 0, notMentioned: 0, unknown: 0 });

      const total = mentionAnalysis.mentioned + mentionAnalysis.notMentioned + mentionAnalysis.unknown;
      const mentionPercentage = (mentionAnalysis.mentioned / total) * 100;
      const status = getStatusIndicator(mentionPercentage, 'mention');

      return (
        <AnimatePresence mode="wait">
          <motion.div 
            className="flex items-center gap-2 text-xs"
            variants={metricVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <div className={cn(
              "flex items-center gap-1.5 px-2 py-0.5 rounded-full",
              "bg-background/50 border border-border/50",
              "group relative hover:bg-background/80 transition-colors duration-200"
            )}>
              <span className="text-muted-foreground">Company Mentions</span>
              <motion.span 
                className={status.color}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {Math.round(mentionPercentage)}%
              </motion.span>
              <motion.span 
                className="ml-1"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  type: "spring",
                  stiffness: 400,
                  damping: 10,
                  delay: 0.3
                }}
              >
                {status.icon}
              </motion.span>
              
              <motion.div 
                className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 
                          opacity-0 group-hover:opacity-100 
                          bg-popover text-popover-foreground rounded-md shadow-md
                          p-2 text-xs whitespace-nowrap z-50"
                initial={{ y: 5 }}
                whileHover={{ y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="text-green-500">✓ Mentioned: {Math.round(mentionPercentage)}%</div>
                <div className="text-red-500">✗ Not Mentioned: {Math.round((mentionAnalysis.notMentioned / total) * 100)}%</div>
                <div className="text-muted-foreground">? Unknown: {Math.round((mentionAnalysis.unknown / total) * 100)}%</div>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
      );
    }

    case 'solution_comparison': {
      const rankAnalysis = queries.reduce((acc, query) => {
        let totalRank = 0;
        let validResponses = 0;
        Object.values(query.engineResults).forEach(result => {
          if (result?.rank && result.rank !== 'n/a') {
            totalRank += parseInt(result.rank as string);
            validResponses++;
          }
        });
        if (validResponses > 0) {
          acc.totalRank += totalRank;
          acc.totalResponses += validResponses;
        }
        return acc;
      }, { totalRank: 0, totalResponses: 0 });

      const avgRank = rankAnalysis.totalResponses > 0
        ? rankAnalysis.totalRank / rankAnalysis.totalResponses
        : 0;
      const status = getStatusIndicator(avgRank, 'rank');

      return (
        <AnimatePresence mode="wait">
          <motion.div 
            className="flex items-center gap-2 text-xs"
            variants={metricVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <div className={cn(
              "flex items-center gap-1.5 px-2 py-0.5 rounded-full",
              "bg-background/50 border border-border/50",
              "group relative hover:bg-background/80 transition-colors duration-200"
            )}>
              <span className="text-muted-foreground">Avg Rank</span>
              <motion.span 
                className={status.color}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                #{avgRank.toFixed(1)}
              </motion.span>
              <motion.span 
                className="ml-1"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  type: "spring",
                  stiffness: 400,
                  damping: 10,
                  delay: 0.3
                }}
              >
                {status.icon}
              </motion.span>
            </div>
          </motion.div>
        </AnimatePresence>
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
        <AnimatePresence mode="wait">
          <motion.div 
            className="flex items-center gap-2 text-xs"
            variants={metricVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <div className={cn(
              "flex items-center gap-1.5 px-2 py-0.5 rounded-full",
              "bg-background/50 border border-border/50",
              "group relative hover:bg-background/80 transition-colors duration-200"
            )}>
              <span className="text-muted-foreground">Features Present</span>
              <motion.span 
                className={status.color}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {Math.round(featurePercentage)}%
              </motion.span>
              <motion.span 
                className="ml-1"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  type: "spring",
                  stiffness: 400,
                  damping: 10,
                  delay: 0.3
                }}
              >
                {status.icon}
              </motion.span>
              
              <motion.div 
                className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 
                          opacity-0 group-hover:opacity-100 
                          bg-popover text-popover-foreground rounded-md shadow-md
                          p-2 text-xs whitespace-nowrap z-50"
                initial={{ y: 5 }}
                whileHover={{ y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="text-green-500">✓ Present: {Math.round(featurePercentage)}%</div>
                <div className="text-red-500">✗ Missing: {Math.round((featureAnalysis.no / total) * 100)}%</div>
                <div className="text-muted-foreground">? Unknown: {Math.round((featureAnalysis.unknown / total) * 100)}%</div>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
      );
    }

    default:
      return null;
  }
} 