import { createClient } from "@/app/supabase/client"
import type { AIOverviewResult, AnalysisProgress } from "./types"

const BATCH_SIZE = 3 // Process 3 terms at a time to avoid rate limits
const DELAY_BETWEEN_BATCHES = 1000 // 1 second delay between batches

interface Term {
  id: number
  term: string
}

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function analyzeTerm(
  termId: number,
  term: string,
  companyId: number,
  accountId: string,
  isSuperAdmin: boolean
): Promise<AIOverviewResult> {
  const response = await fetch('/api/ai-overview-analysis', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      termId,
      term,
      companyId,
      accountId,
      isSuperAdmin
    })
  })

  if (!response.ok) {
    throw new Error('Failed to analyze term')
  }

  return response.json()
}

export async function analyzeTerms(
  termIds: number[],
  companyId: number,
  accountId: string,
  onProgress?: (progress: AnalysisProgress) => void,
  isSuperAdmin: boolean = false
): Promise<AIOverviewResult[]> {
  // Get terms data
  const supabase = createClient()
  
  // Build query with company_id filter
  let query = supabase
    .from('ai_overview_terms_test')
    .select('id, term')
    .in('id', termIds)
    .eq('company_id', companyId)

  // Add account filter for non-super admins
  if (!isSuperAdmin) {
    query = query.eq('account_id', accountId)
  }

  const { data: terms } = await query

  if (!terms?.length) {
    throw new Error('No terms found')
  }

  const results: AIOverviewResult[] = []
  let completed = 0

  // Process terms in batches
  for (let i = 0; i < terms.length; i += BATCH_SIZE) {
    const batch = terms.slice(i, i + BATCH_SIZE)
    const batchPromises = batch.map(term => 
      analyzeTerm(term.id, term.term, companyId, accountId, isSuperAdmin)
    )

    const batchResults = await Promise.all(batchPromises)
    results.push(...batchResults)
    completed += batch.length

    if (onProgress) {
      onProgress({
        completed,
        total: terms.length,
        results
      })
    }

    if (i + BATCH_SIZE < terms.length) {
      await delay(DELAY_BETWEEN_BATCHES)
    }
  }

  return results
} 