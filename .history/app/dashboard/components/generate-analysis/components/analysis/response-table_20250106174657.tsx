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
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from 'date-fns'
import { QueryRow } from './query-row'
import { ExpandedQueryRow } from './expanded-query-row'
import type { ICP, QueryAction } from '@/app/dashboard/components/generate-analysis/types/analysis'
import { fetchPersonaStats, type StatsMap } from '@/lib/services/persona-stats'
import { AddICPDialog } from './add-icp-dialog'
import { AddPersonaDialog } from './add-persona-dialog'
import { toast } from "sonner"

interface ResponseTableProps {
  icps: ICP[]
  companyId: number
  onGenerateQuestions?: (selectedIds: string[]) => Promise<void>
  onGenerateResponses?: (selectedIds: string[]) => Promise<void>
}

export function ResponseTable({ 
  icps,
  companyId,
  onGenerateQuestions,
  onGenerateResponses
}: ResponseTableProps) {
  const [expandedPersonaId, setExpandedPersonaId] = React.useState<number | null>(null)
  const [isLoadingStats, setIsLoadingStats] = React.useState(true)
  const [stats, setStats] = React.useState<StatsMap>({})
  const [showAddICPDialog, setShowAddICPDialog] = React.useState(false)
  const [showAddPersonaDialog, setShowAddPersonaDialog] = React.useState(false)

  React.useEffect(() => {
    async function loadStats() {
      if (!companyId) return
      
      try {
        const data = await fetchPersonaStats(companyId)
        setStats(data)
      } catch (error) {
        console.error('Error loading stats:', error)
      } finally {
        setIsLoadingStats(false)
      }
    }

    loadStats()
  }, [companyId])

  const handleAction = async (action: QueryAction, personaId: number) => {
    switch (action) {
      case 'generate_queries':
        await onGenerateQuestions?.([personaId.toString()])
        // Refresh stats after generating queries
        const newStats = await fetchPersonaStats(companyId)
        setStats(newStats)
        break
      case 'generate_response':
        await onGenerateResponses?.([personaId.toString()])
        // Refresh stats after generating responses
        const updatedStats = await fetchPersonaStats(companyId)
        setStats(updatedStats)
        break
      case 'view_queries':
        setExpandedPersonaId(expandedPersonaId === personaId ? null : personaId)
        break
      case 'view_responses':
        // Handle view responses
        break
    }
  }

  const handleAddICP = async (values: any) => {
    // TODO: Connect to backend
    toast.info("This feature will be connected to the backend soon")
    console.log('Adding ICP:', values)
  }

  const handleAddPersona = async (values: any) => {
    // TODO: Connect to backend
    toast.info("This feature will be connected to the backend soon")
    console.log('Adding Persona:', values)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">ICPs and Personas</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddICPDialog(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add ICP
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddPersonaDialog(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Persona
          </Button>
        </div>
      </div>
      
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
              {icp.personas.map((persona) => {
                const statsKey = `${icp.id}-${persona.id}`
                const personaStats = stats[statsKey]
                
                return (
                  <React.Fragment key={persona.id}>
                    <TableRow className="group">
                      <TableCell>{icp.region}</TableCell>
                      <TableCell>{icp.vertical}</TableCell>
                      <TableCell>{icp.company_size}</TableCell>
                      <TableCell>{persona.title}</TableCell>
                      <TableCell>
                        {isLoadingStats ? (
                          <Skeleton className="h-4 w-24 ml-auto" />
                        ) : (
                          personaStats?.lastBatchDate ? 
                            new Date(personaStats.lastBatchDate).toLocaleDateString() :
                            'Never'
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
                )
              })}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>

      <AddICPDialog
        open={showAddICPDialog}
        onOpenChange={setShowAddICPDialog}
        onSubmit={handleAddICP}
      />

      <AddPersonaDialog
        open={showAddPersonaDialog}
        onOpenChange={setShowAddPersonaDialog}
        onSubmit={handleAddPersona}
        icps={icps}
      />
    </div>
  )
}