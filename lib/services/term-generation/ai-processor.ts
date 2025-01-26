import type { CompanyData } from './company-data'
import type { KeywordSuggestion } from './moz-keywords'
import { createClient } from '@/app/supabase/server'

export interface ProcessedTerm {
  term: string;
  confidence: number;
  source: 'AI';
  category: 'company' | 'product' | 'technology' | 'competitor' | 'industry' | 'keyword';
  estimatedVolume: number;
  estimatedRelevance: number;
  estimatedDifficulty: number;
}

async function getPrompt(name: string, type: 'system' | 'user'): Promise<string> {
  const supabase = await createClient();
  const { data: prompt, error } = await supabase
    .from('prompts')
    .select('prompt_text')
    .eq('name', `AIO Terms Generator v1.0 - ${type}`)
    .eq('is_active', true)
    .single();

  if (error || !prompt) {
    throw new Error(`No active prompt found for AIO Terms Generator v1.0 - ${type}`);
  }

  return prompt.prompt_text;
}

function generateUserPrompt(companyData: CompanyData, mozSuggestions: KeywordSuggestion[]): string {
  // Format competitors
  const competitors = companyData.competitors?.map(c => c.competitor_name).join(', ') || 'None provided';
  
  // Format keywords with metrics
  const keywordsList = mozSuggestions.map(s => 
    `${s.keyword} (volume: ${s.volume || 'N/A'}, relevance: ${s.relevance}, difficulty: ${s.difficulty || 'N/A'})`
  ).join('\n');

  return `Company Name: ${companyData.name}
Industry: ${companyData.industry || 'Not specified'}
Product Category: ${companyData.product_category || 'Not specified'}
Competitors: ${competitors}

Current Keywords and Metrics:
${keywordsList}`;
}

export async function processTermsWithAI(
  companyData: CompanyData,
  mozSuggestions: KeywordSuggestion[]
): Promise<ProcessedTerm[]> {
  try {
    // Get prompts from database
    const systemPrompt = await getPrompt('AIO Terms Generator v1.0', 'system');
    const userPromptTemplate = await getPrompt('AIO Terms Generator v1.0', 'user');
    
    // Generate user prompt with company data
    const userPrompt = generateUserPrompt(companyData, mozSuggestions);

    // Prepare the API request
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 4096
      })
    });

    if (!response.ok) {
      throw new Error(`Deepseek API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Parse the JSON response from the AI
    let processedTerms: ProcessedTerm[] = [];
    try {
      console.log('Raw AI response content:', data.choices[0].message.content);
      const aiSuggestions = JSON.parse(data.choices[0].message.content);
      processedTerms = aiSuggestions.map((suggestion: any) => ({
        term: suggestion.term,
        confidence: suggestion.confidence,
        category: suggestion.category,
        estimatedVolume: suggestion.estimatedVolume,
        estimatedRelevance: suggestion.estimatedRelevance,
        estimatedDifficulty: suggestion.estimatedDifficulty,
        source: 'AI' as const
      }));
    } catch (error) {
      console.error('Error parsing AI response:', error);
      throw new Error('Failed to parse AI suggestions');
    }

    // Filter out low confidence terms and duplicates
    const highConfidenceTerms = processedTerms.filter(term => term.confidence > 0.6);
    
    // Remove duplicates based on term
    const uniqueTerms = Array.from(
      new Map(highConfidenceTerms.map(term => [term.term, term])).values()
    );

    // Sort by confidence and limit to 20 terms
    return uniqueTerms
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 20);
  } catch (error) {
    console.error('Error processing terms with AI:', error);
    throw error;
  }
} 