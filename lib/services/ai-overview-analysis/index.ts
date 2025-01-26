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
  accountId: string
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
      accountId
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
  onProgress?: (progress: AnalysisProgress) => void
): Promise<AIOverviewResult[]> {
  // Get terms data
  const supabase = createClient()
  const { data: terms } = await supabase
    .from('ai_overview_terms_test')
    .select('id, term')
    .in('id', termIds)

  if (!terms) return []

  const results: AIOverviewResult[] = []
  
  // Process in batches
  for (let i = 0; i < terms.length; i += BATCH_SIZE) {
    const batch = terms.slice(i, i + BATCH_SIZE)
    
    // Process batch in parallel
    const batchResults = await Promise.all(
      batch.map(term => analyzeTerm(term.id, term.term, companyId, accountId))
    )
    
    // Update progress
    results.push(...batchResults)
    onProgress?.({
      completed: results.length,
      total: terms.length,
      results
    })
    
    // Delay before next batch
    if (i + BATCH_SIZE < terms.length) {
      await delay(DELAY_BETWEEN_BATCHES)
    }
  }
  
  return results
} 