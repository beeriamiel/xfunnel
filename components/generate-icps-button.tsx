"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { generateICPsAction } from "@/app/company-actions";
import { useToast } from "@/components/hooks/use-toast";
import { SimpleCompanySelector } from './simple-company-selector';
import { CompanyDetails } from './company-details';
import { CompanyICPsTable } from './company-icps-table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from '@/app/supabase/client';
import { QuestionPromptSelector } from './question-prompt-selector';
import { EngineSelector } from './engine-selector';
import { EngineSelection, PromptSelection } from "@/app/company-actions";
import { useModelSelection } from "@/hooks/use-model-selection";
import { ModelSelector } from "./model-selector";
import { ModelSelection } from "@/app/company-actions";
import { ICPDetailsEditor } from './icp-details-editor';
import { CompetitorDetailsEditor } from './competitor-details-editor';
import { Pencil, Eye } from "lucide-react";

interface BasicCompany {
  id: number;
  name: string;
  industry: string | null;
}

interface Company {
  id: number;
  name: string;
  industry: string | null;
  product_category: string | null;
  annual_revenue: string | null;
  markets_operating_in: string[];
  number_of_employees: number | null;
  main_products: string[];
  created_at: string;
}

interface Competitor {
  competitor_name: string;
}

interface ICP {
  id: number;
  vertical: string;
  company_size: string;
  region: string;
  personas: {
    id: number;
    title: string;
    seniority_level: string;
    department: string;
  }[];
}

interface Prompt {
  id: number;
  name: string;
  prompt_text: string;
  is_active: boolean | null;
  prompt_type: string | null;
  created_at: string | null;
  updated_at: string | null;
}

// Helper function to get active engines
function getActiveEngines(engines: EngineSelection): string[] {
  return (Object.keys(engines) as Array<keyof EngineSelection>)
    .filter(key => engines[key]);
}

export function GenerateICPsButton() {
  // Input mode state
  const [inputMode, setInputMode] = useState<'select' | 'new'>('select');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [newCompanyName, setNewCompanyName] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // Company data states
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [icps, setIcps] = useState<ICP[]>([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Prompt states
  const [selectedICPSystemPrompt, setSelectedICPSystemPrompt] = useState<string>();
  const [selectedICPUserPrompt, setSelectedICPUserPrompt] = useState<string>();
  const [selectedQuestionSystemPrompt, setSelectedQuestionSystemPrompt] = useState<string>();
  const [selectedQuestionUserPrompt, setSelectedQuestionUserPrompt] = useState<string>();
  const [engines, setEngines] = useState<EngineSelection>({
    openai: true,
    claude: false,
    gemini: false,
    perplexity: false,
    google_search: false
  });
  const [prompts, setPrompts] = useState<Prompt[]>([]);

  // Model selection states
  const { modelSelection, updateICPModel, updateQuestionModel } = useModelSelection({
    icpModel: 'claude-3.5-sonnet',
    questionModel: 'claude-3.5-sonnet'
  });

  const { toast } = useToast();
  const supabase = createClient();

  const [isEditMode, setIsEditMode] = useState(false);

  // Fetch company details
  async function fetchCompanyData(companyId: number) {
    setIsLoadingDetails(true);
    
    try {
      // Fetch competitors
      const { data: competitorsData } = await supabase
        .from('competitors')
        .select('competitor_name')
        .eq('company_id', companyId);

      // Fetch ICPs and their personas
      const { data: icpsData } = await supabase
        .from('ideal_customer_profiles')
        .select(`
          id,
          vertical,
          company_size,
          region,
          personas!fk_personas_icp (
            id,
            title,
            seniority_level,
            department
          )
        `)
        .eq('company_id', companyId);

      if (competitorsData) setCompetitors(competitorsData);
      if (icpsData) setIcps(icpsData);

    } catch (error) {
      console.error('Error fetching company data:', error);
      toast({
        title: "Error loading company data",
        description: "Please try refreshing the page",
        variant: "destructive"
      });
    } finally {
      setIsLoadingDetails(false);
    }
  }

  // Handle company selection
  const handleCompanySelect = async (company: BasicCompany | null) => {
    if (company) {
      // Fetch full company details
      const { data: fullCompany } = await supabase
        .from('companies')
        .select('*')
        .eq('id', company.id)
        .single();

      if (fullCompany) {
        setSelectedCompany({
          ...fullCompany,
          markets_operating_in: fullCompany.markets_operating_in || [],
          main_products: fullCompany.main_products || [],
          created_at: fullCompany.created_at || new Date().toISOString()
        });
        setInputMode('select');
      }
    } else {
      setSelectedCompany(null);
    }
  };

  // Fetch companies and prompts on mount
  useEffect(() => {
    async function fetchInitialData() {
      try {
        // Fetch companies
        const { data: companiesData, error: companiesError } = await supabase
          .from('companies')
          .select('*')
          .order('name');

        if (companiesError) throw companiesError;
        // Ensure required arrays are never null
        const processedCompanies = (companiesData || []).map(company => ({
          ...company,
          markets_operating_in: company.markets_operating_in || [],
          main_products: company.main_products || [],
          created_at: company.created_at || new Date().toISOString()
        }));
        setCompanies(processedCompanies);

        // Fetch prompts
        const { data: promptsData, error: promptsError } = await supabase
          .from('prompts')
          .select('*')
          .eq('is_active', true);

        if (promptsError) throw promptsError;
        
        if (promptsData) {
          setPrompts(promptsData);
          
          // Find and set default ICP prompts
          const icpSystemPrompt = promptsData.find(p => 
            p.name === 'ICPs v1.03 - system (NA only)'
          );
          const icpUserPrompt = promptsData.find(p => 
            p.name === 'ICPs v1.03 - user (NA only)'
          );
          
          // Find and set default Question prompts
          const questionSystemPrompt = promptsData.find(p => 
            p.name === 'Questions v1.12- system'
          );
          const questionUserPrompt = promptsData.find(p => 
            p.name === 'Questions v1.12- user'
          );
          
          // Set ICP prompts
          if (icpSystemPrompt) {
            console.log('Setting default ICP system prompt:', icpSystemPrompt.name);
            setSelectedICPSystemPrompt(icpSystemPrompt.name);
          }
          if (icpUserPrompt) {
            console.log('Setting default ICP user prompt:', icpUserPrompt.name);
            setSelectedICPUserPrompt(icpUserPrompt.name);
          }

          // Set Question prompts
          if (questionSystemPrompt) {
            console.log('Setting default Question system prompt:', questionSystemPrompt.name);
            setSelectedQuestionSystemPrompt(questionSystemPrompt.name);
          }
          if (questionUserPrompt) {
            console.log('Setting default Question user prompt:', questionUserPrompt.name);
            setSelectedQuestionUserPrompt(questionUserPrompt.name);
          }
        }

      } catch (error) {
        console.error('Error fetching initial data:', error);
        toast({
          title: "Error loading data",
          description: "Please refresh the page to try again",
          variant: "destructive"
        });
      } finally {
        setIsLoadingCompanies(false);
      }
    }

    fetchInitialData();
  }, []);

  // Fetch company details when selected
  useEffect(() => {
    if (selectedCompany) {
      fetchCompanyData(selectedCompany.id);
    } else {
      setCompetitors([]);
      setIcps([]);
    }
  }, [selectedCompany]);

  async function handleGenerate() {
    const companyName = inputMode === 'select' ? selectedCompany?.name : newCompanyName;
    
    // Validate company name
    if (!companyName) {
      toast({
        title: "Company name required",
        description: "Please select a company or enter a new company name",
        variant: "destructive"
      });
      return;
    }

    // Validate prompts
    if (!selectedICPSystemPrompt || !selectedICPUserPrompt || !selectedQuestionSystemPrompt || !selectedQuestionUserPrompt) {
      toast({
        title: "Prompts required",
        description: "Please select all prompts for both ICP and Question generation",
        variant: "destructive"
      });
      return;
    }

    // Validate at least one engine selected
    if (!Object.values(engines).some(Boolean)) {
      toast({
        title: "Engine required",
        description: "Please select at least one engine for question generation",
        variant: "destructive"
      });
      return;
    }

    console.log('Starting generation with prompts:', {
      system: selectedICPSystemPrompt,
      user: selectedICPUserPrompt
    });

    setIsGenerating(true);
    setProgress(0);

    try {
      const icps = await generateICPsAction(
        companyName,
        selectedICPSystemPrompt,
        selectedICPUserPrompt,
        selectedQuestionSystemPrompt,
        selectedQuestionUserPrompt,
        engines,
        modelSelection
      );
      
      setProgress(30);
      toast({
        title: "ICPs Generated",
        description: `Generated ${icps.ideal_customer_profiles.length} ICPs with personas`
      });

      setProgress(50);
      toast({
        title: "Generating Questions",
        description: "Starting question generation for all personas..."
      });

      await pollGenerationProgress(companyName);

      // Refresh company data if in select mode
      if (inputMode === 'select' && selectedCompany) {
        await fetchCompanyData(selectedCompany.id);
      }

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

  async function pollGenerationProgress(companyName: string) {
    console.log('Starting progress polling for:', companyName);
    const maxAttempts = 60;
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        const response = await fetch(`/api/generation-progress?company=${encodeURIComponent(companyName)}`);
        const progress = await response.json();
        console.log('Progress update:', progress);

        if (progress.status === 'complete') {
          setProgress(100);
          toast({
            title: "Generation Complete",
            description: "All ICPs and questions have been generated"
          });
          return;
        }

        if (progress.status === 'failed') {
          throw new Error(progress.error_message || 'Generation failed');
        }

        if (progress.status === 'generating_questions') {
          setProgress(50 + (progress.progress / 2));
        }

        await new Promise(resolve => setTimeout(resolve, 5000));
        attempts++;
      } catch (error) {
        console.error('Error during progress polling:', error);
        throw error;
      }
    }

    throw new Error('Generation timed out');
  }

  function allPromptsSelected(): boolean {
    return !!(
      selectedICPSystemPrompt && 
      selectedICPUserPrompt && 
      selectedQuestionSystemPrompt && 
      selectedQuestionUserPrompt && 
      (inputMode === 'select' ? selectedCompany : newCompanyName)
    );
  }

  return (
    <div className="space-y-8">
      <Card className="p-6">
        <div className="space-y-6">
          <h3 className="text-lg font-medium">Generate ICPs and Questions</h3>
          
          <div className="space-y-4">
            {/* Company Selection/Input */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <SimpleCompanySelector
                  selectedCompany={selectedCompany}
                  companies={companies}
                  onCompanySelect={handleCompanySelect}
                  disabled={isLoadingCompanies || isGenerating}
                />
                <span className="text-sm text-muted-foreground">OR</span>
                <Input
                  placeholder="Enter new company name"
                  value={newCompanyName}
                  onChange={(e) => {
                    setNewCompanyName(e.target.value);
                    setInputMode('new');
                    setSelectedCompany(null);
                  }}
                  disabled={isGenerating}
                  className="w-[280px]"
                />
              </div>
            </div>

            {/* ICP Generation Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">ICP Generation</h4>
              <QuestionPromptSelector
                selectedSystemPrompt={selectedICPSystemPrompt}
                selectedUserPrompt={selectedICPUserPrompt}
                onSystemPromptSelect={setSelectedICPSystemPrompt}
                onUserPromptSelect={setSelectedICPUserPrompt}
                prompts={prompts}
                disabled={isGenerating}
              />
              <ModelSelector
                label="ICP Generation Model"
                value={modelSelection.icpModel}
                onChange={updateICPModel}
                disabled={isGenerating}
              />
            </div>

            {/* Question Generation Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Question Generation</h4>
              <QuestionPromptSelector
                selectedSystemPrompt={selectedQuestionSystemPrompt}
                selectedUserPrompt={selectedQuestionUserPrompt}
                onSystemPromptSelect={setSelectedQuestionSystemPrompt}
                onUserPromptSelect={setSelectedQuestionUserPrompt}
                prompts={prompts}
                disabled={isGenerating}
              />
              <ModelSelector
                label="Question Generation Model"
                value={modelSelection.questionModel}
                onChange={updateQuestionModel}
                disabled={isGenerating}
              />
            </div>

            {/* Engine Selection */}
            <EngineSelector
              engines={engines}
              onChange={setEngines}
              disabled={isGenerating}
            />

            {/* Generate Button */}
            <div className="flex justify-end">
              <Button 
                onClick={handleGenerate}
                disabled={isGenerating || !allPromptsSelected()}
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
                {progress < 30 && "Generating ICPs..."}
                {progress >= 30 && progress < 50 && "ICPs Generated, preparing question prompts..."}
                {progress >= 50 && progress < 100 && `Generating questions using ${getActiveEngines(engines).join(', ')}...`}
                {progress === 100 && "Complete!"}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Company Details and ICPs */}
      {selectedCompany && !isLoadingDetails && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditMode(!isEditMode)}
            >
              {isEditMode ? (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  View Mode
                </>
              ) : (
                <>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit Mode
                </>
              )}
            </Button>
          </div>

          {isEditMode ? (
            <>
              <CompetitorDetailsEditor 
                companyId={selectedCompany.id}
                onUpdate={() => fetchCompanyData(selectedCompany.id)}
              />
              <ICPDetailsEditor 
                companyId={selectedCompany.id}
                onUpdate={() => fetchCompanyData(selectedCompany.id)}
              />
            </>
          ) : (
            <>
              <CompanyDetails
                company={selectedCompany}
                competitors={competitors}
              />
              <CompanyICPsTable 
                icps={icps} 
                companyId={selectedCompany.id}
                companyName={selectedCompany.name}
                companyIndustry={selectedCompany.industry}
                companyProductCategory={selectedCompany.product_category}
                competitors={competitors}
                selectedEngines={engines}
                selectedModel={modelSelection.questionModel}
                selectedPrompts={{
                  systemPromptName: selectedQuestionSystemPrompt || '',
                  userPromptName: selectedQuestionUserPrompt || ''
                }}
              />
            </>
          )}
        </div>
      )}

      {isLoadingDetails && (
        <div className="text-sm text-muted-foreground">Loading company details...</div>
      )}
    </div>
  );
} 