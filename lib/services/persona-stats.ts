import { createClient } from '@/app/supabase/client';

interface Response {
  id: number;
  response_batch_id: string | null;
}

interface Query {
  id: number;
  responses: Response[];
}

interface Persona {
  id: number;
  queries: Query[];
}

interface ICP {
  id: number;
  personas: Persona[];
}

export interface PersonaStats {
  questionCount: number;
  responseCount: number;
  lastBatchDate: string | null;
}

export interface StatsMap {
  [key: string]: PersonaStats;
}

export async function fetchPersonaStats(companyId: number): Promise<StatsMap> {
  if (!companyId || isNaN(companyId)) {
    console.error('Invalid company ID provided:', companyId);
    return {};
  }

  const supabase = createClient();
  console.log('Fetching stats for company:', companyId);

  // Use LEFT joins to get all questions, even without responses
  const { data, error } = await supabase
    .from('ideal_customer_profiles')
    .select(`
      id,
      personas (
        id,
        queries (
          id,
          responses (
            id,
            response_batch_id
          )
        )
      )
    `)
    .eq('company_id', companyId);

  if (error) {
    console.error('Error fetching persona stats:', error);
    console.error('Error details:', error.message, error.details);
    return {};
  }

  // Debug log to see what we're getting
  console.log('Raw query result:', JSON.stringify(data, null, 2));

  // Get all batch IDs
  const batchIds = (data as ICP[] || []).flatMap(icp => 
    (icp.personas || []).flatMap(p => 
      (p.queries || []).flatMap(q => 
        (q.responses || []).map(r => r.response_batch_id)
      )
    )
  ).filter((id): id is string => id !== null);

  // Second query: Get batch metadata
  const { data: batchData } = await supabase
    .from('batch_metadata')
    .select('batch_id, created_at')
    .in('batch_id', batchIds);

  // Create a map of batch dates
  const batchDateMap = new Map(
    batchData?.map(b => [b.batch_id, b.created_at])
  );

  // Process the data
  return (data as ICP[] || []).reduce((acc: StatsMap, icp) => {
    (icp.personas || []).forEach(persona => {
      const key = `${icp.id}-${persona.id}`;
      const queries = persona.queries || [];
      const responses = queries.flatMap(q => q.responses || []);
      
      // Get response dates from the map
      const responseDates = responses
        .map(r => r.response_batch_id)
        .filter((id): id is string => id !== null)
        .map(id => batchDateMap.get(id))
        .filter((date): date is string => date !== undefined);
      
      acc[key] = {
        questionCount: queries.length,
        responseCount: responses.length,
        lastBatchDate: responseDates.length > 0 
          ? new Date(Math.max(...responseDates.map(d => new Date(d).getTime()))).toISOString()
          : null
      };
    });
    return acc;
  }, {});
} 