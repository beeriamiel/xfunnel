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

export async function fetchPersonaStats(companyId: number, productId?: number): Promise<StatsMap> {
  if (!companyId || isNaN(companyId)) {
    console.error('Invalid company ID provided:', companyId);
    return {};
  }

  const supabase = createClient();
  console.log('Fetching stats for company:', companyId, 'product:', productId);

  // First get ICPs for this company
  const { data: icpData, error: icpError } = await supabase
    .from('ideal_customer_profiles')
    .select('id')
    .eq('company_id', companyId);

  if (icpError) {
    console.error('Error fetching ICPs:', icpError);
    return {};
  }

  if (!icpData?.length) {
    console.log('No ICPs found for company:', companyId);
    return {};
  }

  const icpIds = icpData.map(icp => icp.id);
  console.log('Found ICP IDs:', icpIds);

  // Build the query
  let query = supabase
    .from('personas')
    .select(`
      id,
      icp_id,
      queries!left (
        id,
        responses!left (
          id,
          response_batch_id
        )
      )
    `)
    .in('icp_id', icpIds);

  // If productId is provided, filter queries by product
  if (productId) {
    query = query.eq('queries.product_id', productId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching persona stats:', error);
    console.error('Error details:', error.message, error.details);
    return {};
  }

  // Debug log to see what we're getting
  console.log('Raw query result:', JSON.stringify(data, null, 2));

  // Get all batch IDs
  const batchIds = (data || []).flatMap(persona => 
    (persona.queries || []).flatMap(q => 
      (q.responses || []).map(r => r.response_batch_id)
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
  return (data || []).reduce((acc: StatsMap, persona) => {
    const key = `${persona.icp_id}-${persona.id}`;
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
    return acc;
  }, {});
} 