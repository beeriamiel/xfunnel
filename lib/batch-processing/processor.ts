import { createAdminClient } from "@/app/supabase/server";
import { analyzeResponse, Response } from "./analysis";
import { Database } from "@/types/supabase";
import { processCitationsTransaction } from './citation-processor';

type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

type ResponseAnalysisInsert = Omit<Database['public']['Tables']['response_analysis']['Insert'], 'id'> & {
  citations_parsed: Json;
  competitors_list: string[];
  mentioned_companies: string[];
  solution_analysis?: Json | null;
  icp_vertical?: string | null;
};

type SupabaseResponse<T> = {
  data: T[] | null;
  error: any;
  count: number | null;
  status: number;
  statusText: string;
};

type SingleSupabaseResponse<T> = {
  data: T | null;
  error: any;
  count: number | null;
  status: number;
  statusText: string;
};

// Raw response type matching Supabase's structure
type RawResponse = {
  id: number;
  query_id: number | null;
  response_text: string;
  answer_engine: string | null;
  url: string | null;
  created_at: string | null;
  citations: string[] | null;
  websearchqueries: string[] | null;
  query: {
    id: number;
    query_text: string;
    buyer_journey_phase: string[] | null;
    company_id: number | null;
    persona_id: number | null;
    prompt_id: number | null;
    user_id: number | null;
    created_at: string | null;
    company: {
      id: number;
      name: string;
      industry: string | null;
      created_at: string | null;
      ideal_customer_profiles: Array<{
        id: number;
        vertical: string;
        region: string;
        company_size: string;
      }>;
      competitors: Array<{
        competitor_name: string;
      }>;
    }[];
    persona: {
      id: number;
      title: string;
      department: string;
      icp: {
        id: number;
        vertical: string;
        region: string;
        company_size: string;
      };
    };
  }[];
};

// Transform raw response to our Response type
function transformResponse(raw: RawResponse): Response {
  const queryData = Array.isArray(raw.query) ? raw.query[0] : raw.query;

  if (!queryData) {
    throw new Error(`Response ${raw.id} has no associated query`);
  }

  // Add debug logging
  console.log('Transform - Raw query data:', {
    responseId: raw.id,
    personaData: queryData.persona,
    personaIcp: queryData.persona?.icp,  // Log ICP data
    vertical: queryData.persona?.icp?.vertical  // Log specific field
  });

  const companyData = Array.isArray(queryData.company) ? queryData.company[0] : queryData.company;
  if (!companyData) {
    throw new Error(`Response ${raw.id} has no associated company`);
  }

  const transformedResponse = {
    id: raw.id,
    query_id: raw.query_id,
    response_text: raw.response_text,
    answer_engine: raw.answer_engine,
    url: raw.url,
    created_at: raw.created_at,
    citations: raw.citations,
    web_search_queries: raw.websearchqueries,
    query: {
      ...queryData,
      company_id: companyData.id,
      company: companyData,
      persona: queryData.persona,  // Preserve the entire persona object with ICP
      competitors: companyData.competitors || []
    }
  };

  // Add debug logging
  console.log('Transform - Final response:', {
    responseId: raw.id,
    hasPersona: !!transformedResponse.query.persona,
    hasIcp: !!transformedResponse.query.persona?.icp,
    vertical: transformedResponse.query.persona?.icp?.vertical
  });

  return transformedResponse;
}

export async function processNewResponses() {
  const adminClient = createAdminClient();
  
  try {
    const result = await adminClient
      .from('responses')
      .select(`
        *,
        query:queries!inner (
          id,
          buyer_journey_phase,
          query_text,
          persona:personas!inner (
            id,
            title,
            department,
            icp:ideal_customer_profiles!inner (
              id,
              vertical,
              region,
              company_size
            )
          ),
          company:companies!inner (
            id,
            name,
            industry
          )
        ),
        response_analysis!left (*)
      `)
      .is('response_analysis.id', null)
      .order('created_at', { ascending: false }) as SupabaseResponse<RawResponse>;
    
    const { data: responseData, error: fetchError } = result;

    if (fetchError) throw fetchError;
    if (!responseData || responseData.length === 0) {
      console.log('No new responses to process');
      return;
    }

    console.log(`Processing ${responseData.length} new responses`);

    for (const rawResponse of responseData) {
      try {
        console.log(`Processing response ${rawResponse.id} with citations:`, rawResponse.citations);
        const response = transformResponse(rawResponse);
        console.log(`Transformed response citations:`, response.citations);
        const analysis = await analyzeResponse(response);
        console.log(`Analysis citations_parsed:`, analysis.citations_parsed);
        
        const queryData = Array.isArray(response.query) ? response.query[0] : response.query;
        if (!queryData?.company) {
          console.error(`Missing company data for response ${rawResponse.id}`);
          continue;
        }

        const companyData = Array.isArray(queryData.company) ? queryData.company[0] : queryData.company;
        if (!companyData) {
          console.error(`Invalid company data for response ${rawResponse.id}`);
          continue;
        }

        const icp_vertical = queryData.persona?.icp?.vertical || 
                           queryData.company?.ideal_customer_profiles?.[0]?.vertical || 
                           null;

        // Store original citations_parsed before stringifying
        const originalCitationsParsed = analysis.citations_parsed;

        const analysisData: ResponseAnalysisInsert = {
          response_id: response.id,
          citations_parsed: originalCitationsParsed ? JSON.stringify(originalCitationsParsed) : null,
          recommended: analysis.recommended,
          cited: analysis.cited,
          sentiment_score: analysis.sentiment_score,
          ranking_position: analysis.ranking_position,
          company_mentioned: analysis.company_mentioned,
          geographic_region: analysis.geographic_region,
          industry_vertical: analysis.industry_vertical,
          icp_vertical: icp_vertical,
          buyer_persona: analysis.buyer_persona,
          buying_journey_stage: analysis.buying_journey_stage,
          response_text: response.response_text,
          rank_list: analysis.rank_list,
          company_id: companyData.id,
          answer_engine: response.answer_engine || 'unknown',
          query_text: queryData.query_text,
          query_id: queryData.id,
          company_name: companyData.name,
          mentioned_companies: analysis.mentioned_companies,
          competitors_list: analysis.competitors_list,
          solution_analysis: analysis.solution_analysis ? 
            JSON.stringify(analysis.solution_analysis) : null
        };

        const { data: insertedData, error: insertError } = await adminClient
          .from('response_analysis')
          .insert(analysisData)
          .select('*')
          .single();

        if (insertError) {
          console.error('Insert error details:', {
            error: insertError,
            data: {
              responseId: response.id,
              icp_vertical: analysisData.icp_vertical
            }
          });
          console.error(`Error storing analysis for response ${rawResponse.id}:`, insertError);
          continue;
        }

        try {
          console.log(`Starting citation processing for response ${rawResponse.id}:`, {
            hasInsertedData: !!insertedData,
            citationsParsed: originalCitationsParsed,
            responseAnalysisId: insertedData?.id
          });
          
          await processCitationsTransaction(insertedData, originalCitationsParsed);
          
          console.log(`Completed citation processing for response ${rawResponse.id}`);
        } catch (citationError) {
          console.error(`Error processing citations for response ${rawResponse.id}:`, citationError);
        }

        console.log(`Successfully processed response ${rawResponse.id} with citations`);
      } catch (error) {
        console.error(`Error processing response ${rawResponse.id}:`, error);
        continue;
      }
    }

    console.log('Batch processing completed');
  } catch (error) {
    console.error('Batch processing error:', error);
    throw error;
  }
}

export async function processAllResponses() {
  const adminClient = createAdminClient();
  
  try {
    // Clear existing analysis
    await adminClient
      .from('response_analysis')
      .delete()
      .neq('response_id', 0);

    // Get all responses with their queries
    const result = await adminClient
      .from('responses')
      .select(`
        *,
        query:queries!inner (
          id,
          buyer_journey_phase,
          query_text,
          persona:personas!inner (
            id,
            title,
            department,
            icp:ideal_customer_profiles!inner (
              id,
              vertical,
              region,
              company_size
            )
          ),
          company:companies!inner (
            id,
            name,
            industry
          )
        )
      `)
      .order('created_at', { ascending: false }) as SupabaseResponse<RawResponse>;

    const { data: responseData, error: fetchError } = result;

    if (fetchError) throw fetchError;
    if (!responseData || responseData.length === 0) {
      console.log('No responses to process');
      return;
    }

    console.log(`Processing all ${responseData.length} responses`);

    // Process each response
    for (const rawResponse of responseData) {
      try {
        console.log(`Processing response ${rawResponse.id} with citations:`, rawResponse.citations);
        const response = transformResponse(rawResponse);
        console.log(`Transformed response citations:`, response.citations);
        const analysis = await analyzeResponse(response);
        console.log(`Analysis citations_parsed:`, analysis.citations_parsed);
        
        // Get company data from the query
        const queryData = Array.isArray(response.query) ? response.query[0] : response.query;
        if (!queryData?.company) {
          console.error(`Missing company data for response ${rawResponse.id}`);
          continue;
        }

        const companyData = Array.isArray(queryData.company) ? queryData.company[0] : queryData.company;
        if (!companyData) {
          console.error(`Invalid company data for response ${rawResponse.id}`);
          continue;
        }

        const icp_vertical = queryData.persona?.icp?.vertical || 
                           queryData.company?.ideal_customer_profiles?.[0]?.vertical || 
                           null;

        console.log('ICP Vertical Debug - Value Resolution:', {
          responseId: response.id,
          rawValue: icp_vertical,
          fromPersona: queryData.persona?.icp?.vertical,
          fromCompany: queryData.company?.ideal_customer_profiles?.[0]?.vertical,
          personaExists: !!queryData.persona,
          icpExists: !!queryData.persona?.icp,
          companyExists: !!queryData.company,
          companyIcpsExist: !!queryData.company?.ideal_customer_profiles
        });

        // Store original citations_parsed before stringifying
        const originalCitationsParsed = analysis.citations_parsed;

        const analysisData: ResponseAnalysisInsert = {
          response_id: response.id,
          citations_parsed: originalCitationsParsed ? JSON.stringify(originalCitationsParsed) : null,
          recommended: analysis.recommended,
          cited: analysis.cited,
          sentiment_score: analysis.sentiment_score,
          ranking_position: analysis.ranking_position,
          company_mentioned: analysis.company_mentioned,
          geographic_region: analysis.geographic_region,
          industry_vertical: analysis.industry_vertical,
          icp_vertical: icp_vertical,
          buyer_persona: analysis.buyer_persona,
          buying_journey_stage: analysis.buying_journey_stage,
          response_text: response.response_text,
          rank_list: analysis.rank_list,
          company_id: companyData.id,
          answer_engine: response.answer_engine || 'unknown',
          query_text: queryData.query_text,
          query_id: queryData.id,
          company_name: companyData.name,
          mentioned_companies: analysis.mentioned_companies,  
          competitors_list: analysis.competitors_list,
          solution_analysis: analysis.solution_analysis ? 
            JSON.stringify(analysis.solution_analysis) : null,
        };

        console.log('ICP Vertical Debug - Pre-Insert Object:', {
          responseId: response.id,
          hasIcpVertical: 'icp_vertical' in analysisData,
          icpVerticalValue: analysisData.icp_vertical,
          icpVerticalType: typeof analysisData.icp_vertical,
          isNull: analysisData.icp_vertical === null,
          isUndefined: analysisData.icp_vertical === undefined,
          stringified: JSON.stringify({ icp_vertical: analysisData.icp_vertical })
        });

        const { data: insertedData, error: insertError } = await adminClient
          .from('response_analysis')
          .insert(analysisData)
          .select('*')
          .single();

        console.log('ICP Vertical Debug - Post-Insert:', {
          responseId: response.id,
          insertedIcpVertical: insertedData?.icp_vertical,
          originalIcpVertical: analysisData.icp_vertical,
          insertError: insertError ? {
            message: insertError.message,
            details: insertError.details,
            hint: insertError.hint,
            code: insertError.code
          } : null,
          rawInsertedData: insertedData ? {
            ...insertedData,
            hasIcpVertical: 'icp_vertical' in (insertedData || {}),
            icpVerticalExists: insertedData.hasOwnProperty('icp_vertical')
          } : null
        });

        if (insertError) {
          console.error('Insert error details:', {
            error: insertError,
            data: {
              responseId: response.id,
              icp_vertical: analysisData.icp_vertical
            }
          });
          console.error(`Error storing analysis for response ${rawResponse.id}:`, insertError);
          continue;
        }

        try {
          console.log(`Starting citation processing for response ${rawResponse.id}:`, {
            hasInsertedData: !!insertedData,
            citationsParsed: originalCitationsParsed,
            responseAnalysisId: insertedData?.id
          });
          
          await processCitationsTransaction(insertedData, originalCitationsParsed);
          
          console.log(`Completed citation processing for response ${rawResponse.id}`);
        } catch (citationError) {
          console.error(`Error processing citations for response ${rawResponse.id}:`, citationError);
        }

        console.log(`Successfully processed response ${rawResponse.id} with citations`);
      } catch (error) {
        console.error(`Error processing response ${rawResponse.id}:`, error);
        continue;
      }
    }

    console.log('Full reprocessing completed');
  } catch (error) {
    console.error('Processing error:', error);
    throw error;
  }
}

export async function testProcessSingleResponse(responseText: string) {
  const adminClient = createAdminClient();
  
  try {
    // 1. Get an existing query
    const result = await adminClient
      .from('queries')
      .select(`
        *,
        companies!inner (*),
        personas!queries_persona_id_fkey (
          *,
          ideal_customer_profiles!personas_icp_id_fkey (*)
        )
      `)
      .limit(1) as SupabaseResponse<any>;

    const { data: queries, error: queryError } = result;

    if (queryError) {
      console.error('Error fetching queries:', queryError);
      throw queryError;
    }

    if (!queries || queries.length === 0) {
      throw new Error('No existing queries found to test with');
    }

    const query = queries[0];

    // 2. Create test response
    const insertResult = await adminClient
      .from('responses')
      .insert({
        response_text: responseText,
        answer_engine: 'claude',
        citations: ['https://docs.example.com/test', 'https://blog.example.com/test'],
        query_id: query.id
      })
      .select(`
        *,
        query:queries!inner (
          id,
          buyer_journey_phase,
          query_text,
          persona:personas!inner (
            id,
            title,
            department,
            icp:ideal_customer_profiles!inner (
              id,
              vertical,
              region,
              company_size
            )
          ),
          company:companies!inner (
            id,
            name,
            industry
          )
        )
      `)
      .single() as SingleSupabaseResponse<RawResponse>;

    const { data: rawResponse, error: createError } = insertResult;

    if (createError || !rawResponse) {
      console.error('Error creating test response:', createError);
      throw createError;
    }

    // 3. Process the response
    const response = transformResponse(rawResponse);
    const analysis = await analyzeResponse(response);
    
    // Get company data from the query
    const queryData = Array.isArray(response.query) ? response.query[0] : response.query;
    if (!queryData?.company) {
      throw new Error('Missing company data for response');
    }

    const companyData = Array.isArray(queryData.company) ? queryData.company[0] : queryData.company;
    if (!companyData) {
      throw new Error('Invalid company data for response');
    }

    const icp_vertical = queryData.persona?.icp?.vertical || 
                       queryData.company?.ideal_customer_profiles?.[0]?.vertical || 
                       null;

    console.log('ICP Vertical Debug - Value Resolution:', {
      responseId: response.id,
      rawValue: icp_vertical,
      fromPersona: queryData.persona?.icp?.vertical,
      fromCompany: queryData.company?.ideal_customer_profiles?.[0]?.vertical,
      personaExists: !!queryData.persona,
      icpExists: !!queryData.persona?.icp,
      companyExists: !!queryData.company,
      companyIcpsExist: !!queryData.company?.ideal_customer_profiles
    });

    // Store original citations_parsed before stringifying
    const originalCitationsParsed = analysis.citations_parsed;

    const analysisData: ResponseAnalysisInsert = {
      response_id: response.id,
      citations_parsed: originalCitationsParsed ? JSON.stringify(originalCitationsParsed) : null,
      recommended: analysis.recommended,
      cited: analysis.cited,
      sentiment_score: analysis.sentiment_score,
      ranking_position: analysis.ranking_position,
      company_mentioned: analysis.company_mentioned,
      geographic_region: analysis.geographic_region,
      industry_vertical: analysis.industry_vertical,
      icp_vertical: icp_vertical,
      buyer_persona: analysis.buyer_persona,
      buying_journey_stage: analysis.buying_journey_stage,
      response_text: response.response_text,
      rank_list: analysis.rank_list,
      company_id: companyData.id,
      answer_engine: response.answer_engine || 'unknown',
      query_text: queryData.query_text,
      query_id: queryData.id,
      company_name: companyData.name,
      mentioned_companies: analysis.mentioned_companies,  
      competitors_list: analysis.competitors_list,
      solution_analysis: analysis.solution_analysis ? 
        JSON.stringify(analysis.solution_analysis) : null,
    };

    console.log('ICP Vertical Debug - Pre-Insert Object:', {
      responseId: response.id,
      hasIcpVertical: 'icp_vertical' in analysisData,
      icpVerticalValue: analysisData.icp_vertical,
      icpVerticalType: typeof analysisData.icp_vertical,
      isNull: analysisData.icp_vertical === null,
      isUndefined: analysisData.icp_vertical === undefined,
      stringified: JSON.stringify({ icp_vertical: analysisData.icp_vertical })
    });

    const { data: insertedData, error: insertError } = await adminClient
      .from('response_analysis')
      .insert(analysisData)
      .select('*')
      .single();

    console.log('ICP Vertical Debug - Post-Insert:', {
      responseId: response.id,
      insertedIcpVertical: insertedData?.icp_vertical,
      originalIcpVertical: analysisData.icp_vertical,
      insertError: insertError ? {
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
        code: insertError.code
      } : null,
      rawInsertedData: insertedData ? {
        ...insertedData,
        hasIcpVertical: 'icp_vertical' in (insertedData || {}),
        icpVerticalExists: insertedData.hasOwnProperty('icp_vertical')
      } : null
    });

    if (insertError) {
      console.error('Insert error details:', {
        error: insertError,
        data: {
          responseId: response.id,
          icp_vertical: analysisData.icp_vertical
        }
      });
      console.error(`Error storing analysis for response ${rawResponse.id}:`, insertError);
      return;
    }

    try {
      console.log(`Starting citation processing for response ${rawResponse.id}:`, {
        hasInsertedData: !!insertedData,
        citationsParsed: originalCitationsParsed,
        responseAnalysisId: insertedData?.id
      });
      
      await processCitationsTransaction(insertedData, originalCitationsParsed);
      
      console.log(`Completed citation processing for response ${rawResponse.id}`);
    } catch (citationError) {
      console.error(`Error processing citations for response ${rawResponse.id}:`, citationError);
    }

    console.log(`Successfully processed response ${rawResponse.id} with citations`);

    return analysisData;
  } catch (error) {
    console.error('Test processing error:', error);
    throw error;
  }
}

export async function testExistingResponse(responseId: number) {
  const adminClient = createAdminClient();
  
  try {
    // Get the existing response with its query and all related data
    const { data: responseData, error: responseError } = await adminClient
      .from('responses')
      .select(`
        *,
        query:queries!inner ( 
          id,
          query_text,
          buyer_journey_phase,
          persona:personas!inner (
            id,
            title,
            department,
            icp:ideal_customer_profiles!inner (
              id,
              vertical,
              region,
              company_size
            )
          ),
          company:companies!inner (
            id,
            name,
            industry
          )
        )
      `)
      .eq('id', responseId)
      .single();

    if (responseError || !responseData) {
      throw new Error(responseError?.message || 'Response not found');
    }

    // Transform the response data - cast to unknown first to handle type mismatch
    const response = transformResponse(responseData as unknown as RawResponse);
    const analysis = await analyzeResponse(response);
    
    // Get company data from the query
    const queryData = response.query;
    if (!queryData?.company) {
      throw new Error('Missing company data for response');
    }

    const companyData = Array.isArray(queryData.company) ? queryData.company[0] : queryData.company;
    if (!companyData) {
      throw new Error('Invalid company data for response');
    }

    const icp_vertical = queryData.persona?.icp?.vertical || 
                       queryData.company?.ideal_customer_profiles?.[0]?.vertical || 
                       null;

    console.log('ICP Vertical Debug - Value Resolution:', {
      responseId: response.id,
      rawValue: icp_vertical,
      fromPersona: queryData.persona?.icp?.vertical,
      fromCompany: queryData.company?.ideal_customer_profiles?.[0]?.vertical,
      personaExists: !!queryData.persona,
      icpExists: !!queryData.persona?.icp,
      companyExists: !!queryData.company,
      companyIcpsExist: !!queryData.company?.ideal_customer_profiles
    });

    // Store original citations_parsed before stringifying
    const originalCitationsParsed = analysis.citations_parsed;

    const analysisData: ResponseAnalysisInsert = {
      response_id: responseData.id,
      citations_parsed: originalCitationsParsed ? JSON.stringify(originalCitationsParsed) : null,
      recommended: analysis.recommended,
      cited: analysis.cited,
      sentiment_score: analysis.sentiment_score,
      ranking_position: analysis.ranking_position,
      company_mentioned: analysis.company_mentioned,
      geographic_region: analysis.geographic_region,
      industry_vertical: analysis.industry_vertical,
      icp_vertical: icp_vertical,
      buyer_persona: analysis.buyer_persona,
      buying_journey_stage: analysis.buying_journey_stage,
      response_text: responseData.response_text,
      rank_list: analysis.rank_list,
      company_id: queryData.company_id,
      answer_engine: responseData.answer_engine || 'unknown',
      query_text: queryData.query_text,
      query_id: queryData.id,
      company_name: companyData.name,
      mentioned_companies: analysis.mentioned_companies,  
      competitors_list: analysis.competitors_list,
      solution_analysis: analysis.solution_analysis ? 
        JSON.stringify(analysis.solution_analysis) : null,
    };

    console.log('ICP Vertical Debug - Pre-Insert Object:', {
      responseId: response.id,
      hasIcpVertical: 'icp_vertical' in analysisData,
      icpVerticalValue: analysisData.icp_vertical,
      icpVerticalType: typeof analysisData.icp_vertical,
      isNull: analysisData.icp_vertical === null,
      isUndefined: analysisData.icp_vertical === undefined,
      stringified: JSON.stringify({ icp_vertical: analysisData.icp_vertical })
    });

    const { data: insertedData, error: insertError } = await adminClient
      .from('response_analysis')
      .insert(analysisData)
      .select('*')
      .single();

    console.log('ICP Vertical Debug - Post-Insert:', {
      responseId: response.id,
      insertedIcpVertical: insertedData?.icp_vertical,
      originalIcpVertical: analysisData.icp_vertical,
      insertError: insertError ? {
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
        code: insertError.code
      } : null,
      rawInsertedData: insertedData ? {
        ...insertedData,
        hasIcpVertical: 'icp_vertical' in (insertedData || {}),
        icpVerticalExists: insertedData.hasOwnProperty('icp_vertical')
      } : null
    });

    if (insertError) {
      console.error('Insert error details:', {
        error: insertError,
        data: {
          responseId: response.id,
          icp_vertical: analysisData.icp_vertical
        }
      });
      console.error(`Error storing analysis for response ${responseData.id}:`, insertError);
      return;
    }

    try {
      console.log(`Starting citation processing for response ${responseData.id}:`, {
        hasInsertedData: !!insertedData,
        citationsParsed: originalCitationsParsed,
        responseAnalysisId: insertedData?.id
      });
      
      await processCitationsTransaction(insertedData, originalCitationsParsed);
      
      console.log(`Completed citation processing for response ${responseData.id}`);
    } catch (citationError) {
      console.error(`Error processing citations for response ${responseData.id}:`, citationError);
    }

    console.log(`Successfully processed response ${responseData.id} with citations`);

    return analysisData;
  } catch (error) {
    console.error('Test processing error:', error);
    throw error;
  }
} 