"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { generateQuestionsAction } from "@/app/company-actions";
import { useToast } from "@/components/hooks/use-toast";
import { SimpleCompanySelector } from './simple-company-selector';
import { QuestionPromptSelector } from './question-prompt-selector';
import { EngineSelector } from './engine-selector';
import { createClient } from '@/app/supabase/client';
import { CompanyICPsTable } from './company-icps-table';

interface Company {
  id: number;
  name: string;
  industry: string | null;
}

interface Prompt {
  id: number;
  name: string;
  prompt_text: string;
  is_active: boolean;
  prompt_type: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export function GenerateQuestionsButton() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [selectedSystemPrompt, setSelectedSystemPrompt] = useState<string>();
  const [selectedUserPrompt, setSelectedUserPrompt] = useState<string>();
  const [icps, setIcps] = useState<any[]>([]);
  const [engines, setEngines] = useState({
    openai: true,
    claude: false,
    gemini: false,
    perplexity: false,
    google_search: false
  });

  const { toast } = useToast();
  const supabase = createClient();

  // Fetch companies and prompts on mount
  useEffect(() => {
    async function fetchInitialData() {
      try {
        // Fetch companies
        const { data: companiesData, error: companiesError } = await supabase
          .from('companies')
          .select('id, name, industry')
          .order('name');

        if (companiesError) throw companiesError;
        setCompanies(companiesData || []);

        // Fetch prompts
        const { data: promptsData, error: promptsError } = await supabase
          .from('prompts')
          .select('*')
          .eq('is_active', true);

        if (promptsError) throw promptsError;
        
        // Process prompts to ensure is_active is never null
        const processedPrompts = (promptsData || []).map(prompt => ({
          ...prompt,
          is_active: prompt.is_active ?? false
        }));
        setPrompts(processedPrompts);

        // Set default prompts if available
        const systemPrompt = promptsData?.find(p => p.name.toLowerCase().includes('questions') && p.name.toLowerCase().includes('system'));
        const userPrompt = promptsData?.find(p => p.name.toLowerCase().includes('questions') && p.name.toLowerCase().includes('user'));

        if (systemPrompt) setSelectedSystemPrompt(systemPrompt.name);
        if (userPrompt) setSelectedUserPrompt(userPrompt.name);

      } catch (error) {
        console.error('Error fetching initial data:', error);
        toast({
          title: "Error loading data",
          description: "Please refresh the page to try again",
          variant: "destructive"
        });
      }
    }

    fetchInitialData();
  }, []);

  // Add effect to fetch ICPs when company is selected
  useEffect(() => {
    async function fetchICPs() {
      if (!selectedCompany) {
        setIcps([]);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('ideal_customer_profiles')
          .select(`
            id,
            vertical,
            company_size,
            region,
            personas (
              id,
              title,
              department,
              seniority_level
            )
          `)
          .eq('company_id', selectedCompany.id);

        if (error) throw error;
        setIcps(data || []);
      } catch (error) {
        console.error('Error fetching ICPs:', error);
        toast({
          title: "Error loading ICPs",
          description: "Failed to load ICPs for selected company",
          variant: "destructive"
        });
      }
    }

    fetchICPs();
  }, [selectedCompany?.id]);

  async function handleGenerate() {
    if (!selectedCompany) {
      toast({
        title: "Company required",
        description: "Please select a company",
        variant: "destructive"
      });
      return;
    }

    if (!selectedSystemPrompt || !selectedUserPrompt) {
      toast({
        title: "Prompts required",
        description: "Please select both system and user prompts",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setProgress(0);

    try {
      await generateQuestionsAction(
        selectedCompany.name,
        engines,
        selectedSystemPrompt,
        selectedUserPrompt
      );

      toast({
        title: "Success",
        description: "Questions generated successfully"
      });
    } catch (error) {
      console.error('Generation failed:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
      setProgress(100);
    }
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <h3 className="text-lg font-medium">Generate Questions</h3>
        
        <div className="space-y-4">
          {/* Company Selection */}
          <SimpleCompanySelector
            selectedCompany={selectedCompany}
            companies={companies}
            onCompanySelect={setSelectedCompany}
            disabled={isGenerating}
          />

          {/* Prompt Selection */}
          <QuestionPromptSelector
            selectedSystemPrompt={selectedSystemPrompt}
            selectedUserPrompt={selectedUserPrompt}
            onSystemPromptSelect={setSelectedSystemPrompt}
            onUserPromptSelect={setSelectedUserPrompt}
            prompts={prompts}
            disabled={isGenerating}
          />

          {/* Engine Selection */}
          <EngineSelector
            engines={engines}
            onChange={setEngines}
            disabled={isGenerating}
          />

          {/* Company ICPs Table */}
          {selectedCompany && selectedSystemPrompt && selectedUserPrompt && (
            <CompanyICPsTable
              icps={icps}
              companyId={selectedCompany.id}
              companyName={selectedCompany.name}
              companyIndustry={null}
              companyProductCategory={null}
              selectedEngines={engines}
              selectedModel="gpt-4-turbo-preview"
              selectedPrompts={{
                systemPromptName: selectedSystemPrompt,
                userPromptName: selectedUserPrompt
              }}
              onGenerateStart={() => setIsGenerating(true)}
              onGenerateComplete={() => setIsGenerating(false)}
            />
          )}

          {/* Generate Button */}
          <div className="flex justify-end">
            <Button 
              onClick={handleGenerate}
              disabled={isGenerating || !selectedCompany || !selectedSystemPrompt || !selectedUserPrompt}
            >
              {isGenerating ? "Generating..." : "Generate"}
            </Button>
          </div>
        </div>

        {/* Progress Indicator */}
        {isGenerating && (
          <div className="space-y-2">
            <Progress value={progress} />
            <p className="text-sm text-muted-foreground">
              Generating questions...
            </p>
          </div>
        )}
      </div>
    </Card>
  );
} 