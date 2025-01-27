'use client';

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
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { processQueriesWithEngines } from "@/lib/actions/generate-questions";
import { createAdminClient } from "@/app/supabase/server";
import { SupabaseBatchTrackingService } from "@/lib/services/batch-tracking";

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
  accountId: string;
  selectedPrompts: {
    systemPromptName: string;
    userPromptName: string;
  };
  onGenerateStart?: () => void;
  onGenerateComplete?: () => void;
}

interface SelectedState {
  [key: string]: boolean;  // composite key of `${icp.id}-${persona.id}`
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
  accountId,
  selectedPrompts,
  onGenerateStart,
  onGenerateComplete
}: CompanyICPsTableProps) {
  console.log('ICPs Table Props:', { icps, companyId }); // Debug
  
  const [selected, setSelected] = useState<SelectedState>({});
  const [stats, setStats] = useState<StatsMap>({});
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingResponses, setIsGeneratingResponses] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof companyId !== 'number') {
      console.error('Invalid company ID:', companyId);
      return;
    }
    async function loadStats() {
      try {
        const data = await fetchPersonaStats(companyId);
        setStats(data);
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setIsLoadingStats(false);
      }
    }

    loadStats();
  }, [companyId]);

  const allSelected = icps.flatMap(icp => 
    icp.personas.map(p => `${icp.id}-${p.id}`)
  ).every(key => selected[key]);

  const toggleAll = () => {
    const newSelected: SelectedState = {};
    const allKeys = icps.flatMap(icp => 
      icp.personas.map(p => `${icp.id}-${p.id}`)
    );
    
    allKeys.forEach(key => {
      newSelected[key] = !allSelected;
    });
    setSelected(newSelected);
  };

  const toggleRow = (icp: ICP, persona: Persona) => {
    const key = `${icp.id}-${persona.id}`;
    setSelected(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleGenerateQuestions = async () => {
    const selectedPersonas = icps.flatMap(icp => {
      const selectedFromIcp = icp.personas.filter(
        persona => selected[`${icp.id}-${persona.id}`]
      );
      
      // Map each selected persona to include its ICP context
      return selectedFromIcp.map(persona => ({
        persona: {
          id: persona.id,
          title: persona.title,
          department: persona.department,
          seniority_level: persona.seniority_level
        },
        icp: {
          vertical: icp.vertical,
          company_size: icp.company_size,
          region: icp.region
        },
        company: {
          id: companyId,
          name: companyName,
          industry: companyIndustry,
          product_category: companyProductCategory,
          competitors: competitors || []
        }
      }));
    });

    if (selectedPersonas.length === 0) {
      toast({
        title: "No personas selected",
        description: "Please select at least one persona to generate questions",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    onGenerateStart?.();

    try {
      // Call server action for each selected persona
      for (const personaContext of selectedPersonas) {
        await generateQuestionsAction(
          companyName,
          selectedEngines,
          selectedPrompts.systemPromptName,
          selectedPrompts.userPromptName,
          selectedModel,
          personaContext.persona.id.toString()
        );
      }

      toast({
        title: "Generation complete",
        description: `Generated questions for ${selectedPersonas.length} personas`
      });

      // Refresh stats after generation
      const newStats = await fetchPersonaStats(companyId);
      setStats(newStats);
    } catch (error) {
      console.error('Error generating questions:', error);
      toast({
        title: "Error generating questions",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
      onGenerateComplete?.();
    }
  };

  const handleGenerateResponses = async () => {
    const selectedPersonas = icps.flatMap(icp => {
      const selectedFromIcp = icp.personas.filter(
        persona => selected[`${icp.id}-${persona.id}`]
      );
      return selectedFromIcp;
    });

    if (selectedPersonas.length === 0) {
      toast({
        title: "No personas selected",
        description: "Please select at least one persona to generate responses",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingResponses(true);
    onGenerateStart?.();

    try {
      const result = await generateResponsesAction(
        companyId,
        selectedPersonas.map(p => p.id),
        selectedEngines,
        selectedModel,
        accountId
      );

      toast({
        title: "Response generation complete",
        description: `Generated new responses for ${result.questionsCount} questions`
      });

      // Refresh stats after generation
      const newStats = await fetchPersonaStats(companyId);
      setStats(newStats);
    } catch (error) {
      console.error('Error generating responses:', error);
      toast({
        title: "Error generating responses",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingResponses(false);
      onGenerateComplete?.();
    }
  };

  if (!icps.length) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Ideal Customer Profiles</CardTitle>
            <CardDescription>ICPs and their associated personas</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={handleGenerateQuestions}
              disabled={!Object.values(selected).some(Boolean) || isGenerating}
            >
              {isGenerating ? "Generating..." : "Generate Questions"}
            </Button>
            <Button 
              onClick={handleGenerateResponses}
              disabled={!Object.values(selected).some(Boolean) || isGeneratingResponses}
              variant="secondary"
            >
              {isGeneratingResponses ? "Generating..." : "Generate New Responses"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox 
                  checked={allSelected}
                  onCheckedChange={toggleAll}
                />
              </TableHead>
              <TableHead>Region</TableHead>
              <TableHead>Vertical</TableHead>
              <TableHead>Company Size</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Seniority</TableHead>
              <TableHead>Department</TableHead>
              <TableHead className="text-right">Questions</TableHead>
              <TableHead className="text-right">Responses</TableHead>
              <TableHead className="text-right">Last Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {icps.flatMap(icp => 
              icp.personas.map(persona => {
                const key = `${icp.id}-${persona.id}`;
                const personaStats = stats[key] || {
                  questionCount: 0,
                  responseCount: 0,
                  lastBatchDate: null
                };

                return (
                  <TableRow key={key}>
                    <TableCell>
                      <Checkbox 
                        checked={selected[key] || false}
                        onCheckedChange={() => toggleRow(icp, persona)}
                      />
                    </TableCell>
                    <TableCell>{icp.region}</TableCell>
                    <TableCell>{icp.vertical}</TableCell>
                    <TableCell>{formatCompanySize(icp.company_size)}</TableCell>
                    <TableCell>{persona.title}</TableCell>
                    <TableCell>{formatSeniorityLevel(persona.seniority_level)}</TableCell>
                    <TableCell>{persona.department}</TableCell>
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
                    <TableCell className="text-right">
                      {isLoadingStats ? (
                        <Skeleton className="h-4 w-24 ml-auto" />
                      ) : (
                        personaStats.lastBatchDate ? 
                          new Date(personaStats.lastBatchDate).toLocaleDateString() :
                          'Never'
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function formatSeniorityLevel(level: string): string {
  return level
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatCompanySize(size: string): string {
  return size.charAt(0).toUpperCase() + size.slice(1);
} 