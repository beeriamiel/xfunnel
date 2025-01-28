'use server'

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

    // Store the analysis result
    if (hasAIOverview) {
      await supabase
        .from('ai_overview_tracking_test')
        .insert({
          term_id: termId,
          company_id: companyId,
          account_id: accountId,
          has_ai_overview: true,
          company_mentioned: false, // This would need to be analyzed from the content
          competitor_mentions: [],  // This would need to be analyzed from the content
          content_snapshot: response.ai_overview?.text_blocks?.join('\n') || null,
          url: response.organic_results?.[0]?.link || null,
          checked_at: new Date().toISOString(),
          product_id: productId
        })
    }

    return NextResponse.json({
      termId,
      term,
      hasAIOverview,
      companyMentioned: false, // This would need to be analyzed from the content
      competitorMentions: [],  // This would need to be analyzed from the content
      contentSnapshot: hasAIOverview ? response.ai_overview?.text_blocks?.join('\n') : null,
      url: response.organic_results?.[0]?.link || null
    })
  } catch (error) {
    console.error('Error analyzing term:', error)
    return NextResponse.json({ error: 'Failed to analyze term' }, { status: 500 })
  }
} 