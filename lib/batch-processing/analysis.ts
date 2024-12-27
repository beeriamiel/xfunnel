import { createAdminClient } from "@/app/supabase/server";
import { Database } from "@/types/supabase";
import Anthropic from '@anthropic-ai/sdk';

// Add Claude-based ranking function
async function findRankingWithClaude(text: string, ourCompanyName: string, competitors: string[]): Promise<InternalRankingResult | null> {
  console.log("\n=== Starting findRankingWithClaude ===");
  
  const anthropic = new Anthropic({
    apiKey: process.env.CLAUDE_API_KEY,
  });

  const systemPrompt = `You are a specialized ranking extraction assistant. Your sole task is to analyze text and extract ranked lists of companies, following these rules:

1. Only respond with a numbered list of company names
2. Only include companies that are explicitly ranked or ordered in the source text
3. Maintain the exact order from the source text
4. Strip any descriptions, keeping only the company names
5. Do not add companies that weren't explicitly ranked
6. Do not reorder or change the ranking based on your own analysis
7. If there are multiple ranked lists, use the one under a "Ranking" or "Forced Ranking" header
8. If no explicit ranking exists, respond with "NO_EXPLICIT_RANKING"
9. Use the exact company names as they appear, preserving capitalization
10. Never explain or justify the ranking`;

  const userPrompt = `Extract ONLY ranked lists of company names (like Microsoft, Apple, Google) from the following text. Extract company names exactly as they appear in the text - do not assume or add any companies that aren't explicitly mentioned. Remove any text in parentheses, and special characters like ® or ™ from company names.

Priority order for rankings:
1. Sections titled "Ranking", "Forced Ranking", or "Final Ranking"
2. Numbered lists of companies (including formats like "### 1.", "1.", "#1", etc.)
3. Other ranking formats shown in examples below

Examples of valid rankings:
- "Company X outperforms Company Y and Company Z"
- "Top companies in order: Company A, Company B, Company C"
- "Platforms like Company X and Company Y provide..."
- "Solutions from Company A, Company B, and Company C..."

Examples of company name extraction:
- "Lemonade (formerly known as Metromile)" -> "Lemonade"
- "Microsoft (MSFT)" -> "Microsoft"
- "Apple Inc. (NASDAQ: AAPL)" -> "Apple Inc."
- "Company X® Solutions" -> "Company X Solutions"
- "Division Y, a part of Company Z" -> "Company Z"
- "Company X for Insurance" -> "Company X"
- "The Company Y Platform" -> "Company Y"

Do NOT include:
- Product names
- Service names
- Types of software
- Categories or descriptions
- Generic terms

If no explicit company ranking exists, respond with "NO_EXPLICIT_RANKING".

Text to analyze:
${text}`;

  try {
    console.log('Calling Claude API with text length:', text.length);
    
    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        { role: 'user', content: userPrompt }
      ],
    });

    if (!message.content[0] || message.content[0].type !== 'text') {
      console.log('No content in Claude response');
      return null;
    }

    const response = message.content[0].text.trim();
    console.log('Claude response:', response);

    if (response === 'NO_EXPLICIT_RANKING') {
      console.log('No explicit ranking found by Claude');
      return null;
    }

    // Parse the numbered list response
    const companies = response
      .split('\n')
      .map(line => {
        const match = line.match(/^\d+\.\s*(.+)$/);
        return match ? match[1].trim() : null;
      })
      .filter((name): name is string => name !== null);

    if (companies.length < 2) {
      console.log('Not enough companies found in Claude response');
      return null;
    }

    const rank_list = companies
      .map((name, index) => `${index + 1}. ${name}`)
      .join('\n');

    const ranking_position = companies.findIndex(
      name => name.toLowerCase() === ourCompanyName.toLowerCase()
    ) + 1 || null;

    return {
      rank_list,
      ranking_position,
      confidence: 1.0, // Highest confidence since it's our primary method
      method: 'claude'
    };

  } catch (error) {
    console.error('Error in Claude ranking:', error);
    return null;
  }
}

export type Response = {
  id: number;
  query_id: number | null;
  response_text: string;
  answer_engine: string | null;
  url: string | null;
  created_at: string | null;
  citations: string[] | null;
  web_search_queries: string[] | null;
  query: {
    id: number;
    company_id: number;
    query_text: string;
    prompt_id?: number | null;
    buyer_journey_phase?: string[] | null;
    persona?: {
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
    company?: {
      id: number;
      name: string;
      industry: string | null;
      created_at: string | null;
      ideal_customer_profiles?: Array<{
        id: number;
        vertical: string;
        region: string;
        company_size: string;
      }>;
      competitors?: Array<{
        competitor_name: string;
      }>;
    };
  };
};

interface AnalyzedResponse {
  response_id: number;
  citations_parsed: {
    urls: string[];
    context: string[];
    relevance: number[];
    source_types: ('Documentation' | 'Blog' | 'GitHub' | 'Guide' | 'Tutorial')[];
  } | null;
  recommended: boolean;
  cited: boolean;
  sentiment_score: number | null;
  ranking_position: number | null;
  company_mentioned: boolean;
  geographic_region: string | null;
  industry_vertical: string | null;
  icp_vertical: string | null;
  buyer_persona: string | null;
  buying_journey_stage: string | null;
  response_text: string;
  rank_list: string | null;
  competitors_list: string[];
  mentioned_companies: string[];
  solution_analysis: SolutionAnalysisResult | null;
}

interface CompanyMention {
  position: number;
  context: string;
  sentiment: number;
}

// Add new types for context importance
interface SentimentContext {
  text: string;
  position: number;
  isConclusion: boolean;
  hasComparison: boolean;
  sectionWeight: number;
}

// Update patterns with more nuanced categories
const patterns = {
  strong_positive: {
    weight: 1.0,
    terms: [
      /excellent|outstanding|exceptional|superior|ideal|perfect|best[-\s]in[-\s]class/i,
      /highly\s+recommend|strongly\s+recommend|top\s+choice|market\s+leader/i,
      /outperforms|excels|dominates|leads|innovative|cutting[-\s]edge/i
    ]
  },
  technical_praise: {
    weight: 0.8,
    terms: [
      /scalable|flexible|extensible|maintainable|reliable|robust/i,
      /well[-\s]integrated|seamless|enterprise[-\s]ready|production[-\s]grade/i,
      /high[-\s]performance|efficient|optimized|powerful/i
    ]
  },
  market_position: {
    weight: 0.6,
    terms: [
      /strong\s+contender|viable\s+option|competitive\s+choice/i,
      /growing\s+adoption|market\s+presence|established\s+solution/i,
      /industry\s+standard|widely\s+used|popular\s+choice/i
    ]
  },
  comparative: {
    weight: 0.7,
    terms: [
      /better\s+than|preferable\s+to|superior\s+to|ahead\s+of/i,
      /stronger\s+than|more\s+advanced|more\s+mature/i,
      /outperforms|exceeds|surpasses|beats/i
    ]
  }
};

// Add ranking position impact
function calculateRankingImpact(text: string, ourCompanyName: string): number {
  const rankingMatch = text.match(/\d+\.\s*\*?\*?([^:\n]+)[\n:]/i);
  if (!rankingMatch) return 0;

  const position = parseInt(rankingMatch[0]);
  if (isNaN(position)) return 0;

  // Adjust sentiment based on ranking position
  return position === 1 ? 0.3 : 
         position === 2 ? 0.1 : 
         position === 3 ? -0.1 : 
         -0.2;
}

function analyzeOurCompanySentiment(text: string, ourCompanyName: string): number | null {
  // Look for all company mentions
  const mentions: number[] = [];
  const textLower = text.toLowerCase();
  const companyLower = ourCompanyName.toLowerCase();
  let pos = textLower.indexOf(companyLower);
  
  while (pos !== -1) {
    mentions.push(pos);
    pos = textLower.indexOf(companyLower, pos + 1);
  }

  if (mentions.length === 0) return null;

  // Get complete sentences around mentions
  const contexts = mentions.map(pos => {
    const start = text.lastIndexOf('.', pos - 200) + 1;
    const end = text.indexOf('.', pos + 200) + 1;
    return {
      text: text.slice(Math.max(0, start), end),
      position: pos,
      isConclusion: /in\s+conclusion|to\s+summarize|finally|therefore/i.test(text.slice(Math.max(0, pos - 50), pos + 50)),
      hasComparison: /compared\s+to|versus|vs\.|better\s+than|worse\s+than/i.test(text.slice(Math.max(0, pos - 100), pos + 100)),
      sectionWeight: pos > text.length * 0.7 ? 1.2 : 1.0  // Weight conclusions higher
    };
  });

  let totalScore = 0;
  let validContexts = 0;

  for (const context of contexts) {
    let contextScore = 0;
    let hasValidSentiment = false;

    // Check positive patterns
    for (const [category, {weight, terms}] of Object.entries(patterns)) {
      for (const pattern of terms) {
        if (pattern.test(context.text)) {
          let score = weight;
          
          // Apply context weights
          if (context.isConclusion) score *= 1.3;
          if (context.hasComparison) score *= 1.2;
          score *= context.sectionWeight;
          
          contextScore += score;
          hasValidSentiment = true;
        }
      }
    }

    // Check negative patterns
    const negativePatterns = {
      strong_negative: {
        weight: -1.0,
        terms: [
          /terrible|awful|horrible|unusable|avoid|worst/i,
          /fails|failing|failed|unreliable|unstable|broken/i,
          /inadequate|incompetent|inferior|problematic/i
        ]
      },
      negative: {
        weight: -0.7,
        terms: [
          /poor|weak|limited|lacks|behind|outdated|insufficient/i,
          /difficult|complex|complicated|confusing|frustrating/i,
          /expensive|costly|overpriced|pricey/i
        ]
      }
    };

    // Process negative patterns
    for (const [category, {weight, terms}] of Object.entries(negativePatterns)) {
      for (const pattern of terms) {
        if (pattern.test(context.text)) {
          let score = weight;
          
          // Apply same context weights
          if (context.isConclusion) score *= 1.3;
          if (context.hasComparison) score *= 1.2;
          score *= context.sectionWeight;
          
          contextScore += score;
          hasValidSentiment = true;
        }
      }
    }

    // Add ranking position impact
    const rankingImpact = calculateRankingImpact(text, ourCompanyName);
    if (rankingImpact !== 0) {
      contextScore += rankingImpact;
      hasValidSentiment = true;
    }

    if (hasValidSentiment) {
      totalScore += contextScore;
      validContexts++;
    }
  }

  // Return normalized score between -1 and 1
  return validContexts > 0 ? 
    Math.max(-1, Math.min(1, totalScore / validContexts)) : 
    null;
}

function findCompanyMentions(text: string, companyName: string): CompanyMention[] {
  const mentions: CompanyMention[] = [];
  const match = matchCompanyName(text, companyName);
  
  if (match.matches) {
    mentions.push({
      position: match.position,
      context: '', // Will be filled when analyzing
      sentiment: 0 // Will be calculated per mention
    });
  }

  return mentions;
}

function analyzeCompanyContext(context: string, companyName: string): number | null {
  const generalPositive = [
    'excellent', 'reliable', 'recommended', 'leading', 'innovative',
    'efficient', 'effective', 'robust', 'strong', 'trusted',
    'professional', 'quality', 'successful', 'advanced', 'proven'
  ];

  const generalNegative = [
    'poor', 'unreliable', 'limited', 'weak', 'outdated',
    'problematic', 'difficult', 'complicated', 'inconsistent', 'basic',
    'expensive', 'lacking', 'insufficient', 'disappointing'
  ];

  const relationshipTerms = {
    positive: [
      'better than', 'preferred over', 'superior to', 'leader in',
      'outperforms', 'ahead of', 'more advanced than'
    ],
    negative: [
      'worse than', 'behind', 'falls short of', 'inferior to',
      'lags behind', 'not as good as'
    ],
    neutral: [
      'similar to', 'comparable to', 'like', 'competes with',
      'alternative to', 'along with'
    ]
  };

  // First verify company is mentioned in this context
  if (!context.toLowerCase().includes(companyName.toLowerCase())) {
    return null;
  }

  // Start at neutral 0.5 since company is mentioned
  let score = 0.5;
  let signals = 0;

  // Check for general sentiment terms
  generalPositive.forEach(term => {
    if (context.toLowerCase().includes(term)) {
      score += 0.15;
      signals++;
    }
  });

  generalNegative.forEach(term => {
    if (context.toLowerCase().includes(term)) {
      score -= 0.15;
      signals++;
    }
  });

  // Check for relationship statements
  relationshipTerms.positive.forEach(term => {
    const pattern = new RegExp(`${companyName}.*${term}`, 'i');
    if (pattern.test(context)) {
      score += 0.2;
      signals++;
    }
  });

  relationshipTerms.negative.forEach(term => {
    const pattern = new RegExp(`${companyName}.*${term}`, 'i');
    if (pattern.test(context)) {
      score -= 0.2;
      signals++;
    }
  });

  // If company is mentioned but no sentiment signals, return neutral 0.5
  if (signals === 0) {
    return 0.5;
  }

  // Normalize score between 0 and 1
  return Math.max(0, Math.min(1, score));
}

async function analyzeCompetitorMentions(
  text: string, 
  competitors: string[]
): Promise<Array<{
  company: string;
  count: number;
  context: 'Alternative' | 'Comparison' | 'Integration' | 'Migration';
}>> {
  const mentions: Array<{
    company: string;
    count: number;
    context: 'Alternative' | 'Comparison' | 'Integration' | 'Migration';
  }> = [];
  
  for (const competitor of competitors) {
    const regex = new RegExp(`\\b${competitor}\\b`, 'gi');
    const matches = text.match(regex);
    
    if (matches) {
      mentions.push({
        company: competitor,
        count: matches.length,
        context: determineCompetitorContext(text, competitor)
      });
    }
  }
  
  return mentions;
}

function formatRankList(
  text: string, 
  ourCompanyName: string, 
  rankingPosition: number,
  competitors: string[] = []
): string | null {
  // Get ordered list of companies
  const companies = findCompanyNames(text, ourCompanyName, competitors);
  
  if (companies.length === 0) {
    console.log('No known companies found in text');
    return null;
  }

  console.log('Companies found in order:', companies.map(c => c.name).join(', '));

  // Convert to numbered list, preserving text order
  const formattedList = companies
    .map((company, index) => `${index + 1}. ${company.name}`)
    .join('\n');

  console.log('Final ranked list:', formattedList);
  return formattedList;
}

async function fetchCompetitors(companyId: number): Promise<string[]> {
  const adminClient = createAdminClient();
  
  try {
    const { data: competitors } = await adminClient
      .from('competitors')
      .select('competitor_name')
      .eq('company_id', companyId);

    return competitors?.map(c => c.competitor_name) || [];
  } catch (error) {
    console.error('Error fetching competitors:', error);
    return [];
  }
}

// Update return type to include both list and position
type RankingResult = {
  rank_list: string | null;
  ranking_position: number | null;
  confidence: number;
};

// Internal types for ranking detection
interface InternalRankingResult {
  rank_list: string | null;
  ranking_position: number | null;
  confidence: number;
  method: 'claude' | 'explicit' | 'secondary' | 'positional';
}

function findExplicitRankingInText(text: string, ourCompanyName: string, competitors: string[]): InternalRankingResult | null {
  console.log("\n=== Starting findExplicitRankingInText ===");
  
  // Split text into sections by headers
  const sections = text.split(/^###?\s+/gm);
  
  // Find the ranking section
  const rankingSection = sections.find(section => 
    section.trim().toLowerCase().startsWith('ranking')
  );
  
  if (!rankingSection) {
    console.log('No ranking section found');
    return null;
  }

  console.log('Found ranking section:', rankingSection.substring(0, 200));

  // Find numbered list items with company names
  const listItems = Array.from(
    rankingSection.matchAll(/^\d+\.\s*\*\*([^*]+)\*\*/gm)
  );

  console.log('Found list items:', listItems.map(m => m[1].trim()));

  const validCompanies = listItems
    .map(match => ({
      name: match[1].trim(),
      position: match.index || 0
    }))
    .filter(item => 
      item.name.toLowerCase() === ourCompanyName.toLowerCase() ||
      competitors.some(comp => 
        item.name.toLowerCase().includes(comp.toLowerCase())
      )
    );

  console.log('Valid companies:', validCompanies);

  if (validCompanies.length > 1) {
    const rank_list = validCompanies
      .map((company, index) => `${index + 1}. ${company.name}`)
      .join('\n');

    const ranking_position = validCompanies.findIndex(
      company => company.name.toLowerCase() === ourCompanyName.toLowerCase()
    ) + 1 || null;

    // High confidence since we found a clear ranking section with numbered list
    return {
      rank_list,
      ranking_position,
      confidence: 0.9,
      method: 'explicit'
    };
  }

  return null;
}

function findSecondaryRanking(text: string, ourCompanyName: string, competitors: string[]): InternalRankingResult | null {
  // Look for comparative sections
  const sections = text.split(/(?=###|\n\n)/);
  
  for (const section of sections) {
    if (!/compar|versus|vs\.|better than|prefer|superior|advantage/i.test(section)) {
      continue;
    }

    const companies = findCompanyNames(section, ourCompanyName, competitors);
    if (companies.length > 1) {
      const rank_list = companies
        .map((company, index) => `${index + 1}. ${company.name}`)
        .join('\n');

      const ranking_position = companies.findIndex(
        company => company.name.toLowerCase() === ourCompanyName.toLowerCase()
      ) + 1 || null;

      return {
        rank_list,
        ranking_position,
        confidence: 0.7, // Medium confidence
        method: 'secondary'
      };
    }
  }

  return null;
}

function findPositionalRanking(text: string, ourCompanyName: string, competitors: string[]): InternalRankingResult {
  const companies = findCompanyNames(text, ourCompanyName, competitors);
  
  if (companies.length > 1) {
    const rank_list = companies
      .map((company, index) => `${index + 1}. ${company.name}`)
      .join('\n');

    const ranking_position = companies.findIndex(
      company => company.name.toLowerCase() === ourCompanyName.toLowerCase()
    ) + 1 || null;

    return {
      rank_list,
      ranking_position,
      confidence: 0.5,
      method: 'positional'
    };
  }

  return {
    rank_list: null,
    ranking_position: null,
    confidence: 0.5,
    method: 'positional'
  };
}

async function findRanking(text: string, ourCompanyName: string, competitors: string[]): Promise<RankingResult> {
  console.log("\n=== Starting findRanking ===");
  console.log("Input:", { textLength: text.length, ourCompanyName, competitors });

  // Try Claude first
  const claudeResult = await findRankingWithClaude(text, ourCompanyName, competitors);
  if (claudeResult) {
    console.log("Using Claude ranking result");
    return claudeResult;
  }

  // If Claude fails, return no ranking
  return {
    rank_list: null,
    ranking_position: null,
    confidence: 0
  };
}

export async function analyzeResponse(response: Response): Promise<AnalyzedResponse> {
  console.log('Analyze - Response data:', {
    responseId: response.id,
    hasPersona: !!response.query?.persona,
    hasIdealCustomerProfile: !!response.query?.persona?.icp,
    vertical: response.query?.persona?.icp?.vertical
  });

  console.log('Analyzing response - ICP and Region data:', {
    responseId: response.id,
    personaData: response.query?.persona,  // Log full persona data
    personaIcp: response.query?.persona?.icp,  // Log ICP data
    personaIcpVertical: response.query?.persona?.icp?.vertical,  // Log specific vertical
    personaIcpRegion: response.query?.persona?.icp?.region,  // Log specific region
    companyIcps: response.query?.company?.ideal_customer_profiles
  });

  console.log('Analyzing response with citations:', response.citations);
  
  // Validate query structure
  const query = Array.isArray(response.query) ? response.query[0] : response.query;
  if (!query || typeof query !== 'object' || !('id' in query)) {
    throw new Error(`Invalid query structure for response ${response.id}`);
  }

  console.log('Analysis - Query competitor data:', {
    responseId: response.id,
    queryCompetitors: query.competitors,
    companyCompetitors: query.company?.competitors,
    queryCompetitorsType: query.competitors ? typeof query.competitors : 'undefined',
    companyCompetitorsType: query.company?.competitors ? typeof query.company.competitors : 'undefined'
  });

  // Get competitors list from the query data instead of fetching
  const competitors = query.competitors?.map((c: { competitor_name: string }) => c.competitor_name) || 
                     query.company?.competitors?.map((c: { competitor_name: string }) => c.competitor_name) || 
                     [];

  console.log('Analysis - Extracted competitor names:', {
    responseId: response.id,
    competitors,
    competitorCount: competitors.length
  });

  const geographic_region = query.persona?.icp?.region || // Try persona ICP first
                            query.company?.ideal_customer_profiles?.[0]?.region || // Then company ICP
                            null;
  
  console.log('Setting geographic_region:', {
    responseId: response.id,
    geographic_region,
    fromQueryIcp: query.icp?.region,
    fromCompanyIcp: query.company?.ideal_customer_profiles?.[0]?.region
  });

  const analysis: AnalyzedResponse = {
    response_id: response.id,
    citations_parsed: null,
    recommended: false,
    cited: false,
    sentiment_score: null,
    ranking_position: 0,
    company_mentioned: false,
    geographic_region,
    industry_vertical: query.company?.industry || null,
    icp_vertical: query.persona?.icp?.vertical || 
                  query.company?.ideal_customer_profiles?.[0]?.vertical || 
                  null,
    buyer_persona: query.persona ? 
      `${query.persona.title} (${query.persona.department})` : null,
    buying_journey_stage: query.buyer_journey_phase?.[0] || null,
    response_text: response.response_text,
    rank_list: null,
    competitors_list: competitors,
    mentioned_companies: [],
    solution_analysis: null
  };

  try {
    const responseText = response.response_text;
    const responseLower = responseText.toLowerCase();
    const ourCompanyName = query.company?.name || '';
    
    // Process citations
    if (response.citations && response.citations.length > 0) {
      console.log('Found citations to process:', response.citations);
      const citationResult = await analyzeCitations(response.citations, ourCompanyName);
      if (citationResult.parsed) {
        analysis.citations_parsed = citationResult.parsed;
        analysis.cited = citationResult.hasCorporateUrl;
        console.log('Citations processed:', analysis.citations_parsed);
      } else {
        console.log('No valid citations found in:', response.citations);
      }
    } else {
      console.log('No citations found for response');
    }

    // Calculate sentiment only for our company
    analysis.sentiment_score = analyzeOurCompanySentiment(responseText, ourCompanyName);

    // Check if our company is mentioned
    const ourCompanyRegex = new RegExp(`\\b${ourCompanyName}\\b`, 'gi');
    analysis.company_mentioned = ourCompanyRegex.test(responseText);

    // Competitor Analysis and Ranking List
    if (query.company) {
      const rankingResult = await findRanking(responseText, ourCompanyName, competitors);
      
      if (rankingResult && rankingResult.rank_list) {
        analysis.rank_list = rankingResult.rank_list;
        analysis.ranking_position = rankingResult.ranking_position;
        
        // Extract mentioned companies from rank_list
        analysis.mentioned_companies = rankingResult.rank_list
          .split('\n')
          .map(line => {
            const match = line.match(/^\d+\.\s*(.+)$/);
            return match ? match[1].trim() : null;
          })
          .filter((name): name is string => name !== null);

        console.log('Ranking analysis result:', {
          rank_list: rankingResult.rank_list,
          ranking_position: rankingResult.ranking_position,
          confidence: rankingResult.confidence,
          mentioned_companies: analysis.mentioned_companies
        });
      }
    }

    // Recommendation Detection
    analysis.recommended = checkForRecommendation(responseText, ourCompanyName);

    // Check if this is a solution evaluation query
    if (response.query.buyer_journey_phase?.includes('solution_evaluation')) {
      console.log('Processing solution evaluation response:', {
        responseId: response.id,
        queryId: response.query_id,
        buyerJourneyPhase: response.query.buyer_journey_phase
      });

      analysis.solution_analysis = analyzeSolutionFeature(response.response_text);
      
      console.log('Solution analysis complete:', {
        responseId: response.id,
        result: analysis.solution_analysis,
        hasFeature: analysis.solution_analysis.has_feature
      });
    } else {
      console.log('Skipping solution analysis - not a solution evaluation response:', {
        responseId: response.id,
        buyerJourneyPhase: response.query.buyer_journey_phase
      });
    }

    console.log('ICP Vertical Flow - Analysis:', {
      responseId: response.id,
      rawVertical: query.persona?.icp?.vertical,
      fallbackVertical: query.company?.ideal_customer_profiles?.[0]?.vertical,
      finalVertical: analysis.icp_vertical
    });

    return analysis;
  } catch (error) {
    console.error('Error analyzing response:', error);
    throw error;
  }
}

async function analyzeCitations(urls: string[], ourCompanyName: string): Promise<{
  parsed: AnalyzedResponse['citations_parsed'];
  hasCorporateUrl: boolean;
}> {
  console.log('Processing citations:', urls);
  
  // Clean and validate URLs
  const cleanedUrls = urls
    .map(url => {
      try {
        // Remove any trailing punctuation or brackets
        let cleaned = url.replace(/[\]\)\}]+$/, '');
        // Remove any leading punctuation or brackets
        cleaned = cleaned.replace(/^[\[\(\{]+/, '');
        // Trim whitespace
        cleaned = cleaned.trim();
        
        // Try to create a URL object to validate
        new URL(cleaned);
        return cleaned;
      } catch (e) {
        console.log(`Invalid URL skipped: ${url}`);
        return null;
      }
    })
    .filter((url): url is string => url !== null);

  console.log('Cleaned URLs:', cleanedUrls);
  
  // Always process all valid citations
  const parsed: AnalyzedResponse['citations_parsed'] = cleanedUrls.length > 0 ? {
    urls: cleanedUrls,
    context: cleanedUrls.map(() => 'Citation context'),
    relevance: cleanedUrls.map(() => 0.5),
    source_types: cleanedUrls.map(url => {
      const urlLower = url.toLowerCase();
      if (urlLower.includes('blog.')) return 'Blog';
      if (urlLower.includes('github.com')) return 'GitHub';
      if (urlLower.includes('guide') || urlLower.includes('tutorial')) return 'Guide';
      return 'Documentation';
    })
  } : null;

  // Check if any URL contains our company's domain
  const hasCorporateUrl = cleanedUrls.some(url => {
    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname.toLowerCase();
      const companyDomain = ourCompanyName.toLowerCase().replace(/\s+/g, '');
      return domain.includes(companyDomain);
    } catch (e) {
      return false;
    }
  });

  console.log('Processed citations result:', { 
    parsed,
    hasCorporateUrl,
    urlCount: cleanedUrls.length
  });
  
  return { parsed, hasCorporateUrl };
}

function calculateSentimentScore(text: string): number {
  const positivePatterns = [
    'excellent', 'great', 'best', 'recommended', 'ideal', 'perfect',
    'efficient', 'effective', 'powerful', 'robust', 'reliable',
    'innovative', 'leading', 'superior', 'outstanding', 'exceptional'
  ];
  
  const negativePatterns = [
    'poor', 'bad', 'worst', 'avoid', 'difficult', 'complex',
    'limited', 'expensive', 'complicated', 'unreliable', 'weak',
    'outdated', 'lacking', 'insufficient', 'problematic'
  ];

  let score = 0.5;
  let totalMatches = 0;

  positivePatterns.forEach(pattern => {
    const matches = text.match(new RegExp(pattern, 'gi'));
    if (matches) {
      score += (matches.length * 0.1);
      totalMatches += matches.length;
    }
  });

  negativePatterns.forEach(pattern => {
    const matches = text.match(new RegExp(pattern, 'gi'));
    if (matches) {
      score -= (matches.length * 0.1);
      totalMatches += matches.length;
    }
  });

  return totalMatches > 0 ? Math.max(0, Math.min(1, score)) : 0.5;
}

function determineCompetitorContext(text: string, companyName: string): 'Alternative' | 'Comparison' | 'Integration' | 'Migration' {
  const contextPatterns = {
    Alternative: ['alternative', 'instead of', 'rather than'],
    Comparison: ['versus', 'vs', 'compared to', 'better than'],
    Integration: ['integrate', 'integration', 'works with', 'compatible'],
    Migration: ['migrate', 'migration', 'switch from', 'move from']
  };

  for (const [context, patterns] of Object.entries(contextPatterns)) {
    if (patterns.some(pattern => text.includes(pattern))) {
      return context as 'Alternative' | 'Comparison' | 'Integration' | 'Migration';
    }
  }

  return 'Comparison';
}

function determineSentiment(text: string, companyName: string): 'Positive' | 'Neutral' | 'Negative' {
  const score = calculateSentimentScore(text);
  if (score >= 0.7) return 'Positive';
  if (score <= 0.3) return 'Negative';
  return 'Neutral';
}

function checkForRecommendation(text: string, ourCompanyName: string): boolean {
  // Only count as recommended if our company is specifically recommended
  const recommendationPatterns = [
    'recommend',
    'suggest',
    'best choice',
    'ideal solution',
    'top pick',
    'preferred option',
    'best option',
    'recommended tool',
    'best solution'
  ];

  const ourCompanyMentioned = text.toLowerCase().includes(ourCompanyName.toLowerCase());
  if (!ourCompanyMentioned) return false;

  // Look for recommendation patterns near our company name
  const companyIndex = text.toLowerCase().indexOf(ourCompanyName.toLowerCase());
  const context = text.slice(Math.max(0, companyIndex - 100), companyIndex + 100);
  
  return recommendationPatterns.some(pattern => context.toLowerCase().includes(pattern));
}

function findCompanyNames(
  text: string, 
  ourCompanyName: string, 
  competitors: string[] = []
): Array<{ name: string, position: number }> {
  const foundCompanies = new Map<string, number>();
  
  // Check for our company first
  const ourCompanyMatch = matchCompanyName(text, ourCompanyName);
  if (ourCompanyMatch.matches) {
    foundCompanies.set(ourCompanyName, ourCompanyMatch.position);
  }

  // Check for known competitors
  for (const competitor of competitors) {
    const match = matchCompanyName(text, competitor);
    if (match.matches) {
      foundCompanies.set(competitor, match.position);
    }
  }

  // Return sorted by position in text
  return Array.from(foundCompanies.entries())
    .map(([name, position]) => ({ name, position }))
    .sort((a, b) => a.position - b.position);
}

// Add new types for ranking detection
type RankingMatch = {
  position: number;
  confidence: number;
  pattern_type: 'explicit_list' | 'comparative' | 'positional';
  companies?: string[];  // Ordered list of companies when available
};

function calculateRankingConfidence(section: string, sectionIndex: number, totalSections: number): number {
  let confidence = 0;

  // Strong final ranking indicators (highest weight)
  if (/final\s+rank(ing|ed)|overall\s+rank(ing|ed)|in\s+conclusion|to\s+summarize/i.test(section)) {
    confidence += 0.5;  // Increased from 0.4
  }

  // Explicit ordering qualifiers
  if (/most.*to.*least|best.*to.*worst|top.*to.*bottom|highest.*to.*lowest/i.test(section)) {
    confidence += 0.3;  // New pattern
  }
  
  // Position weight - favor later sections
  const positionWeight = sectionIndex / totalSections;
  confidence += positionWeight * 0.3;  // Scale up to 0.3 for last section

  // Section header indicators (lower weight now)
  if (/^###.*rank/i.test(section)) {
    confidence += 0.2;  // Reduced from 0.3
  }

  // Explicit comparison language
  if (/compar(e|ing|ison)|evaluat(e|ing|ion)/i.test(section)) {
    confidence += 0.2;
  }

  // Numbered list with explanations
  if (/\d+\.\s*[^:\n]+:\s*[^\n]+/m.test(section)) {
    confidence += 0.2;
  }

  // Presence of criteria
  if (/based on|criteria|considering|factors/i.test(section)) {
    confidence += 0.1;
  }

  // Normalize to 0-1 range
  return Math.min(1, confidence);
}

// Add utility functions for name matching
function normalizeCompanyName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[-\s]|(inc|ltd|llc|corp|company)\.?$/g, '')
    .trim();
}

function matchCompanyName(text: string, companyName: string): { 
  matches: boolean;
  position: number;
} {
  const normalizedCompany = normalizeCompanyName(companyName);
  const textLower = text.toLowerCase();
  
  // Try variations of the name
  const variations = [
    companyName,                          // Exact match
    normalizedCompany,                    // Normalized
    companyName.replace(/\s+/g, ''),     // No spaces
    companyName.replace(/\s+/g, '-'),    // Hyphenated
    `${companyName} Inc`,
    `${companyName} Ltd`,
    `${companyName} LLC`,
  ];

  for (const variant of variations) {
    const pos = textLower.indexOf(variant.toLowerCase());
    if (pos !== -1) {
      return { matches: true, position: pos };
    }
  }

  return { matches: false, position: -1 };
}

// Add new types
type SolutionAnalysisResult = {
  has_feature: 'YES' | 'NO' | 'N/A';
};

// Add new function to detect feature presence
function analyzeSolutionFeature(text: string): SolutionAnalysisResult {
  console.log('Starting solution feature analysis');

  // Check for uncertainty/unknown responses first
  const uncertaintyPatterns = [
    /I don't have (the|enough) (answer|information|data|details)/i,
    /I cannot (determine|verify|confirm|say|tell)/i,
    /I am (not sure|uncertain|unable to determine)/i,
    /There isn't enough (information|data|context)/i,
    /This information is (not available|unavailable|unknown)/i,
    /Without more (information|context|details)/i,
    /would need (more|additional) (information|details|context)/i,
    /unclear (whether|if)/i,
    /hard to (determine|say|tell)/i
  ];

  if (uncertaintyPatterns.some(pattern => pattern.test(text))) {
    console.log('Found uncertainty pattern - returning N/A');
    return { has_feature: 'N/A' };
  }

  // 1. First check - direct "Yes" start
  const directYesPattern = /^yes[,.]?\s+/i;
  if (directYesPattern.test(text)) {
    console.log('Found direct Yes at start - returning YES');
    return { has_feature: 'YES' };
  }

  // 2. Check for direct negative statements at start
  const directNoPatterns = [
    /^no[,.]?\s+/i,
    /^(?:the\s+)?[^.!?\n]+?\s+(?:does|do|is|are)\s+not\s+(?:offer|provide|support|have|include)/i,
    /^(?:the\s+)?[^.!?\n]+?\s+(?:doesn't|does\s+not|cannot|can't)\s+(?:offer|provide|support|have|include)/i,
    /^(?:the\s+)?[^.!?\n]+?\s+(?:lacks|missing)\s+/i
  ];

  if (directNoPatterns.some(pattern => pattern.test(text))) {
    console.log('Found direct No at start - returning NO');
    return { has_feature: 'NO' };
  }

  // 3. Check for strong negative statements anywhere
  const strongNegativePatterns = [
    /(?:does|do|is|are)\s+not\s+(?:currently\s+)?(?:offer|provide|support|include|enable)/i,
    /(?:doesn't|does\s+not|cannot|can't)\s+(?:currently\s+)?(?:offer|provide|support|include|enable)/i,
    /not\s+(?:currently\s+)?(?:available|possible|supported|offered|included)/i,
    /unavailable/i,
    /unsupported/i
  ];

  if (strongNegativePatterns.some(pattern => pattern.test(text))) {
    console.log('Found strong negative statement - returning NO');
    return { has_feature: 'NO' };
  }

  // 4. Check for strong affirmative statements
  const strongAffirmativePatterns = [
    /^(?:the\s+)?[^.!?\n]+?\s+(?:offers|provides|supports|includes|enables)/i,
    /^(?:the\s+)?[^.!?\n]+?\s+(?:has|have)\s+built-in/i,
    /fully\s+supported/i,
    /native(?:ly)?\s+support/i
  ];

  // 5. Check for limitations that negate functionality
  const limitationPatterns = [
    /only\s+(?:with|through|by|when)/i,
    /requires\s+(?:additional|extra|third[- ]party)/i,
    /through\s+(?:external|third-party|additional)/i,
    /using\s+external/i
  ];

  // 6. Make final decision
  const hasStrongAffirmative = strongAffirmativePatterns.some(pattern => pattern.test(text));
  const hasLimitations = limitationPatterns.some(pattern => pattern.test(text));

  if (hasStrongAffirmative && !hasLimitations) {
    return { has_feature: 'YES' };
  }

  // Default to NO for ambiguous cases
  return { has_feature: 'NO' };
}

