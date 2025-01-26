import { fetchKeywordSuggestions, fetchKeywordMetrics } from '@/lib/clients/moz'
import type { CompanyData } from './company-data'

export interface KeywordSuggestion {
  keyword: string;
  relevance: number;
  volume?: number;
  difficulty?: number;
  source: 'MOZ';
}

/**
 * Generates seed terms from company data to use for keyword suggestions
 */
function generateSeedTerms(companyData: CompanyData): string[] {
  const seeds: string[] = [];
  
  // Add company name
  seeds.push(companyData.name);
  
  // Add up to 2 product terms
  if (companyData.main_products?.length > 0) {
    seeds.push(...companyData.main_products.slice(0, 2));
  }

  // Add industry if available
  if (companyData.industry) {
    seeds.push(companyData.industry);
  }

  // Add up to 2 competitor names
  if (companyData.competitors?.length > 0) {
    seeds.push(...companyData.competitors.slice(0, 2).map(c => c.competitor_name));
  }

  // Add AI variations only for company name and industry
  const aiTerms = [companyData.name, companyData.industry].filter(Boolean).map(term => `${term} AI`);
  
  return [...seeds, ...aiTerms].slice(0, 5); // Limit to max 5 seed terms
}

export async function generateKeywordSuggestions(companyData: CompanyData): Promise<KeywordSuggestion[]> {
  // Generate seed terms from company data
  const seedTerms = generateSeedTerms(companyData);
  
  console.log('Generated seed terms for MOZ API:', seedTerms);

  // Fetch suggestions for each seed term
  const suggestions: KeywordSuggestion[] = [];
  
  for (const term of seedTerms) {
    try {
      // Get keyword suggestions - limit to 5 per term
      const response = await fetchKeywordSuggestions(term, {
        limit: 5, // Reduced from 10 to 5
        locale: 'en-US'
      });

      if (response.suggestions?.length > 0) {
        // Get metrics for each suggestion
        for (const suggestion of response.suggestions) {
          try {
            const metrics = await fetchKeywordMetrics(suggestion.keyword);
            const termSuggestion = {
              keyword: suggestion.keyword,
              relevance: suggestion.relevance,
              volume: metrics.keyword_metrics.volume,
              difficulty: metrics.keyword_metrics.difficulty,
              source: 'MOZ' as const
            };
            suggestions.push(termSuggestion);
          } catch (metricsError) {
            console.error(`Error fetching metrics for keyword "${suggestion.keyword}":`, metricsError);
            // Still add the suggestion without metrics
            suggestions.push({
              keyword: suggestion.keyword,
              relevance: suggestion.relevance,
              source: 'MOZ' as const
            });
          }
        }
      } else {
        console.log(`No suggestions found for term "${term}"`);
      }
    } catch (error) {
      console.error(`Error fetching suggestions for term "${term}":`, error);
      // Continue with other terms even if one fails
      continue;
    }
  }

  // Remove duplicates based on keyword
  const uniqueSuggestions = Array.from(
    new Map(suggestions.map(s => [s.keyword, s])).values()
  );

  // Sort by relevance and limit total suggestions
  return uniqueSuggestions
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 10); // Limit total suggestions to 10
} 