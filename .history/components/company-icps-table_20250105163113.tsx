'use client';

import * as React from "react";
import { useEffect, useState } from 'react';
import { fetchPersonaStats, type PersonaStats, type StatsMap } from '@/lib/services/persona-stats';
import { Button } from "@/components/ui/button";
import { EngineSelection, generateQuestionsAction, generateResponsesAction } from "@/app/company-actions";
import { AIModelType } from "@/lib/services/ai/types";
import { useToast } from "@/components/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { processQueriesWithEngines } from "@/lib/actions/generate-questions";
import { createAdminClient } from "@/app/supabase/server";
import { SupabaseBatchTrackingService } from "@/lib/services/batch-tracking";
import { ChevronDown, ChevronUp, Loader2, MessageSquare, Plus } from "lucide-react";

interface Persona {
  id: number;
  title: string;
  seniority_level: string;
  department: string;
}

interface ICP {
  id: number;
  vertical: string;
  company_size: string;
  region: string;
  personas: Persona[];
}

interface CompanyICPsTableProps {
  icps: ICP[];
  companyId: number;
  companyName: string;
  companyIndustry: string | null;
  companyProductCategory: string | null;
  competitors?: { competitor_name: string }[];
  selectedEngines: EngineSelection;
  selectedModel: AIModelType;
  selectedPrompts: {
    systemPromptName: string;
    userPromptName: string;
  };
  onGenerateStart?: () => void;
  onGenerateComplete?: () => void;
}

interface Query {
  id: string;
  text: string;
  buyerJourneyPhase: string;
}

interface ICPPersonaCombination {
  id: string;
  region: string;
  vertical: string;
  companySize: string;
  title: string;
  seniority: string;
  department: string;
  queries: Query[] | null;
  analysisStatus: 'not_started' | 'queued' | 'in_progress' | 'completed';
  lastUpdated: string | null;
}

export function CompanyICPsTable({ 
  icps, 
  companyId,
  companyName,
  companyIndustry,
  companyProductCategory,
  competitors = [],
  selectedEngines,
  selectedModel,
  selectedPrompts,
  onGenerateStart,
  onGenerateComplete
}: CompanyICPsTableProps): JSX.Element {
  const [combinations, setCombinations] = useState<ICPPersonaCombination[]>([])
  const [expandedRows, setExpandedRows] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState<{ [key: string]: boolean }>({})
  const [isRunningAnalysis, setIsRunningAnalysis] = useState<{ [key: string]: boolean }>({})
  const [stats, setStats] = useState<StatsMap>({})
  const [isLoadingStats, setIsLoadingStats] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    if (typeof companyId !== 'number') {
      console.error('Invalid company ID:', companyId)
      return
    }
    async function loadStats() {
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

  // Generate combinations of ICPs and Personas
  useEffect(() => {
    const newCombinations: ICPPersonaCombination[] = []
    icps.forEach(icp => {
      icp.personas.forEach(persona => {
        newCombinations.push({
          id: `${icp.id}-${persona.id}`,
          region: icp.region,
          vertical: icp.vertical,
          companySize: icp.company_size,
          title: persona.title,
          seniority: persona.seniority_level,
          department: persona.department,
          queries: null,
          analysisStatus: 'not_started',
          lastUpdated: null
        })
      })
    })
    setCombinations(newCombinations)
  }, [icps])

  const toggleExpanded = (id: string) => {
    setExpandedRows(prev =>
      prev.includes(id)
        ? prev.filter(rowId => rowId !== id)
        : [...prev, id]
    )
  }

  const handleGenerateQueriesForRow = async (combinationId: string) => {
    setIsGenerating(prev => ({ ...prev, [combinationId]: true }))
    try {
      const [icpId, personaId] = combinationId.split('-').map(Number)
      await generateQuestionsAction(
        companyName,
        selectedEngines,
        selectedPrompts.systemPromptName,
        selectedPrompts.userPromptName,
        selectedModel,
        personaId
      )

      // Refresh stats after generation
      const newStats = await fetchPersonaStats(companyId)
      setStats(newStats)

      toast({
        title: "Generation complete",
        description: "Generated queries for the selected ICP/Persona combination"
      })
    } catch (error) {
      console.error('Failed to generate queries:', error)
      toast({
        title: "Error generating queries",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(prev => ({ ...prev, [combinationId]: false }))
    }
  }

  const handleRunAnalysis = async (combinationId: string) => {
    setIsRunningAnalysis(prev => ({ ...prev, [combinationId]: true }))
    try {
      const [icpId, personaId] = combinationId.split('-').map(Number)
      const result = await generateResponsesAction(
        companyId,
        [personaId],
        selectedEngines,
        selectedModel
      )

      // Refresh stats after generation
      const newStats = await fetchPersonaStats(companyId)
      setStats(newStats)

      toast({
        title: "Analysis complete",
        description: `Generated new responses for ${result.questionsCount} questions`
      })

      setCombinations(prev =>
        prev.map(c =>
          c.id === combinationId
            ? { ...c, analysisStatus: 'completed', lastUpdated: new Date().toISOString() }
            : c
        )
      )
    } catch (error) {
      console.error('Failed to run analysis:', error)
      toast({
        title: "Error running analysis",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      })
    } finally {
      setIsRunningAnalysis(prev => ({ ...prev, [combinationId]: false }))
    }
  }

  if (!icps.length) return <div />;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Ideal Customer Profiles</CardTitle>
            <CardDescription>ICPs and their associated personas</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Region</TableHead>
              <TableHead>Vertical</TableHead>
              <TableHead>Company Size</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Seniority</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Questions</TableHead>
              <TableHead>Responses</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {combinations.map((combination) => {
              const personaStats = stats[combination.id] || {
                questionCount: 0,
                responseCount: 0,
                lastBatchDate: null
              }

              return (
                <React.Fragment key={combination.id}>
                  <TableRow>
                    <TableCell>{combination.region}</TableCell>
                    <TableCell>{combination.vertical}</TableCell>
                    <TableCell>{formatCompanySize(combination.companySize)}</TableCell>
                    <TableCell>{combination.title}</TableCell>
                    <TableCell>{formatSeniorityLevel(combination.seniority)}</TableCell>
                    <TableCell>{combination.department}</TableCell>
                    <TableCell className="text-right">
                      {isLoadingStats ? (
                        <Skeleton className="h-4 w-8 ml-auto" />
                      ) : (
                        personaStats.questionCount
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {isLoadingStats ? (
                        <Skeleton className="h-4 w-8 ml-auto" />
                      ) : (
                        personaStats.responseCount
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleGenerateQueriesForRow(combination.id)}
                          disabled={isGenerating[combination.id]}
                        >
                          {isGenerating[combination.id] ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <Plus className="h-4 w-4 mr-2" />
                          )}
                          Generate Queries
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRunAnalysis(combination.id)}
                          disabled={isRunningAnalysis[combination.id] || personaStats.questionCount === 0}
                        >
                          {isRunningAnalysis[combination.id] ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <MessageSquare className="h-4 w-4 mr-2" />
                          )}
                          Run Full Analysis (500 points)
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpanded(combination.id)}
                        >
                          {expandedRows.includes(combination.id) ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  {expandedRows.includes(combination.id) && (
                    <TableRow>
                      <TableCell colSpan={9}>
                        <div className="p-4 bg-muted/50 rounded-md">
                          {personaStats.questionCount > 0 ? (
                            <>
                              <div className="flex items-center justify-between mb-4">
                                <Badge variant="outline">
                                  Last Updated: {personaStats.lastBatchDate ? new Date(personaStats.lastBatchDate).toLocaleString() : 'Never'}
                                </Badge>
                                {personaStats.responseCount > 0 && (
                                  <Badge variant="secondary">
                                    {personaStats.responseCount} Responses Generated
                                  </Badge>
                                )}
                              </div>
                              <div className="grid gap-4">
                                <div>
                                  <h4 className="text-sm font-medium mb-2">Generated Questions</h4>
                                  <div className="text-sm text-muted-foreground">
                                    {personaStats.questionCount} questions have been generated for this ICP/Persona combination.
                                  </div>
                                </div>
                                {personaStats.responseCount > 0 && (
                                  <div>
                                    <h4 className="text-sm font-medium mb-2">Analysis Results</h4>
                                    <div className="text-sm text-muted-foreground">
                                      Full analysis has been completed with {personaStats.responseCount} responses.
                                    </div>
                                  </div>
                                )}
                              </div>
                            </>
                          ) : (
                            <div className="text-sm text-muted-foreground">
                              No questions have been generated yet. Click "Generate Queries" to get started.
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function formatSeniorityLevel(level: string): string {
  return level
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function formatCompanySize(size: string): string {
  return size.charAt(0).toUpperCase() + size.slice(1)
} 