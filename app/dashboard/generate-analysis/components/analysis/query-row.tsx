'use client'

import { useEffect, useMemo } from 'react'
import { Button } from "@/components/ui/button"
import { Plus, Loader2 } from "lucide-react"
import type { Query, QueryState, QueryAction } from '../../types/analysis'
import { useQueryStore } from '../../store/query-store'
import { useToast } from '@/components/hooks/use-toast'
import { generateQuestionsAction } from '../../actions/generate'
import type { EngineSelection } from '@/app/company-actions'

interface RowQuery {
  id: string;
  companyName?: string;
  personaId?: number;
  accountId?: string;
  queries?: {
    id: string;
    text: string;
  }[];
}

interface QueryRowProps {
  query: RowQuery;
  isExpanded: boolean;
  onToggle: () => void;
  onGenerateResponse?: (queryId: string) => Promise<void>;
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
  setQueryState: (queryId: string, state: Partial<ExtendedQueryState>) => void,
  toast: ReturnType<typeof useToast>['toast']
) {
  try {
    setQueryState(queryId, { isLoading: true, error: null });
    
    const result = await generateQuestionsAction(
      companyName,
      personaId,
      accountId
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
    default:
      return null
  }
}

export function QueryRow({ query, onGenerateResponse }: QueryRowProps) {
  const { toast } = useToast()
  const queryState = useQueryStore(state => state.queries[query.id])
  const setQueryState = useQueryStore(state => state.setQueryState)
  const initializeQuery = useQueryStore(state => state.initializeQuery)

  useEffect(() => {
    if (query.id) {
      initializeQuery(query.id)
    }
  }, [query.id, initializeQuery])

  const handleAction = async (action: QueryAction) => {
    if (action === 'generate_queries' && query.companyName && query.personaId && query.accountId) {
      await handleGenerateQueries(
        query.id,
        query.companyName,
        query.personaId,
        query.accountId,
        setQueryState,
        toast
      )
    }
  }

  return (
    <div className="flex items-center justify-end gap-2">
      {queryState?.availableActions?.map((action) => (
        action === 'generate_queries' && (
          <ActionButton 
            key={action}
            action={action}
            onClick={() => handleAction(action)}
            disabled={queryState.isLoading}
            isLoading={queryState.isLoading}
          />
        )
      ))}
    </div>
  )
} 