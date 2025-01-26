import { searchWithSerpApi } from "@/lib/clients/serpapi"
import { createClient } from "@/app/supabase/server"
import { NextResponse } from "next/server"

interface AnalyzeTermRequest {
  termId: number
  term: string
  companyId: number
  accountId: string
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as AnalyzeTermRequest
    const { termId, term, companyId, accountId } = body

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
    const response = await searchWithSerpApi(term)
    
    // Detailed logging for AI Overview check
    console.log('AI Overview check for term:', term);
    console.log('Has ai_overview property:', !!response.ai_overview);
    console.log('Has text_blocks:', !!response.ai_overview?.text_blocks);
    console.log('Number of text blocks:', response.ai_overview?.text_blocks?.length || 0);
    
    // Check if AI overview exists
    const hasAIOverview = !!response.ai_overview?.text_blocks?.length
    
    // Log final result
    console.log('Has AI Overview:', hasAIOverview);
    
    // Initialize variables
    let companyMentioned = false
    let competitorMentions: string[] = []
    let contentSnapshot: string | null = null

    // Only analyze content if AI overview exists
    if (hasAIOverview && response.ai_overview?.text_blocks) {
      // Get content from AI overview only
      const contentToAnalyze = response.ai_overview.text_blocks
        .map(block => block.snippet)
        .join(" ")

      // Check for company and competitor mentions only in AI overview content
      companyMentioned = contentToAnalyze.toLowerCase()
        .includes(context.name.toLowerCase())

      competitorMentions = context.competitors.filter(competitor =>
        contentToAnalyze.toLowerCase().includes(competitor.toLowerCase())
      )

      contentSnapshot = contentToAnalyze
    }

    const result = {
      termId,
      term,
      hasAIOverview,
      companyMentioned,
      competitorMentions,
      url: response.organic_results?.[0]?.link,
      contentSnapshot
    }

    // Save result to database
    await supabase
      .from('ai_overview_tracking_test')
      .insert({
        term_id: termId,
        company_id: companyId,
        account_id: accountId,
        has_ai_overview: hasAIOverview,
        company_mentioned: companyMentioned,
        competitor_mentions: competitorMentions,
        url: response.organic_results?.[0]?.link,
        content_snapshot: contentSnapshot,
        checked_at: new Date().toISOString()
      })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error analyzing term:', error)
    return NextResponse.json(
      { error: 'Failed to analyze term' },
      { status: 500 }
    )
  }
} 