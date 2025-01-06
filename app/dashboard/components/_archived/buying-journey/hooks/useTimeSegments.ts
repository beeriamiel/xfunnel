import { useState, useEffect } from 'react';
import { createClient } from '@/app/supabase/client';
import { TimeSegment } from '../types';

export function useTimeSegments(companyId: number, type: 'batch' | 'week' | 'month') {
  const [segments, setSegments] = useState<TimeSegment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSegments() {
      if (!companyId) return;

      try {
        setIsLoading(true);
        const supabase = createClient();

        // Get all responses for the company
        const { data: responses, error: fetchError } = await supabase
          .from('response_analysis')
          .select('analysis_batch_id, created_at')
          .eq('company_id', companyId)
          .order('created_at', { ascending: false })
          .order('analysis_batch_id', { ascending: false });

        if (fetchError) throw fetchError;

        if (type === 'batch') {
          // Group by batch with timestamp info
          const batchMap = new Map<string, { 
            start: string; 
            end: string; 
            count: number;
            timestamp: string;
          }>();
          
          responses?.forEach(response => {
            const batchId = response.analysis_batch_id || 'unknown';
            const date = new Date(response.created_at || Date.now());
            
            if (!batchMap.has(batchId)) {
              batchMap.set(batchId, {
                start: response.created_at || new Date().toISOString(),
                end: response.created_at || new Date().toISOString(),
                count: 0,
                timestamp: response.created_at || new Date().toISOString()
              });
            }
            
            const batch = batchMap.get(batchId)!;
            batch.count++;
            
            if (new Date(response.created_at || Date.now()) < new Date(batch.start)) {
              batch.start = response.created_at || new Date().toISOString();
            }
            if (new Date(response.created_at || Date.now()) > new Date(batch.end)) {
              batch.end = response.created_at || new Date().toISOString();
              batch.timestamp = response.created_at || new Date().toISOString();
            }
          });

          // Convert to array and sort by date and batch ID
          const batchSegments = Array.from(batchMap.entries())
            .map(([id, data]) => {
              const date = new Date(data.timestamp);
              const sameDayBatches = Array.from(batchMap.entries()).filter(([_, b]) => 
                new Date(b.timestamp).toDateString() === date.toDateString()
              );

              return {
                id,
                type: 'BATCH' as const,
                startDate: data.start,
                endDate: data.end,
                timestamp: data.timestamp,
                displayName: sameDayBatches.length > 1
                  ? `Batch ${date.toLocaleDateString()} ${date.toLocaleTimeString()} (${data.count} responses)`
                  : `Batch ${date.toLocaleDateString()} (${data.count} responses)`
              };
            })
            .sort((a, b) => {
              // Sort by date first
              const dateCompare = new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
              if (dateCompare !== 0) return dateCompare;
              // Then by batch ID
              return b.id.localeCompare(a.id);
            });

          setSegments(batchSegments);
        } else {
          // Group by week or month
          const periodMap = new Map<string, { start: Date; end: Date; count: number }>();
          
          responses?.forEach(response => {
            const date = new Date(response.created_at || Date.now());
            let periodKey: string;
            let periodStart: Date;
            let periodEnd: Date;

            if (type === 'week') {
              // Get the Monday of the week
              const day = date.getDay();
              const diff = date.getDate() - day + (day === 0 ? -6 : 1);
              periodStart = new Date(date.setDate(diff));
              periodStart.setHours(0, 0, 0, 0);
              
              periodEnd = new Date(periodStart);
              periodEnd.setDate(periodStart.getDate() + 6);
              periodEnd.setHours(23, 59, 59, 999);

              periodKey = `${periodStart.getFullYear()}-W${String(Math.ceil(periodStart.getDate() / 7)).padStart(2, '0')}`;
            } else {
              // Month view
              periodStart = new Date(date.getFullYear(), date.getMonth(), 1);
              periodEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
              periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            }

            if (!periodMap.has(periodKey)) {
              periodMap.set(periodKey, { start: periodStart, end: periodEnd, count: 0 });
            }
            
            periodMap.get(periodKey)!.count++;
          });

          const periodSegments = Array.from(periodMap.entries()).map(([id, data]) => ({
            id,
            type: type.toUpperCase() as 'WEEK' | 'MONTH',
            startDate: data.start.toISOString(),
            endDate: data.end.toISOString(),
            displayName: type === 'week'
              ? `Week of ${data.start.toLocaleDateString()} (${data.count} responses)`
              : `${data.start.toLocaleString('default', { month: 'long' })} ${data.start.getFullYear()} (${data.count} responses)`
          }));

          setSegments(periodSegments.sort((a, b) => 
            new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
          ));
        }
      } catch (err) {
        console.error('Error fetching time segments:', err);
        setError('Failed to load time segments');
      } finally {
        setIsLoading(false);
      }
    }

    fetchSegments();
  }, [companyId, type]);

  return { segments, isLoading, error };
} 