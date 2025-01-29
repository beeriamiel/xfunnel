'use client'

import { useEffect, useState, Fragment } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ChevronDown, ChevronRight } from "lucide-react"
import { createClient } from "@/app/supabase/client"
import type { AIOverviewResult } from "@/lib/services/ai-overview-analysis/types"
import { RelevantLinks } from "./relevant-links"
import { SourcesOverview } from "./sources-overview"

interface Term {
  id: number
  company_id: number
  account_id: string
  term: string
  source: 'MOZ' | 'AI' | 'USER'
  status: 'ACTIVE' | 'ARCHIVED'
  created_at: string | null
  product_id: number | null
  ai_overview_tracking_test?: {
    has_ai_overview: boolean
    company_mentioned: boolean
    competitor_mentions: string[]
    content_snapshot: string | null
    checked_at: string | null
    relevant_links?: Array<{
      url: string
      title?: string
      snippet?: string
      source?: string
    }>
  } | null
}

interface TrackingResult {
  id: number
  has_ai_overview: boolean
  company_mentioned: boolean
  competitor_mentions: string[]
  content_snapshot: string | null
  checked_at: string | null
  relevant_links?: Array<{
    url: string
    title?: string
    snippet?: string
    source?: string
  }>
}

interface QueryResult {
  id: number
  company_id: number
  account_id: string
  term: string
  source: 'MOZ' | 'AI' | 'USER'
  status: 'ACTIVE' | 'ARCHIVED'
  created_at: string | null
  product_id: number | null
  ai_overview_tracking_test: TrackingResult[] | null
}

interface AnalysisTableProps {
  companyId: number
  accountId: string
  isSuperAdmin: boolean
  selectedProductId: number | null
  selectedTerms: number[]
  onSelectionChange: (termIds: number[]) => void
  results: AIOverviewResult[]
}

function ExpandableContent({ 
  content, 
  links,
  companyName 
}: { 
  content: string; 
  links?: Array<{ url: string; title?: string; snippet?: string; source?: string }>;
  companyName?: string;
}) {
  console.log('Content received in ExpandableContent:', {
    type: typeof content,
    value: content,
    length: content?.length
  });
  
  // Try to parse if it's a stringified JSON
  let displayContent = content;
  try {
    if (typeof content === 'string' && (content.startsWith('{') || content.startsWith('['))) {
      const parsed = JSON.parse(content);
      console.log('Parsed content:', parsed);
      displayContent = JSON.stringify(parsed, null, 2);
    }
  } catch (e) {
    console.log('Not a JSON string');
  }

  return (
    <div className="px-4 py-3 space-y-4">
      {/* AI Overview Content Card */}
      <div className="bg-card text-card-foreground rounded-lg border shadow-sm">
        <div className="px-6 py-4">
          <h4 className="text-sm font-medium mb-2">AI Overview</h4>
          <div className="text-sm whitespace-pre-wrap text-muted-foreground">
            {displayContent}
          </div>
        </div>
      </div>

      {/* Sources and Links Section */}
      <div className="bg-muted/50 rounded-lg px-6 py-4">
        <SourcesOverview links={links} companyName={companyName} />
        <RelevantLinks links={links} />
      </div>
    </div>
  )
}

export function AnalysisTable({ 
  companyId, 
  accountId,
  isSuperAdmin,
  selectedProductId,
  selectedTerms, 
  onSelectionChange,
  results
}: AnalysisTableProps) {
  const [terms, setTerms] = useState<Term[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedTerms, setExpandedTerms] = useState<Set<number>>(new Set())
  const [companyName, setCompanyName] = useState<string>()

  useEffect(() => {
    loadTerms()
    loadCompanyName()
  }, [companyId, accountId, isSuperAdmin, selectedProductId])

  async function loadCompanyName() {
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from('companies')
        .select('name')
        .eq('id', companyId)
        .single()
      
      setCompanyName(data?.name)
    } catch (error) {
      console.error('Error loading company name:', error)
    }
  }

  async function loadTerms() {
    try {
      setIsLoading(true)
      const supabase = createClient()
      
      let query = supabase
        .from('ai_overview_terms_test')
        .select(`
          id,
          company_id,
          account_id,
          term,
          source,
          status,
          created_at,
          product_id,
          ai_overview_tracking_test (
            id,
            has_ai_overview,
            company_mentioned,
            competitor_mentions,
            content_snapshot,
            checked_at,
            relevant_links
          )
        `)
        .eq('company_id', companyId)
        .eq('status', 'ACTIVE')
        .order('created_at', { ascending: false })

      // Add account filter for non-super admins
      if (!isSuperAdmin) {
        query = query.eq('account_id', accountId)
      }

      // Add product filter if selected
      if (selectedProductId) {
        query = query.eq('product_id', selectedProductId)
      }

      const { data, error } = await query

      if (error) throw error
      
      // Transform the data to handle the nested array from the join
      const transformedData = ((data || []) as unknown as QueryResult[]).map(term => ({
        ...term,
        // Get the most recent analysis result by sorting by checked_at
        ai_overview_tracking_test: term.ai_overview_tracking_test
          ?.sort((a: TrackingResult, b: TrackingResult) => 
            new Date(b.checked_at || 0).getTime() - new Date(a.checked_at || 0).getTime()
          )?.[0] || null
      })) as Term[]
      
      setTerms(transformedData)
    } catch (error) {
      console.error('Error loading terms:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleTerm = (termId: number) => {
    if (selectedTerms.includes(termId)) {
      onSelectionChange(selectedTerms.filter(id => id !== termId))
    } else {
      onSelectionChange([...selectedTerms, termId])
    }
  }

  const toggleAll = () => {
    if (selectedTerms.length === terms.length) {
      onSelectionChange([])
    } else {
      onSelectionChange(terms.map(term => term.id))
    }
  }

  const toggleExpand = (termId: number) => {
    if (expandedTerms.has(termId)) {
      expandedTerms.delete(termId)
    } else {
      expandedTerms.add(termId)
    }
    setExpandedTerms(new Set(expandedTerms))
  }

  const getResultForTerm = (termId: number) => {
    // First check for new analysis results
    const newResult = results.find(r => r.termId === termId)
    if (newResult) return newResult

    // If no new result, check for historical data
    const term = terms.find(t => t.id === termId)
    if (term?.ai_overview_tracking_test) {
      return {
        termId: term.id,
        term: term.term,
        hasAIOverview: term.ai_overview_tracking_test.has_ai_overview,
        companyMentioned: term.ai_overview_tracking_test.company_mentioned,
        competitorMentions: term.ai_overview_tracking_test.competitor_mentions,
        contentSnapshot: term.ai_overview_tracking_test.content_snapshot,
        relevantLinks: term.ai_overview_tracking_test.relevant_links
      }
    }

    return undefined
  }

  if (isLoading) {
    return <div className="text-center py-4">Loading terms...</div>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">
            <Checkbox 
              checked={selectedTerms.length === terms.length && terms.length > 0}
              onCheckedChange={toggleAll}
            />
          </TableHead>
          <TableHead>Term</TableHead>
          <TableHead>Source</TableHead>
          <TableHead>AI Overview</TableHead>
          <TableHead>Company Mentioned</TableHead>
          <TableHead>Competitor Mentions</TableHead>
          <TableHead>Created</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {terms.map((term) => {
          const result = getResultForTerm(term.id)
          const isExpanded = expandedTerms.has(term.id)
          const hasAIOverview = result?.hasAIOverview && result?.contentSnapshot
          
          return (
            <Fragment key={term.id}>
              <TableRow 
                className={hasAIOverview ? "cursor-pointer hover:bg-muted/50" : ""}
                onClick={() => hasAIOverview && toggleExpand(term.id)}
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox 
                    checked={selectedTerms.includes(term.id)}
                    onCheckedChange={() => toggleTerm(term.id)}
                  />
                </TableCell>
                <TableCell className="flex items-center gap-2">
                  {hasAIOverview && (
                    <span className="text-muted-foreground">
                      {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </span>
                  )}
                  {term.term}
                </TableCell>
                <TableCell>{term.source}</TableCell>
                <TableCell>
                  {result && (
                    <Badge variant={result.hasAIOverview ? "default" : "secondary"}>
                      {result.hasAIOverview ? "Yes" : "No"}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {result && (
                    <Badge variant={result.companyMentioned ? "default" : "secondary"}>
                      {result.companyMentioned ? "Yes" : "No"}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {result ? (
                    result.competitorMentions.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {result.competitorMentions.map((competitor, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {competitor}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">No competitors</span>
                    )
                  ) : (
                    <span className="text-muted-foreground">No competitors</span>
                  )}
                </TableCell>
                <TableCell>
                  {term.created_at 
                    ? new Date(term.created_at).toLocaleDateString()
                    : 'N/A'}
                </TableCell>
              </TableRow>
              {hasAIOverview && isExpanded && (
                <TableRow>
                  <TableCell colSpan={7} className="p-0">
                    <ExpandableContent 
                      content={result.contentSnapshot!} 
                      links={result.relevantLinks}
                      companyName={companyName}
                    />
                  </TableCell>
                </TableRow>
              )}
            </Fragment>
          )
        })}
        {terms.length === 0 && (
          <TableRow>
            <TableCell colSpan={7} className="text-center py-4">
              No active terms found. Add terms in the Keywords Management tab.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
} 