"use server";

import { generateQuestionsForAllPersonas } from "@/lib/actions/generate-questions-batch";
import { generateICPs } from "@/lib/actions/generate-icps";
import { AIModelType } from "@/lib/services/ai/types";
import { generateQuestions } from "@/lib/actions/generate-questions";
import { processQueriesWithEngines } from "@/lib/actions/generate-questions";
import { SupabaseBatchTrackingService } from "@/lib/services/batch-tracking";
import { createAdminClient } from "@/app/supabase/server";
import { ResponseAnalysisQueue } from "@/lib/batch-processing/queue";

export interface EngineSelection {
  perplexity: boolean;
  gemini: boolean;
  claude: boolean;
  openai: boolean;
  google_search: boolean;
}

export interface ResultRow {
  buyer_journey_phase: string;
  query_text: string;
  responses: {
    [key: string]: {
      response_text: string;
      citations?: string[];
    } | null;
  };
}

export interface ModelSelection {
  icpModel: AIModelType;
  questionModel: AIModelType;
}

export interface PromptSelection {
  icpSystemPrompt: string;
  icpUserPrompt: string;
  questionSystemPrompt: string;
  questionUserPrompt: string;
}

export async function generateQuestionsAction(
  companyName: string,
  engines: EngineSelection,
  systemPromptName: string,
  userPromptName: string,
  model: AIModelType = 'gpt-4-turbo-preview',
  personaId?: number
) {
  try {
    if (personaId) {
      return await generateQuestions(
        companyName,
        engines,
        personaId,
        systemPromptName,
        userPromptName,
        model
      );
    } else {
      await generateQuestionsForAllPersonas(
        companyName,
        engines,
        systemPromptName,
        userPromptName,
        model
      );
    }
  } catch (error) {
    console.error('Error in generateQuestionsAction:', error);
    throw error;
  }
}

export async function generateICPsAction(
  companyName: string,
  icpSystemPrompt: string,
  icpUserPrompt: string,
  questionSystemPrompt: string,
  questionUserPrompt: string,
  engines: EngineSelection,
  modelSelection: ModelSelection
) {
  try {
    const icps = await generateICPs(
      companyName, 
      icpSystemPrompt, 
      icpUserPrompt,
      modelSelection.icpModel
    );
    
    await generateQuestionsForAllPersonas(
      companyName, 
      engines,
      questionSystemPrompt,
      questionUserPrompt,
      modelSelection.questionModel
    );

    return icps;
  } catch (error) {
    console.error('Error in generateICPsAction:', error);
    throw error;
  }
}

export async function generateResponsesAction(
  companyId: number,
  personaIds: number[],
  engines: EngineSelection,
  model: AIModelType = 'gpt-4-turbo-preview'
) {
  try {
    const adminClient = createAdminClient();
    const batchTracker = new SupabaseBatchTrackingService();

    // Create a new response batch
    const responseBatchId = await batchTracker.createBatch('response', companyId, {
      model,
      engines: Object.keys(engines).filter(k => engines[k as keyof typeof engines])
    });

    // Get existing questions for selected personas
    const { data: existingQueries, error: queriesError } = await adminClient
      .from('queries')
      .select('id, query_text, buyer_journey_phase')
      .in('persona_id', personaIds)
      .eq('company_id', companyId);

    if (queriesError) throw queriesError;
    if (!existingQueries?.length) {
      throw new Error('No existing questions found for selected personas');
    }

    // Generate new responses using existing questions
    await processQueriesWithEngines(
      existingQueries,
      engines,
      responseBatchId
    );

    // Initialize queue processing for the new responses
    const queue = new ResponseAnalysisQueue();
    const { data: responseRange } = await adminClient
      .from('responses')
      .select('id')
      .eq('response_batch_id', responseBatchId)
      .order('id', { ascending: true });

    if (responseRange?.length) {
      const startId = responseRange[0].id;
      const endId = responseRange[responseRange.length - 1].id;
      await queue.processQueue(startId, endId, companyId);
    }

    return {
      success: true,
      questionsCount: existingQueries.length
    };
  } catch (error) {
    console.error('Error in generateResponsesAction:', error);
    throw error;
  }
}