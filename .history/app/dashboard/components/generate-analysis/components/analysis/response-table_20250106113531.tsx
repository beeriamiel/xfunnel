'use client'

import { useState, useEffect } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Loader2, MessageSquare } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { QuerySection } from './query-section'
import type { ICP, Persona, ICPPersonaCombination } from '../../types/analysis'

interface ResponseTableProps {
  icps: ICP[];
  personas: Persona[];
  onGenerateQuestions: (selectedIds: string[]) => void;
  onGenerateResponses: (selectedIds: string[]) => void;
}

export function ResponseTable({ 
  icps, 
  personas,
  onGenerateQuestions,
  onGenerateResponses 
}: ResponseTableProps) {
  const [combinations, setCombinations] = useState<ICPPersonaCombination[]>([])
  const [newQuery, setNewQuery] = useState("")

  useEffect(() => {
    const newCombinations: ICPPersonaCombination[] = []
    icps.forEach(icp => {
      personas.forEach(persona => {
        newCombinations.push({
          id: `${icp.id}-${persona.id}`,
          region: icp.region,
          vertical: icp.vertical,
          company_size: icp.company_size,
          title: persona.title,
          seniority_level: persona.seniority_level,
          department: persona.department,
          lastUpdated: null,
          queries: [],
          isGeneratingQueries: false,
          isExpanded: false,
          lastAnalysisRun: null,
          isAnalyzing: false,
          hasAnalysis: false,
          analysisHistory: []
        })
      })
    })
    setCombinations(newCombinations)
  }, [icps, personas])

  const handleGenerateQueries = async (combination: ICPPersonaCombination) => {
    setCombinations(prev => prev.map(c => 
      c.id === combination.id 
        ? { ...c, isGeneratingQueries: true }
        : c
    ))

    await onGenerateQuestions([combination.id])

    setCombinations(prev => prev.map(c => 
      c.id === combination.id 
        ? { ...c, isGeneratingQueries: false, isExpanded: true }
        : c
    ))
  }

  const toggleExpanded = (id: string) => {
    setCombinations(prev => prev.map(c => 
      c.id === id 
        ? { ...c, isExpanded: !c.isExpanded }
        : c
    ))
  }

  const handleAddQuery = (combinationId: string) => {
    if (!newQuery.trim()) return

    const [icpId, personaId] = combinationId.split('-')
    const icp = icps.find(i => i.id === icpId)
    const persona = personas.find(p => p.id === personaId)

    if (!icp || !persona) return

    setCombinations(prev => prev.map(c => 
      c.id === combinationId 
        ? { 
            ...c, 
            queries: [...c.queries, { 
              id: crypto.randomUUID(), 
              text: newQuery.trim(),
              icp,
              persona,
              status: 'pending'
            }]
          }
        : c
    ))
    setNewQuery("")
  }

  const handleRunAnalysis = async (combination: ICPPersonaCombination) => {
    setCombinations(prev => prev.map(c => 
      c.id === combination.id 
        ? { ...c, isAnalyzing: true }
        : c
    ))

    await onGenerateResponses([combination.id])

    const now = new Date().toISOString()
    setCombinations(prev => prev.map(c => 
      c.id === combination.id 
        ? { 
            ...c, 
            isAnalyzing: false, 
            hasAnalysis: true,
            lastAnalysisRun: now,
            analysisHistory: [
              ...(c.analysisHistory || []),
              {
                runDate: now,
                status: 'completed'
              }
            ]
          }
        : c
    ))
  }

  const formatLastRun = (date: string | null): string => {
    if (!date) return "Never"
    const now = new Date()
    const lastRun = new Date(date)
    const diff = now.getTime() - lastRun.getTime()
    const minutes = Math.floor(diff / 60000)
    if (minutes < 60) return `${minutes} minutes ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} hours ago`
    const days = Math.floor(hours / 24)
    return `${days} days ago`
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-[#30035e]">ICPs and Personas</h3>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Region</TableHead>
              <TableHead>Vertical</TableHead>
              <TableHead>Company Size</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Seniority</TableHead>
              <TableHead>Department</TableHead>
              <TableHead className="text-right">Last Run</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {combinations.map((combination) => (
              <>
                <TableRow key={combination.id} className="group">
                  <TableCell>{combination.region}</TableCell>
                  <TableCell>{combination.vertical}</TableCell>
                  <TableCell>{combination.company_size}</TableCell>
                  <TableCell>{combination.title}</TableCell>
                  <TableCell>{combination.seniority_level}</TableCell>
                  <TableCell>{combination.department}</TableCell>
                  <TableCell className="text-right">
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <span className={`text-sm cursor-help ${
                          !combination.lastAnalysisRun 
                            ? "text-muted-foreground" 
                            : "text-[#30035e]"
                        }`}>
                          {formatLastRun(combination.lastAnalysisRun)}
                        </span>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-auto">
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Analysis History</p>
                          {combination.analysisHistory?.length > 0 ? (
                            <div className="space-y-1">
                              {combination.analysisHistory.slice().reverse().map((run, index) => (
                                <div key={run.runDate} className="text-sm flex items-center gap-2">
                                  <span className={`w-2 h-2 rounded-full ${
                                    run.status === 'completed' ? "bg-green-500" : "bg-red-500"
                                  }`} />
                                  <span>{new Date(run.runDate).toLocaleString()}</span>
                                  {index === 0 && <div className="text-xs text-muted-foreground">Latest</div>}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">No analysis has been run yet</p>
                          )}
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    {combination.queries.length > 0 ? (
                      <>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => toggleExpanded(combination.id)}
                          className={`text-[#30035e] hover:text-[#30035e]/90 transition-colors ${
                            combination.isExpanded && "bg-[#f6efff]"
                          }`}
                        >
                          {combination.isExpanded ? 'Hide' : 'View'} {combination.queries.length} Queries
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRunAnalysis(combination)}
                          className="border-[#30035e] text-[#30035e] hover:bg-[#30035e]/10 font-medium"
                          disabled={combination.isAnalyzing}
                        >
                          {combination.isAnalyzing ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Running Analysis...
                            </>
                          ) : (
                            <>
                              {combination.hasAnalysis ? 'Re-run Analysis' : 'Run Full Analysis'} (500 credits)
                            </>
                          )}
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        className="bg-[#30035e] hover:bg-[#30035e]/90"
                        onClick={() => handleGenerateQueries(combination)}
                        disabled={combination.isGeneratingQueries}
                      >
                        {combination.isGeneratingQueries ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4 mr-2" />
                            Generate Queries (Free)
                          </>
                        )}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
                {combination.isExpanded && combination.queries && (
                  <TableRow>
                    <TableCell colSpan={8}>
                      <QuerySection
                        queries={combination.queries}
                        onAddQuery={(text) => handleAddQuery(combination.id)}
                        newQuery={newQuery}
                        onNewQueryChange={(e) => setNewQuery(e.target.value)}
                      />
                    </TableCell>
                  </TableRow>
                )}
              </>
            ))}
            {combinations.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                  No combinations available. Add ICPs and Personas to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
} 