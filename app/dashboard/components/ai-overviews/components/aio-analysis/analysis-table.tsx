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

interface Term {
  id: number
  company_id: number
  account_id: string
  term: string
  source: 'MOZ' | 'AI' | 'USER'
  status: 'ACTIVE' | 'ARCHIVED'
  created_at: string | null
  ai_overview_tracking_test?: {
    has_ai_overview: boolean
    company_mentioned: boolean
    competitor_mentions: string[]
    content_snapshot: string | null
    checked_at: string | null
  } | null
}

interface AnalysisTableProps {
  companyId: number
  accountId: string
  selectedTerms: number[]
  onSelectionChange: (termIds: number[]) => void
  results: AIOverviewResult[]
}

function ExpandableContent({ content }: { content: string }) {
  return (
    <div className="px-4 py-3 bg-muted/50 rounded-md my-2 mx-4">
      <p className="text-sm whitespace-pre-wrap">{content}</p>
    </div>
  )
}

export function AnalysisTable({ 
  companyId, 
  accountId, 
  selectedTerms, 
  onSelectionChange,
  results
}: AnalysisTableProps) {
  const [terms, setTerms] = useState<Term[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedRows, setExpandedRows] = useState<number[]>([])

  useEffect(() => {
    async function loadTerms() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('ai_overview_terms_test')
        .select(`
          *,
          ai_overview_tracking_test (
            has_ai_overview,
            company_mentioned,
            competitor_mentions,
            content_snapshot,
            checked_at
          )
        `)
        .eq('company_id', companyId)
        .eq('account_id', accountId)
        .eq('status', 'ACTIVE')
        .order('created_at', { ascending: false })

      if (!error && data) {
        // Transform the data to handle the nested array from the join
        const transformedData = data.map(term => ({
          ...term,
          // Get the most recent analysis result
          ai_overview_tracking_test: term.ai_overview_tracking_test?.[0] || null
        })) as Term[]
        setTerms(transformedData)
      }
      setIsLoading(false)
    }

    loadTerms()
  }, [companyId, accountId])

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
    setExpandedRows(prev => 
      prev.includes(termId) 
        ? prev.filter(id => id !== termId)
        : [...prev, termId]
    )
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
        contentSnapshot: term.ai_overview_tracking_test.content_snapshot
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
          const isExpanded = expandedRows.includes(term.id)
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
                    <ExpandableContent content={result.contentSnapshot!} />
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