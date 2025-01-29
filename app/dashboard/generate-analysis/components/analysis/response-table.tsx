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
import { Plus, ChevronDown, ChevronRight, Loader2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from 'date-fns'
import { QueryRow } from './query-row'
import { ExpandedQueryRow } from './expanded-query-row'
import type { ICP, QueryAction } from '@/app/dashboard/generate-analysis/types/analysis'
import { fetchPersonaStats, type StatsMap } from '@/lib/services/persona-stats'
import { AddICPDialog } from './add-icp-dialog'
import { AddPersonaDialog } from './add-persona-dialog'
import { toast } from "sonner"
import { createICP, createPersona } from '../../utils/db-operations'
import { useDashboardStore } from '@/app/dashboard/store'
import { getCompanyProfile } from '../../utils/actions'
import type { CompanyProfile } from '../../types/analysis'
import { generateResponsesAction, type EngineSelection } from '@/app/company-actions'

interface QueryRowData {
  id: string;
  companyName?: string;
  personaId?: number;
  accountId?: string;
  queries?: {
    id: string;
    text: string;
  }[];
}

interface ResponseTableProps {
  icps: ICP[]
  companyId: number
  companyName: string
  accountId: string
  onGenerateQuestions?: (selectedIds: string[]) => Promise<void>
  onGenerateResponses?: (selectedIds: string[]) => Promise<void>
}

export function ResponseTable({ 
  icps,
  companyId,
  companyName,
  accountId,
  onGenerateQuestions,
  onGenerateResponses
}: ResponseTableProps) {
  const [expandedPersonaId, setExpandedPersonaId] = React.useState<number | null>(null)
  const [isLoadingStats, setIsLoadingStats] = React.useState(true)
  const [stats, setStats] = React.useState<StatsMap>({})
  const [showAddICPDialog, setShowAddICPDialog] = React.useState(false)
  const [showAddPersonaDialog, setShowAddPersonaDialog] = React.useState(false)
  const [isGeneratingResponses, setIsGeneratingResponses] = React.useState<number | null>(null)
  
  // Get selected product from store
  const selectedProductId = useDashboardStore(state => state.selectedProductId)
  
  // Filter ICPs based on selected product
  const filteredICPs = React.useMemo(() => {
    if (!selectedProductId) return icps
    return icps.filter(icp => icp.product_id === Number(selectedProductId))
  }, [icps, selectedProductId])

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
        try {
          await onGenerateQuestions?.([personaId.toString()])
          // Refresh stats and company profile after generating queries
          const newStats = await fetchPersonaStats(companyId)
          setStats(newStats)
          // Refresh the company profile to get the new queries
          const updatedProfile = await getCompanyProfile(companyId, accountId)
          if (updatedProfile) {
            // Find and update the persona's queries
            const updatedICP = updatedProfile.ideal_customer_profiles.find(icp => 
              icp.personas.some(persona => persona.id === personaId)
            )
            const updatedPersona = updatedICP?.personas.find(persona => persona.id === personaId)
            if (updatedPersona?.queries?.length) {
              // Automatically expand the row to show the new queries
              setExpandedPersonaId(personaId)
              // Force a re-render by updating the window location
              window.location.reload()
            }
          }
        } catch (error) {
          console.error('Error generating queries:', error)
          toast.error(error instanceof Error ? error.message : 'Failed to generate queries')
        }
        break
      case 'generate_response':
        await handleGenerateResponse(personaId)
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
    try {
      const newICP = await createICP({
        region: values.region,
        vertical: values.vertical,
        company_size: values.company_size,
        product_id: Number(values.product_id)
      }, companyId, accountId)
      toast.success("ICP created successfully")
      // Refresh the page to show new ICP
      window.location.reload()
    } catch (error) {
      console.error('Failed to create ICP:', error)
      toast.error("Failed to create ICP")
    }
  }

  const handleAddPersona = async (values: any) => {
    try {
      const newPersona = await createPersona({
        title: values.title,
        seniority_level: 'manager_level', // Default value - we can make this configurable
        department: 'general', // Default value - we can make this configurable
      }, parseInt(values.icpId), accountId)
      toast.success("Persona created successfully")
      // Refresh the page to show new persona
      window.location.reload()
    } catch (error) {
      console.error('Failed to create Persona:', error)
      toast.error("Failed to create Persona")
    }
  }

  const handleGenerateResponse = async (personaId: number) => {
    setIsGeneratingResponses(personaId)
    try {
      // Enable all engines
      const engines: EngineSelection = {
        perplexity: true,
        gemini: true,
        claude: true,
        openai: true,
        google_search: true
      }

      await generateResponsesAction(
        companyId,
        [personaId],
        engines,
        'gpt-4-turbo-preview',
        accountId
      )

      toast.success('Successfully generated responses')
      // Refresh stats and company profile
      const newStats = await fetchPersonaStats(companyId)
      setStats(newStats)
    } catch (error) {
      console.error('Error generating responses:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to generate responses')
    } finally {
      setIsGeneratingResponses(null)
    }
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between w-full">
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
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]"></TableHead>
              <TableHead>Region</TableHead>
              <TableHead>Vertical</TableHead>
              <TableHead>Company Size</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Last Run</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredICPs.map((icp) => (
              <React.Fragment key={icp.id}>
                {icp.personas.map((persona) => {
                  const statsKey = `${icp.id}-${persona.id}`
                  const personaStats = stats[statsKey]
                  const hasQueries = persona.queries && persona.queries.length > 0
                  
                  return (
                    <React.Fragment key={persona.id}>
                      <TableRow className="group">
                        <TableCell className="w-[40px] p-2">
                          {hasQueries && (
                            <button
                              onClick={() => handleAction('view_queries', persona.id)}
                              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                            >
                              {expandedPersonaId === persona.id ? (
                                <ChevronDown className="h-5 w-5 text-gray-500" />
                              ) : (
                                <ChevronRight className="h-5 w-5 text-gray-500" />
                              )}
                              <span className="sr-only">
                                {expandedPersonaId === persona.id ? 'Hide queries' : 'Show queries'}
                              </span>
                            </button>
                          )}
                        </TableCell>
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
                          {persona.queries && persona.queries.length > 0 ? (
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleGenerateResponse(persona.id)}
                                disabled={isGeneratingResponses === persona.id}
                              >
                                {isGeneratingResponses === persona.id ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Generating...
                                  </>
                                ) : (
                                  'Generate Response'
                                )}
                              </Button>
                              <QueryRow 
                                query={{
                                  id: persona.id.toString(),
                                  companyName: companyName,
                                  personaId: persona.id,
                                  accountId: accountId,
                                  queries: persona.queries?.map(q => ({
                                    id: q.id.toString(),
                                    text: q.query_text
                                  }))
                                }}
                                isExpanded={expandedPersonaId === persona.id}
                                onToggle={() => handleAction('view_queries', persona.id)}
                              />
                            </div>
                          ) : (
                            <QueryRow 
                              query={{
                                id: persona.id.toString(),
                                companyName: companyName,
                                personaId: persona.id,
                                accountId: accountId,
                                queries: persona.queries?.map(q => ({
                                  id: q.id.toString(),
                                  text: q.query_text
                                }))
                              }}
                              isExpanded={expandedPersonaId === persona.id}
                              onToggle={() => handleAction('view_queries', persona.id)}
                            />
                          )}
                        </TableCell>
                      </TableRow>
                      {expandedPersonaId === persona.id && (
                        <TableRow>
                          <TableCell colSpan={7} className="p-0">
                            <ExpandedQueryRow 
                              queries={persona.queries || []}
                              companyId={companyId}
                              personaId={persona.id}
                              accountId={accountId}
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
      </div>

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