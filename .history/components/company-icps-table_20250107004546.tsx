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
  selectedPrompts,
  onGenerateStart,
  onGenerateComplete
}: CompanyICPsTableProps) {
  const [selected, setSelected] = useState<SelectedState>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingResponses, setIsGeneratingResponses] = useState(false);
  const { toast } = useToast();

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>ICPs and Personas</CardTitle>
        <CardDescription>Manage your ideal customer profiles and personas</CardDescription>
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
              <TableHead>Department</TableHead>
              <TableHead>Seniority</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {icps.map(icp => (
              icp.personas.map(persona => (
                <TableRow key={`${icp.id}-${persona.id}`}>
                  <TableCell>
                    <Checkbox 
                      checked={selected[`${icp.id}-${persona.id}`] || false}
                      onCheckedChange={() => toggleRow(icp, persona)}
                    />
                  </TableCell>
                  <TableCell>{icp.region}</TableCell>
                  <TableCell>{icp.vertical}</TableCell>
                  <TableCell>{formatCompanySize(icp.company_size)}</TableCell>
                  <TableCell>{persona.title}</TableCell>
                  <TableCell>{persona.department}</TableCell>
                  <TableCell>{formatSeniorityLevel(persona.seniority_level)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleGenerateQuestions()}
                      disabled={isGenerating}
                    >
                      Generate Questions
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function formatSeniorityLevel(level: string): string {
  return level.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
}

function formatCompanySize(size: string): string {
  return size.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
} 