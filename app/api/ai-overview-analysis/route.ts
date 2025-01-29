import { searchWithSerpApi } from "@/lib/clients/serpapi"
import { createClient } from "@/app/supabase/server"
import { NextResponse } from "next/server"

interface AnalyzeTermRequest {
  termId: number
  term: string
  companyId: number
  accountId: string
  isSuperAdmin: boolean
  productId: number | null
}

interface ListItem {
  snippet: string;
}

interface TextBlock {
  type: 'paragraph' | 'list';
  snippet: string;
  list?: ListItem[];
}

interface AIOverviewResponse {
  text_blocks?: TextBlock[];
  hasAIOverview?: boolean;
  companyMentioned?: boolean;
  competitorMentions?: string[];
  contentSnapshot?: string;
  relevantLinks?: Array<{
    url: string;
    title?: string;
    snippet?: string;
    source?: string;
  }>;
}

interface SerpAPIResponse {
  ai_overview?: AIOverviewResponse;
  organic_results?: Array<{
    link?: string;
    title?: string;
    snippet?: string;
    source?: string;
  }>;
}

function extractDomain(url: string): string {
  try {
    const domain = new URL(url).hostname.replace('www.', '')
    // Capitalize first letter of each word
    return domain.split('.')[0].split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  } catch {
    return 'Unknown Source'
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as AnalyzeTermRequest
    const { termId, term, companyId, accountId, isSuperAdmin, productId } = body

    // Get company context
    const supabase = await createClient()
    
    // Get company name
    const { data: company } = await supabase
      .from('companies')
      .select('name')
      .eq('id', companyId)
      .single()

    // Get competitors
    const { data: competitors } = await supabase
      .from('competitors')
      .select('competitor_name')
      .eq('company_id', companyId)

    const context = {
      name: company?.name || '',
      competitors: competitors?.map(c => c.competitor_name) || []
    }

    // Search with SerpAPI
    const response = await searchWithSerpApi(term) as SerpAPIResponse
    
    // Detailed logging for AI Overview check
    console.log('AI Overview check for term:', term);
    console.log('Raw AI Overview response:', JSON.stringify(response.ai_overview, null, 2));
    console.log('Text blocks type:', typeof response.ai_overview?.text_blocks);
    console.log('Text blocks structure:', JSON.stringify(response.ai_overview?.text_blocks, null, 2));
    
    // Check if AI overview exists
    const hasAIOverview = !!response.ai_overview?.text_blocks?.length
    
    // Log final result
    console.log('Has AI Overview:', hasAIOverview);

    // Store the analysis result
    if (hasAIOverview) {
      // Process content snapshot from text blocks
      const contentSnapshot = response.ai_overview?.text_blocks?.map(block => {
        if (block.type === 'paragraph') {
          return block.snippet;
        } else if (block.type === 'list') {
          return block.list?.map(item => `• ${item.snippet}`).join('\n');
        }
        return '';
      }).filter(Boolean).join('\n\n');

      // Extract relevant links from organic results
      const relevantLinks = response.organic_results
        ?.slice(0, 5)  // Take first 5 results
        ?.filter(result => result.link && result.title)
        ?.map(result => ({
          url: result.link || '',
          title: result.title,
          snippet: result.snippet,
          source: extractDomain(result.link || '')
        })) || [];

      // Store in database
      await supabase
        .from('ai_overview_tracking_test')
        .insert({
          term_id: termId,
          company_id: companyId,
          account_id: accountId,
          has_ai_overview: true,
          company_mentioned: false,
          competitor_mentions: [],
          content_snapshot: contentSnapshot,
          url: response.organic_results?.[0]?.link || null,
          checked_at: new Date().toISOString(),
          product_id: productId,
          relevant_links: relevantLinks
        })

      return NextResponse.json({
        termId,
        term,
        hasAIOverview,
        companyMentioned: false,
        competitorMentions: [],
        contentSnapshot,
        url: response.organic_results?.[0]?.link || null,
        relevantLinks
      })
    }

    return NextResponse.json({
      termId,
      term,
      hasAIOverview: false,
      companyMentioned: false,
      competitorMentions: [],
      contentSnapshot: null,
      url: null,
      relevantLinks: []
    })
  } catch (error) {
    console.error('Error analyzing term:', error)
    return NextResponse.json({ error: 'Failed to analyze term' }, { status: 500 })
  }
} 