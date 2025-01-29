import { getCompanyData, type CompanyData } from './company-data'
import { generateKeywordSuggestions, type KeywordSuggestion } from './moz-keywords'
import { processTermsWithAI, type ProcessedTerm } from './ai-processor'
import { createClient } from '@/app/supabase/server'
import type { Database } from '@/types/supabase'

export type GeneratedTerm = {
  term: string;
  confidence: number;
  source: 'MOZ' | 'AI';
  category: 'company' | 'product' | 'technology' | 'competitor' | 'industry' | 'keyword';
  estimatedVolume: number;
  estimatedRelevance: number;
  estimatedDifficulty: number;
}

export interface GenerateTermsOptions {
  limit?: number;  // Max number of terms to return
  minConfidence?: number;  // Minimum confidence score (0-1)
  productId?: number | null;
}

export async function generateTerms(
  companyId: number,
  accountId: string,
  options: GenerateTermsOptions = {}
): Promise<GeneratedTerm[]> {
  const {
    limit = 20,
    minConfidence = 0.7,
    productId
  } = options;

  try {
    // Step 1: Get company data
    console.log('Fetching company data...');
    const companyData = await getCompanyData(companyId, accountId);

    // Step 2: Generate MOZ suggestions (used only as input for AI)
    console.log('Generating MOZ suggestions for AI input...');
    const mozSuggestions = await generateKeywordSuggestions(companyData);

    // Step 3: Process with AI using company data and MOZ suggestions
    console.log('Processing terms with AI...');
    const aiTerms = await processTermsWithAI(companyData, mozSuggestions);

    // Step 4: Filter and sort only AI-generated terms
    const filteredTerms = aiTerms
      .filter(term => term.confidence >= minConfidence)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, limit);

    // Save the generated terms
    await saveGeneratedTerms(filteredTerms, companyId, accountId, productId);

    return filteredTerms;

  } catch (error) {
    console.error('Error generating terms:', error);
    throw error;
  }
}

export async function saveGeneratedTerms(
  terms: GeneratedTerm[],
  companyId: number,
  accountId: string,
  productId?: number | null
): Promise<void> {
  const supabase = await createClient();

  // Prepare terms for insertion (only AI-generated terms)
  const termsToInsert: Database['public']['Tables']['ai_overview_terms_test']['Insert'][] = terms.map(term => ({
    term: term.term,
    company_id: companyId,
    account_id: accountId,
    source: term.source,
    status: 'ACTIVE',
    estimated_volume: term.estimatedVolume,
    estimated_relevance: term.estimatedRelevance,
    estimated_difficulty: term.estimatedDifficulty,
    product_id: productId || null
  }));

  // Insert terms
  const { error } = await supabase
    .from('ai_overview_terms_test')
    .insert(termsToInsert);

  if (error) {
    console.error('Error saving generated terms:', error);
    throw new Error('Failed to save generated terms');
  }
} 