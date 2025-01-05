import { useState, useEffect } from 'react';
import { createClient } from '@/app/supabase/client';
import { MetricsData, TimeMetrics, TimeSegment } from '../types';

export function useTimeMetrics(companyId: number, segment: TimeSegment, segments: TimeSegment[]) {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMetrics() {
      if (!companyId || !segment) return;

      try {
        setIsLoading(true);
        const supabase = createClient();

        // Function to calculate metrics for a time range
        const getMetricsForRange = async (startDate: string, endDate: string): Promise<TimeMetrics> => {
          const { data: responses, error: fetchError } = await supabase
            .from('response_analysis')
            .select('*')
            .eq('company_id', companyId)
            .gte('created_at', startDate)
            .lte('created_at', endDate);

          if (fetchError) throw fetchError;

          const metrics = {
            sentiment: 0,
            position: null as number | null,
            mentions: 0,
            features: 0,
            totalResponses: responses?.length || 0
          };

          if (!responses?.length) return metrics;

          // Calculate sentiment score (all stages)
          const validSentiments = responses.filter(r => r.sentiment_score !== null);
          if (validSentiments.length) {
            metrics.sentiment = validSentiments.reduce((sum, r) => sum + (r.sentiment_score || 0), 0) / validSentiments.length;
          }

          // Calculate position score (comparison and feedback stages)
          const positionResponses = responses.filter(r => 
            r.buying_journey_stage && ['solution_comparison', 'user_feedback'].includes(r.buying_journey_stage) &&
            r.ranking_position !== null && r.ranking_position > 0
          );
          if (positionResponses.length) {
            metrics.position = positionResponses.reduce((sum, r) => sum + (r.ranking_position || 0), 0) / positionResponses.length;
          }

          // Calculate mention rate (early stages)
          const earlyStageResponses = responses.filter(r => 
            r.buying_journey_stage && ['problem_exploration', 'solution_education'].includes(r.buying_journey_stage)
          );
          if (earlyStageResponses.length) {
            metrics.mentions = earlyStageResponses.filter(r => r.company_mentioned).length / earlyStageResponses.length;
          }

          // Calculate feature score (evaluation stage)
          const evaluationResponses = responses.filter(r => 
            r.buying_journey_stage === 'solution_evaluation' && r.solution_analysis
          );
          if (evaluationResponses.length) {
            const featureYesCount = evaluationResponses.filter(r => {
              try {
                const analysis = typeof r.solution_analysis === 'string'
                  ? JSON.parse(r.solution_analysis)
                  : r.solution_analysis;
                return analysis.has_feature === 'YES';
              } catch (e) {
                console.warn('Failed to parse solution analysis:', e);
                return false;
              }
            }).length;
            metrics.features = featureYesCount / evaluationResponses.length;
          }

          return metrics;
        };

        // Get current period metrics
        const currentMetrics = await getMetricsForRange(segment.startDate, segment.endDate);

        // Find previous segment
        const currentIndex = segments.findIndex(s => s.id === segment.id);
        const previousSegment = segments[currentIndex + 1];

        // Get previous period metrics
        const previousMetrics = previousSegment
          ? await getMetricsForRange(previousSegment.startDate, previousSegment.endDate)
          : null;

        // Calculate changes with proper handling of zero values and first segment
        const calculateChange = (current: number, previous: number | null) => {
          if (previous === null || previous === 0) {
            return current > 0 ? 1 : 0; // 100% increase from zero/null
          }
          return (current - previous) / previous;
        };

        const changes = previousMetrics ? {
          sentiment: calculateChange(currentMetrics.sentiment, previousMetrics.sentiment),
          position: currentMetrics.position !== null && previousMetrics.position !== null
            ? calculateChange(currentMetrics.position, previousMetrics.position)
            : 0,
          mentions: calculateChange(currentMetrics.mentions, previousMetrics.mentions),
          features: calculateChange(currentMetrics.features, previousMetrics.features)
        } : undefined;

        setMetrics({
          current: currentMetrics,
          previous: previousMetrics || undefined,
          changes
        });
      } catch (err) {
        console.error('Error fetching metrics:', err);
        setError('Failed to load metrics');
      } finally {
        setIsLoading(false);
      }
    }

    fetchMetrics();
  }, [companyId, segment, segments]);

  return { metrics, isLoading, error };
} 