'use server'

import { generateQuestions } from '@/lib/actions/generate-questions'
import type { EngineSelection } from '@/app/company-actions'

export async function generateQuestionsAction(
  companyName: string,
  personaId: number,
  accountId: string,
  productId: number
) {
  console.log('🔍 Generate Action - Received:', {
    productId: {
      value: productId,
      type: typeof productId,
      isZero: productId === 0
    },
    companyName,
    personaId,
    accountId
  });

  if (!productId) {
    throw new Error('Product ID is required');
  }

  const engines: EngineSelection = {
    perplexity: false,
    gemini: false,
    claude: false,
    openai: false,
    google_search: false
  }

  const result = await generateQuestions(
    companyName,
    engines,
    personaId,
    "Questions v1.13- system",
    "Questions v1.13- user",
    'claude-3.5-sonnet',
    accountId,
    productId
  );

  console.log('🔍 Generate Action - After Generate:', {
    productId,
    queryCount: result.queries.length,
    firstQueryId: result.queries[0]?.id
  });

  return result;
} 