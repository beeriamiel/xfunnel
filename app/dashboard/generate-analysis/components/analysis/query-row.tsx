'use client'

import { useEffect, useMemo } from 'react'
import { Button } from "@/components/ui/button"
import { Plus, Loader2, ChevronDown, ChevronRight } from "lucide-react"
import type { Query, QueryState, QueryAction } from '../../types/analysis'
import { useQueryStore } from '../../store/query-store'
import { useToast } from '@/components/hooks/use-toast'
import { generateQuestionsAction } from '../../actions/generate'
import type { EngineSelection } from '@/app/company-actions'
import { ExpandedQueryRow } from './expanded-query-row'

interface RowQuery {
  id: string;
  companyName?: string;
  personaId?: number;
  accountId?: string;
  queries?: {
    id: string;
    text: string;
  }[];
  productId: number;
}

interface QueryRowProps {
  query: RowQuery;
  isExpanded: boolean;
  onToggle: () => void;
  onGenerateResponse?: (queryId: string) => Promise<void>;
  hasExistingQueries: boolean;
}

interface ExtendedQueryState {
  isLoading?: boolean;
  error?: string | null;
  status?: 'idle' | 'running' | 'completed' | 'failed';
  availableActions?: QueryAction[];
}

async function handleGenerateQueries(
  queryId: string,
  companyName: string,
  personaId: number,
  accountId: string,
  productId: number,
  setQueryState: (queryId: string, state: Partial<ExtendedQueryState>) => void,
  toast: ReturnType<typeof useToast>['toast']
) {
  try {
    setQueryState(queryId, { isLoading: true, error: null });
    
    const result = await generateQuestionsAction(
      companyName,
      personaId,
      accountId,
      productId
    );

    setQueryState(queryId, { 
      isLoading: false, 
      status: 'completed',
      availableActions: ['view_queries']
    });

    toast({
      title: "Success",
      description: `Generated ${result.queries.length} queries successfully`
    });

  } catch (error) {
    console.error('Failed to generate queries:', error);
    setQueryState(queryId, { 
      isLoading: false, 
      error: error instanceof Error ? error.message : 'Failed to generate queries',
      status: 'failed'
    });

    toast({
      title: "Error",
      description: error instanceof Error ? error.message : 'Failed to generate queries',
      variant: "destructive"
    });
  }
}

function ActionButton({ 
  action, 
  onClick, 
  disabled,
  isLoading
}: { 
  action: QueryAction
  onClick: () => void 
  disabled?: boolean
  isLoading?: boolean
}) {
  switch (action) {
    case 'generate_queries':
      return (
        <Button 
          variant="default" 
          className="bg-purple-800 hover:bg-purple-700"
          onClick={onClick}
          disabled={disabled || isLoading}
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Plus className="mr-2 h-4 w-4" />
          )}
          Generate Queries (Free)
        </Button>
      )
    case 'generate_response':
      return (
        <Button 
          variant="default" 
          className="bg-purple-800 hover:bg-purple-700"
          onClick={onClick}
          disabled={disabled || isLoading}
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Plus className="mr-2 h-4 w-4" />
          )}
          Generate Analysis
        </Button>
      )
    default:
      return null
  }
}

export function QueryRow({ query, isExpanded, onToggle, onGenerateResponse, hasExistingQueries }: QueryRowProps) {
  const { toast } = useToast()
  const queryState = useQueryStore(state => state.queries[query.id])
  const setQueryState = useQueryStore(state => state.setQueryState)
  const initializeQuery = useQueryStore(state => state.initializeQuery)

  console.log('🔵 QueryRow Render:', {
    queryId: query.id,
    hasExistingQueries,
    queryState,
    queries: query.queries
  })

  useEffect(() => {
    // Only initialize if not already initialized
    if (query.id && !queryState) {
      console.log('🟡 QueryRow initializing query:', {
        queryId: query.id,
        hasExistingQueries,
        queries: query.queries
      });
      initializeQuery(query.id, hasExistingQueries, {
        status: 'idle',
        isLoading: false,
        error: null,
        queryList: query.queries
      });
    }
  }, [query.id, hasExistingQueries, initializeQuery, queryState, query.queries]);

  const handleAction = async (action: QueryAction) => {
    if (action === 'generate_queries' && query.companyName && query.personaId && query.accountId) {
      await handleGenerateQueries(
        query.id,
        query.companyName,
        query.personaId,
        query.accountId,
        query.productId,
        setQueryState,
        toast
      )
    } else if (action === 'generate_response' && onGenerateResponse) {
      await onGenerateResponse(query.id)
    }
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-2 py-2">
        <Button
          variant="ghost"
          size="sm"
          className="gap-2"
          onClick={onToggle}
          disabled={!hasExistingQueries}
        >
          {hasExistingQueries ? (
            <>
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              <span className="text-sm text-muted-foreground">
                {query.queries?.length || 0} {query.queries?.length === 1 ? 'Query' : 'Queries'}
              </span>
            </>
          ) : null}
        </Button>
        <div className="flex items-center gap-2">
          {queryState?.availableActions?.map((action) => (
            <ActionButton 
              key={action}
              action={action}
              onClick={() => handleAction(action)}
              disabled={queryState.isLoading}
              isLoading={queryState.isLoading}
            />
          ))}
        </div>
      </div>

      {isExpanded && query.queries && query.personaId && (
        <ExpandedQueryRow
          queries={query.queries.map(q => ({
            id: parseInt(q.id),
            query_text: q.text,
            responses: [],
            buyer_journey_phase: ['unknown'],
            created_at: new Date().toISOString()
          }))}
          companyId={parseInt(query.id)}
          personaId={query.personaId}
          accountId={query.accountId || ''}
          onGenerateResponse={() => onGenerateResponse?.(query.id)}
        />
      )}
    </div>
  )
} 