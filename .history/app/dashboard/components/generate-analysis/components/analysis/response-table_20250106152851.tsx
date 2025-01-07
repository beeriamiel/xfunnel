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
import { QueryRow } from './query-row'
import type { ICP, QueryAction } from '../../types/analysis'

interface ResponseTableProps {
  icps: ICP[]
  onGenerateQuestions?: (selectedIds: string[]) => Promise<void>
  onGenerateResponses?: (selectedIds: string[]) => Promise<void>
}

export function ResponseTable({ 
  icps,
  onGenerateQuestions,
  onGenerateResponses
}: ResponseTableProps) {
  const handleAction = async (action: QueryAction, personaId: number) => {
    switch (action) {
      case 'generate_queries':
        await onGenerateQuestions?.([personaId.toString()])
        break
      case 'generate_response':
        await onGenerateResponses?.([personaId.toString()])
        break
      case 'view_queries':
        // Handle view queries
        break
      case 'view_responses':
        // Handle view responses
        break
    }
  }

  return (
    <div>
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
                <TableRow key={persona.id}>
                  <TableCell>{icp.region}</TableCell>
                  <TableCell>{icp.vertical}</TableCell>
                  <TableCell>{icp.company_size}</TableCell>
                  <TableCell>{persona.title}</TableCell>
                  <TableCell>
                    <QueryRow 
                      queryState={persona.queryState!}
                      queries={persona.queries}
                      onAction={(action) => handleAction(action, persona.id)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    {/* Actions are now handled by QueryRow */}
                  </TableCell>
                </TableRow>
              ))}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 