'use client'

import * as React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { format, formatDistanceToNow } from 'date-fns'
import { QueryRow } from './query-row'
import { ExpandedQueryRow } from './expanded-query-row'
import type { ICP, QueryAction, Query } from '../../types/analysis'

interface ResponseTableProps {
  icps: ICP[]
  onGenerateQuestions?: (selectedIds: string[]) => Promise<void>
  onGenerateResponses?: (selectedIds: string[]) => Promise<void>
}

function getLatestResponseInfo(queries: Query[]) {
  let latestDate: string | null = null;
  let totalResponses = 0;
  
  // Get all query IDs
  const queryIds = queries.map(query => query.id);
  
  // Look for responses with these query IDs
  for (const query of queries) {
    // We only need to know if there's a response and when it was created
    const latestResponse = query.responses?.[0];
    if (latestResponse?.created_at) {
      totalResponses++;
      if (!latestDate || new Date(latestResponse.created_at) > new Date(latestDate)) {
        latestDate = latestResponse.created_at;
      }
    }
  }
  
  return { latestDate, responseCount: totalResponses };
}

function formatResponseStatus(queries: Query[], queryCount: number) {
  const { latestDate, responseCount } = getLatestResponseInfo(queries);
  
  if (!latestDate) return 'Never';
  
  const date = new Date(latestDate);
  const relativeTime = formatDistanceToNow(date, { addSuffix: true });
  const exactDate = format(date, 'MMM d, yyyy HH:mm');
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className="text-muted-foreground hover:text-foreground transition-colors">
          {relativeTime}
          {responseCount > 0 && ` (${responseCount}/${queryCount} queries)`}
        </TooltipTrigger>
        <TooltipContent>
          <p>Last run: {exactDate}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function ResponseTable({ 
  icps,
  onGenerateQuestions,
  onGenerateResponses
}: ResponseTableProps) {
  const [expandedPersonaId, setExpandedPersonaId] = React.useState<number | null>(null)

  const handleAction = async (action: QueryAction, personaId: number) => {
    switch (action) {
      case 'generate_queries':
        await onGenerateQuestions?.([personaId.toString()])
        break
      case 'generate_response':
        await onGenerateResponses?.([personaId.toString()])
        break
      case 'view_queries':
        setExpandedPersonaId(expandedPersonaId === personaId ? null : personaId)
        break
      case 'view_responses':
        // Handle view responses
        break
    }
  }

  return (
    <div className="space-y-1">
      <h3 className="text-lg font-semibold mb-4">ICPs and Personas</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Region</TableHead>
            <TableHead>Vertical</TableHead>
            <TableHead>Company Size</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Last Run</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {icps.map((icp) => (
            <React.Fragment key={icp.id}>
              {icp.personas.map((persona) => (
                <React.Fragment key={persona.id}>
                  <TableRow className="group">
                    <TableCell>{icp.region}</TableCell>
                    <TableCell>{icp.vertical}</TableCell>
                    <TableCell>{icp.company_size}</TableCell>
                    <TableCell>{persona.title}</TableCell>
                    <TableCell>
                      {formatResponseStatus(
                        persona.queries,
                        persona.queryState?.queryCount || 0
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <QueryRow 
                        queryState={persona.queryState!}
                        queries={persona.queries}
                        onAction={(action) => handleAction(action, persona.id)}
                      />
                    </TableCell>
                  </TableRow>
                  {expandedPersonaId === persona.id && (
                    <TableRow>
                      <TableCell colSpan={6} className="p-0">
                        <ExpandedQueryRow 
                          queries={persona.queries}
                          onGenerateResponse={() => handleAction('generate_response', persona.id)}
                        />
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}