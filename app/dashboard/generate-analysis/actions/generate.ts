'use server'

import { generateQuestions } from '@/lib/actions/generate-questions'
import type { EngineSelection } from '@/app/company-actions'

export async function generateQuestionsAction(
  companyName: string,
  personaId: number,
  accountId: string
) {
  const engines: EngineSelection = {
    perplexity: false,
    gemini: false,
    claude: false,
    openai: false,
    google_search: false
  }

  return generateQuestions(
    companyName,
    engines,
    personaId,
    "Questions v1.13- system",
    "Questions v1.13- user",
    'claude-3.5-sonnet',
    accountId
  )
} 