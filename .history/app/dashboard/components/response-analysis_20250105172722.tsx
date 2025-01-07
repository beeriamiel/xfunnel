'use client'

import { useState, useRef, useEffect, Fragment } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useDashboardStore } from "@/app/dashboard/store"
import { cn } from "@/lib/utils"
import {
  Building2,
  Package,
  Users,
  Globe2,
  ChevronRight,
  Plus,
  Loader2,
  Check,
  AlertCircle,
  Search,
  MessageSquare,
  Mail,
  CircleDot,
  Pencil,
  X
} from "lucide-react"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { motion, AnimatePresence } from "framer-motion"
import { StepLoadingSpinner } from "@/components/ui/loading"
import type { LucideIcon } from 'lucide-react'
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { createClient } from "@/app/supabase/client"
import type { Database } from "@/types/supabase"

interface Props {
  companyId?: number;
}

interface CompanyProfile {
  name: string;
  industry: string | null;
  products: string[];
  markets: string[];
  competitors: Competitor[];
}

interface Competitor {
  id: string;
  name: string;
}

interface ICP {
  id: number;
  vertical: string;
  companySize: string;
  region: string;
  personas: Persona[];
}

interface Persona {
  id: number;
  title: string;
  seniority: string;
  department: string;
}

interface Query {
  id: number;
  text: string;
  icp: ICP;
  persona: Persona;
  status: 'pending' | 'analyzing' | 'complete';
}

type StepId = 'company' | 'product' | 'competitors' | 'icps' | 'personas' | 'analysis';

interface StepIndicatorProps {
  currentStep: StepId;
  isComplete: boolean;
}

// Mock data generation functions
function generateCompanyData(companyName: string) {
  return {
    name: companyName,
    industry: "Software & Technology",
    mainProducts: ["Product Analytics", "Customer Data Platform", "AI Engine"],
    category: "B2B",
    employees: "100-500",
    revenue: "$10M-50M",
    markets: ["North America", "Europe", "Asia Pacific"]
  }
}

function generateICPs(): ICP[] {
  return [
    {
      id: 1,
      vertical: "Enterprise Software",
      companySize: "enterprise_1000_5000",
      region: "north_america",
      personas: [
        {
          id: 1,
          title: "Product Manager",
          seniority: "director_level",
          department: "Product"
        },
        {
          id: 2,
          title: "Engineering Lead",
          seniority: "manager_level",
          department: "Engineering"
        }
      ]
    },
    {
      id: 2,
      vertical: "Financial Services",
      companySize: "large_enterprise_5000_plus",
      region: "europe",
      personas: [
        {
          id: 3,
          title: "CTO",
          seniority: "c_level",
          department: "Technology"
        },
        {
          id: 4,
          title: "VP of Engineering",
          seniority: "vp_level",
          department: "Engineering"
        }
      ]
    }
  ];
}

function generatePersonas() {
  return [
    {
      id: 1,
      title: "Product Manager",
      seniority: "Senior",
      department: "Product"
    },
    {
      id: 2,
      title: "Data Scientist",
      seniority: "Mid-Level",
      department: "Analytics"
    },
    {
      id: 3,
      title: "Marketing Director",
      seniority: "Director",
      department: "Marketing"
    }
  ]
}

interface CompanyData {
  name: string;
  industry: string;
  mainProducts: string[];
  category: string;
  employees: string;
  revenue: string;
  markets: string[];
}

function generateQueries(icp: ICP, persona: Persona): Query[] {
  return [
    {
      id: 1,
      text: `What are the key challenges in ${icp.vertical} for ${persona.title}s?`,
      icp,
      persona,
      status: 'complete'
    },
    {
      id: 2,
      text: `How does ${persona.title} evaluate new solutions in ${icp.vertical}?`,
      icp,
      persona,
      status: 'complete'
    },
    {
      id: 3,
      text: `What are the main pain points for ${persona.title}s in ${icp.companySize} companies?`,
      icp,
      persona,
      status: 'complete'
    }
  ]
}

function SelectableCard({ 
  isSelected, 
  onClick, 
  icon: Icon, 
  title, 
  subtitle,
  className
}: { 
  isSelected: boolean; 
  onClick: () => void; 
  icon: LucideIcon; 
  title: string; 
  subtitle: string;
  className?: string;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={className}
    >
      <Card 
        className={cn(
          "cursor-pointer transition-all duration-200 py-2.5 px-3 relative h-[68px]",
          isSelected 
            ? "bg-[#f6efff] border-[#f9a8c9]" 
            : "hover:bg-[#f6efff]/50 border-transparent"
        )}
        onClick={onClick}
      >
        <div className="flex flex-col justify-center h-full gap-0.5">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 shrink-0 text-[#f9a8c9]" />
            <p className="font-medium text-[#30035e] text-sm truncate pr-6">{title}</p>
            {isSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute right-2 top-1/2 -translate-y-1/2"
              >
                <Check className="h-3.5 w-3.5 text-[#f9a8c9]" />
              </motion.div>
            )}
          </div>
          <p className="text-xs text-muted-foreground pl-6">{subtitle}</p>
        </div>
      </Card>
    </motion.div>
  )
}

function QueryGeneration({ icps, personas }: { icps: ICP[], personas: Persona[] }) {
  const [selectedICP, setSelectedICP] = useState<ICP | null>(null)
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null)
  const [queries, setQueries] = useState<Query[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleGenerateQueries = () => {
    if (!selectedICP || !selectedPersona) return
    setIsGenerating(true)
    setTimeout(() => {
      setQueries(generateQueries(selectedICP, selectedPersona))
      setIsGenerating(false)
    }, 1500)
  }

  const handleGenerateAnalysis = () => {
    setIsAnalyzing(true)
    setTimeout(() => {
      setIsAnalyzing(false)
    }, 2000)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-8">
        {/* Left Column: Selection */}
        <div className="space-y-6">
          {/* ICP Selection */}
          <div className="space-y-2">
            <Label className="text-[#30035e]">Target ICP</Label>
            <div className="grid grid-cols-2 gap-2">
              {icps.map((icp) => (
                <SelectableCard
                  key={icp.id}
                  isSelected={selectedICP?.id === icp.id}
                  onClick={() => setSelectedICP(icp)}
                  icon={Globe2}
                  title={`${icp.region} - ${icp.vertical}`}
                  subtitle={icp.companySize}
                />
              ))}
            </div>
          </div>

          {/* Persona Selection */}
          <div className="space-y-2">
            <Label className="text-[#30035e]">Target Persona</Label>
            <div className="grid grid-cols-2 gap-2">
              {personas.map((persona) => (
                <SelectableCard
                  key={persona.id}
                  isSelected={selectedPersona?.id === persona.id}
                  onClick={() => setSelectedPersona(persona)}
                  icon={Users}
                  title={`${persona.title} - ${persona.department}`}
                  subtitle={persona.seniority}
                />
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <Button
            className="w-full bg-[#30035e] hover:bg-[#30035e]/90"
            size="lg"
            onClick={handleGenerateQueries}
            disabled={!selectedICP || !selectedPersona || isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating Queries...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Generate Queries
              </>
            )}
          </Button>
        </div>

        {/* Right Column: Generated Queries */}
        <div className="space-y-4">
          {queries.length > 0 ? (
            <>
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-[#30035e]">Generated Queries</h3>
                <Button
                  onClick={handleGenerateAnalysis}
                  disabled={isAnalyzing}
                  className="min-w-[200px] bg-[#30035e] hover:bg-[#30035e]/90"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Generate Analysis
                    </>
                  )}
                </Button>
              </div>
              <ScrollArea className="h-[300px] rounded-md border border-[#f9a8c9]/20">
                <div className="p-4 space-y-3">
                  {queries.map((query) => (
                    <Card key={query.id} className="p-3 bg-[#f6efff]/50 hover:bg-[#f6efff] transition-colors">
                      <div className="space-y-2">
                        <p className="text-sm text-[#30035e]">{query.text}</p>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="text-xs border-[#f9a8c9]">
                            {query.icp.region} · {query.icp.vertical}
                          </Badge>
                          <Badge variant="outline" className="text-xs border-[#f9a8c9]">
                            {query.persona.title} · {query.persona.department}
                          </Badge>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </>
          ) : (
            <div className="h-[300px] flex items-center justify-center border rounded-md bg-[#f6efff]/50 relative">
              {isGenerating ? (
                <div className="flex flex-col items-center gap-3 px-6 py-3 rounded-full bg-[#f6efff] border border-[#f9a8c9]">
                  <Loader2 className="h-5 w-5 animate-spin text-[#30035e]" />
                  <p className="text-sm text-[#30035e]">Generating queries...</p>
                </div>
              ) : (
                <div className="text-center text-muted-foreground">
                  <Search className="h-8 w-8 mb-3 mx-auto text-[#f9a8c9]" />
                  <p>Select an ICP and Persona to generate queries</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Analysis Started Alert */}
      <AnimatePresence>
        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <Alert className="bg-[#f6efff] border-[#f9a8c9]">
              <Mail className="h-4 w-4 text-[#30035e]" />
              <AlertTitle className="text-[#30035e]">Analysis Started</AlertTitle>
              <AlertDescription className="text-[#30035e]/80">
                System is analyzing responses. We will send you an email when the analysis is ready.
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const STAGE_EXPLANATIONS = {
  company: "Enter your company details to begin the analysis setup",
  product: "Add your main products or services - you can add multiple products",
  competitors: "Review and modify auto-generated list of your main competitors",
  icps: "Review and customize auto-generated Ideal Customer Profiles - you can add, edit or remove them",
  personas: "Review and customize auto-generated buyer personas - you can add, edit or remove them",
  analysis: "Generate AI responses based on your company profile"
} as const

function StepIndicator({ currentStep, isComplete }: StepIndicatorProps) {
  const steps = [
    { id: 'company', label: 'Company' },
    { id: 'product', label: 'Product' },
    { id: 'competitors', label: 'Competitors' },
    { id: 'icps', label: 'ICPs' },
    { id: 'personas', label: 'Personas' },
    { id: 'analysis', label: 'Analysis' }
  ]

  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <HoverCard>
            <HoverCardTrigger asChild>
              <div className="flex items-center">
                <div
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-200",
                    currentStep === step.id
                      ? "border-[#30035e] bg-[#30035e] text-white hover:bg-[#30035e]/90"
                      : steps.indexOf(step) < steps.findIndex(s => s.id === currentStep)
                      ? "border-[#f9a8c9] bg-[#f9a8c9] text-white hover:bg-[#f9a8c9]/90"
                      : "border-muted-foreground/30 text-muted-foreground hover:bg-[#f6efff]/50"
                  )}
                >
                  {steps.indexOf(step) < steps.findIndex(s => s.id === currentStep) ? (
                    <Check className="h-4 w-4" />
                  ) : currentStep === step.id && isComplete ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CircleDot className="h-4 w-4" />
                  )}
                </div>
                <span
                  className={cn(
                    "mx-2 text-sm transition-colors duration-200",
                    currentStep === step.id
                      ? "text-[#30035e] font-medium"
                      : steps.indexOf(step) < steps.findIndex(s => s.id === currentStep)
                      ? "text-[#f9a8c9]"
                      : "text-muted-foreground"
                  )}
                >
                  {step.label}
                  {currentStep === step.id && isComplete && (
                    <span className="ml-2 text-xs text-[#f9a8c9] animate-pulse">
                      {currentStep === 'competitors' ? "Analyzing..." :
                       currentStep === 'icps' ? "Generating..." :
                       currentStep === 'personas' ? "Generating..." :
                       "Processing..."}
                    </span>
                  )}
                </span>
              </div>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="flex justify-between space-x-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold">{step.label}</h4>
                  <p className="text-sm text-muted-foreground">
                    {STAGE_EXPLANATIONS[step.id as keyof typeof STAGE_EXPLANATIONS]}
                  </p>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
          {index < steps.length - 1 && (
            <Separator
              className={cn(
                "w-8 mx-2 transition-colors duration-200",
                steps.indexOf(step) < steps.findIndex(s => s.id === currentStep)
                  ? "bg-[#f9a8c9]"
                  : "bg-muted-foreground/30"
              )}
            />
          )}
        </div>
      ))}
    </div>
  )
}

interface CompletedStep {
  type: 'company' | 'product' | 'data' | 'icps' | 'personas';
  title: string;
  summary: string;
}

function CompletedStepChip({ step, onEdit }: { step: CompletedStep; onEdit: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="group relative"
    >
      <Card 
        className="px-4 py-2 flex items-center gap-2 bg-accent/5 hover:bg-[#f6efff] cursor-pointer transition-colors"
        onClick={onEdit}
      >
        {step.type === 'company' && <Building2 className="h-4 w-4 text-[#f9a8c9]" />}
        {step.type === 'product' && <Package className="h-4 w-4 text-[#f9a8c9]" />}
        {step.type === 'data' && <CircleDot className="h-4 w-4 text-[#f9a8c9]" />}
        {step.type === 'icps' && <Globe2 className="h-4 w-4 text-[#f9a8c9]" />}
        {step.type === 'personas' && <Users className="h-4 w-4 text-[#f9a8c9]" />}
        <div className="flex flex-col">
          <span className="text-sm font-medium text-[#30035e]">{step.title}</span>
          <span className="text-xs text-muted-foreground">{step.summary}</span>
        </div>
        <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 text-[#30035e]" />
      </Card>
    </motion.div>
  )
}

interface Product {
  id: string;
  name: string;
  description?: string;
}

function ProductCard({ 
  product, 
  onEdit, 
  onDelete 
}: { 
  product: Product; 
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="group flex items-center justify-between p-2 rounded-md hover:bg-[#f6efff]/50 transition-colors">
      <div className="flex items-center gap-2">
        <Package className="h-4 w-4 text-[#f9a8c9]" />
        <span className="font-medium text-[#30035e]">{product.name}</span>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          size="icon"
          variant="ghost"
          onClick={() => onEdit(product)}
          className="h-7 w-7"
        >
          <Pencil className="h-3 w-3" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => onDelete(product.id)}
          className="h-7 w-7 text-red-500 hover:text-red-600"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}

interface Competitor {
  id: string;
  name: string;
}

function CompetitorCard({ 
  competitor, 
  onEdit, 
  onDelete 
}: { 
  competitor: Competitor; 
  onEdit: (competitor: Competitor) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-[#f6efff]/50 transition-colors group">
      <div className="flex items-center gap-2">
        <Building2 className="h-3.5 w-3.5 text-[#f9a8c9]" />
        <span className="text-sm text-[#30035e]">{competitor.name}</span>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => onEdit(competitor)}
        >
          <Pencil className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-destructive"
          onClick={() => onDelete(competitor.id)}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}

function ICPCard({ 
  icp, 
  onEdit, 
  onDelete 
}: { 
  icp: ICP; 
  onEdit: (icp: ICP) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <Card className="p-4 min-w-[250px] space-y-3 bg-[#f6efff]/50 hover:bg-[#f6efff] transition-colors group relative">
      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
        <Button
          size="icon"
          variant="ghost"
          onClick={() => onEdit(icp)}
          className="h-8 w-8"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => onDelete(icp.id)}
          className="h-8 w-8 text-red-500 hover:text-red-600"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <Globe2 className="h-4 w-4 text-[#f9a8c9]" />
        <span className="font-medium text-[#30035e]">{icp.region}</span>
      </div>
      <div className="space-y-2 text-sm text-muted-foreground">
        <div>Vertical: {icp.vertical}</div>
        <div>Company Size: {icp.companySize}</div>
      </div>
    </Card>
  )
}

function PersonaCard({ 
  persona, 
  onEdit, 
  onDelete 
}: { 
  persona: Persona; 
  onEdit: (persona: Persona) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <Card className="p-4 min-w-[250px] space-y-3 bg-[#f6efff]/50 hover:bg-[#f6efff] transition-colors group relative">
      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
        <Button
          size="icon"
          variant="ghost"
          onClick={() => onEdit(persona)}
          className="h-8 w-8"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => onDelete(persona.id)}
          className="h-8 w-8 text-red-500 hover:text-red-600"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-[#f9a8c9]" />
        <span className="font-medium text-[#30035e]">{persona.title}</span>
      </div>
      <div className="space-y-2 text-sm text-muted-foreground">
        <div>Seniority: {persona.seniority}</div>
        <div>Department: {persona.department}</div>
      </div>
    </Card>
  )
}

interface CompanySetupProps {
  onComplete: (completedICPs: ICP[]) => void;
}

function CompanySetup({ onComplete }: CompanySetupProps) {
  const [step, setStep] = useState<StepId>('company');
  const [isLoading, setIsLoading] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [icps, setICPs] = useState<ICP[]>([]);

  const handlePersonasComplete = () => {
    setStep('analysis');
    onComplete(icps);
  };

  // ... rest of the component ...

  return (
      <div className="flex flex-col items-center gap-4">
        <StepIndicator currentStep={step} isComplete={isLoading} />
        
      {/* Company Step */}
            {step === 'company' && (
              <div className="w-full max-w-xl space-y-3">
                <Label className="text-center block">Company Name</Label>
                    <Input
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Enter your company name"
                    />
                    <Button
            onClick={() => setStep('product')}
                      disabled={!companyName}
            className="w-full"
                    >
            Continue
                    </Button>
              </div>
            )}

      {/* ... other steps ... */}

      {/* Analysis Step */}
      {step === 'analysis' && (
        <Alert className="bg-[#f6efff] border-[#f9a8c9] max-w-2xl mx-auto">
          <Check className="h-4 w-4 text-[#30035e]" />
          <AlertTitle>Setup Complete!</AlertTitle>
          <AlertDescription>
            Your company profile has been set up. You can now generate AI responses based on your ICPs and personas.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

interface ICPPersonaCombination {
  id: string;
  region: string;
  vertical: string;
  companySize: string;
  title: string;
  seniority: string;
  department: string;
  lastUpdated: string | null;
  queries: {
    id: string;
    text: string;
  }[];
  isGeneratingQueries: boolean;
  isExpanded: boolean;
  hasAnalysis: boolean;
  lastAnalysisRun: string | null;
  isAnalyzing: boolean;
}

// Helper function to format dates
function formatLastRun(date: string | undefined | null): string {
  if (!date) return 'Never';
  
  const lastRun = new Date(date);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - lastRun.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  return lastRun.toLocaleDateString();
}

function generateMockQueries(icp: string, persona: string) {
  return [
    {
      id: crypto.randomUUID(),
      text: `What are the main challenges that ${persona} faces in ${icp}?`
    },
    {
      id: crypto.randomUUID(),
      text: `How does ${persona} evaluate new solutions in ${icp}?`
    },
    {
      id: crypto.randomUUID(),
      text: `What are the key priorities for ${persona} in ${icp}?`
    },
    {
      id: crypto.randomUUID(),
      text: `What metrics does ${persona} track in ${icp}?`
    }
  ]
}

function ResponseTable({ 
  icps, 
  personas,
  onGenerateQuestions,
  onGenerateResponses 
}: { 
  icps: ICP[];
  personas: Persona[];
  onGenerateQuestions: (selectedIds: string[]) => void;
  onGenerateResponses: (selectedIds: string[]) => void;
}) {
  const [combinations, setCombinations] = useState<ICPPersonaCombination[]>([])
  const [newQuery, setNewQuery] = useState("")

  // Generate combinations of ICPs and Personas
  useEffect(() => {
    const newCombinations: ICPPersonaCombination[] = []
    icps.forEach(icp => {
      personas.forEach(persona => {
        newCombinations.push({
          id: `${icp.id}-${persona.id}`,
          region: icp.region,
          vertical: icp.vertical,
          companySize: icp.companySize,
          title: persona.title,
          seniority: persona.seniority,
          department: persona.department,
          lastUpdated: null,
          queries: [],
          isGeneratingQueries: false,
          isExpanded: false,
          lastAnalysisRun: null,
          isAnalyzing: false,
          hasAnalysis: false
        })
      })
    })
    setCombinations(newCombinations)
  }, [icps, personas])

  const handleGenerateQueries = async (combination: ICPPersonaCombination) => {
    setCombinations(prev => prev.map(c => 
      c.id === combination.id 
        ? { 
            ...c, 
            isGeneratingQueries: true,
            queries: c.queries,  // Preserve existing queries during loading
            isExpanded: c.isExpanded,
            hasAnalysis: c.hasAnalysis,
            lastAnalysisRun: c.lastAnalysisRun,
            isAnalyzing: c.isAnalyzing
          }
        : c
    ))

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))

    const mockQueries = generateMockQueries(combination.vertical, combination.title)

    setCombinations(prev => prev.map(c => 
      c.id === combination.id 
        ? { 
            ...c, 
            queries: mockQueries,
            isGeneratingQueries: false,
            isExpanded: true,
            hasAnalysis: false,
            lastAnalysisRun: null,
            isAnalyzing: false
          }
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

    setCombinations(prev => prev.map(c => 
      c.id === combinationId 
        ? { 
            ...c, 
            queries: [...c.queries, { 
              id: crypto.randomUUID(), 
              text: newQuery.trim() 
            }]
          }
        : c
    ))
    setNewQuery("")
  }

  const handleRunAnalysis = async (combination: ICPPersonaCombination) => {
    setCombinations(prev => prev.map(c => 
      c.id === combination.id 
        ? { 
            ...c, 
            isAnalyzing: true,
            queries: c.queries,  // Preserve existing queries during analysis
            isExpanded: c.isExpanded
          }
        : c
    ))

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))

    setCombinations(prev => prev.map(c => 
      c.id === combination.id 
        ? { 
            ...c, 
            isAnalyzing: false, 
            hasAnalysis: true,
            lastAnalysisRun: new Date().toISOString(),
            queries: c.queries,  // Preserve existing queries after analysis
            isExpanded: c.isExpanded
          }
        : c
    ))
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
              <Fragment key={combination.id}>
                <TableRow className="group">
                  <TableCell>{combination.region}</TableCell>
                  <TableCell>{combination.vertical}</TableCell>
                  <TableCell>{combination.companySize}</TableCell>
                  <TableCell>{combination.title}</TableCell>
                  <TableCell>{combination.seniority}</TableCell>
                  <TableCell>{combination.department}</TableCell>
                  <TableCell className="text-right">
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <span className={cn(
                          "text-sm cursor-help",
                          !combination.lastAnalysisRun && "text-muted-foreground",
                          combination.lastAnalysisRun && "text-[#30035e]"
                        )}>
                          {formatLastRun(combination.lastAnalysisRun)}
                        </span>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-auto">
                        <p className="text-sm">
                          {combination.lastAnalysisRun 
                            ? `Last analysis run on ${new Date(combination.lastAnalysisRun).toLocaleString()}`
                            : 'No analysis has been run yet'}
                        </p>
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
                          className={cn(
                            "text-[#30035e] hover:text-[#30035e]/90 transition-colors",
                            combination.isExpanded && "bg-[#f6efff]"
                          )}
                        >
                          {combination.isExpanded ? 'Hide' : 'View'} {combination.queries.length} Queries
                        </Button>
                        {!combination.hasAnalysis && (
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
                                Run Full Analysis (500 points)
                              </>
                            )}
                          </Button>
                        )}
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
                            Generate Queries
                          </>
                        )}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
                {combination.isExpanded && combination.queries && (
                  <TableRow>
                    <TableCell colSpan={8}>
                      <div className="py-4 px-6 bg-[#f6efff]/50 space-y-4">
                        <ScrollArea className="h-[200px] rounded-md border border-[#f9a8c9]/20 bg-white">
                          <div className="p-4 space-y-3">
                            {combination.queries.map((query) => (
                              <div 
                                key={query.id}
                                className="p-3 rounded-lg bg-white border border-[#f9a8c9]/20 hover:border-[#f9a8c9]/40 hover:bg-[#f6efff]/30 transition-all duration-200"
                              >
                                <p className="text-sm text-[#30035e]">{query.text}</p>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Add a new query..."
                            value={newQuery}
                            onChange={(e) => setNewQuery(e.target.value)}
                            className="flex-1 focus-visible:ring-[#30035e]"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && newQuery.trim()) {
                                handleAddQuery(combination.id)
                              }
                            }}
                          />
                          <Button
                            onClick={() => handleAddQuery(combination.id)}
                            disabled={!newQuery.trim()}
                            className="bg-[#30035e] hover:bg-[#30035e]/90"
                          >
                            Add Query
                          </Button>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
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

interface CompanyProfileCardProps {
  company: {
    name: string;
    industry: string | null;
    products: string[];
    markets: string[];
  };
  stats: {
    icpsCount: number;
    personasCount: number;
    competitorsCount: number;
  };
  onEdit: () => void;
}

function CompanyProfileCard({ company, stats, onEdit }: CompanyProfileCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="bg-[#f6efff]/50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-[#30035e]">{company.name}</CardTitle>
            <CardDescription>{company.industry || 'Industry not specified'}</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="border-[#30035e] text-[#30035e] hover:bg-[#30035e]/10"
          >
            <Pencil className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4 bg-white">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">ICPs</p>
              <p className="text-2xl font-bold text-[#30035e]">{stats.icpsCount}</p>
            </div>
          </Card>
          <Card className="p-4 bg-white">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Personas</p>
              <p className="text-2xl font-bold text-[#30035e]">{stats.personasCount}</p>
            </div>
          </Card>
          <Card className="p-4 bg-white">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Competitors</p>
              <p className="text-2xl font-bold text-[#30035e]">{stats.competitorsCount}</p>
            </div>
          </Card>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full mt-4 text-[#30035e]"
        >
          {isExpanded ? 'Show Less' : 'Show More'}
          <ChevronRight className={cn(
            "h-4 w-4 ml-2 transition-transform",
            isExpanded && "rotate-90"
          )} />
        </Button>
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-4 space-y-4">
                {company.products.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-[#30035e]">Products</Label>
                    <div className="flex flex-wrap gap-2">
                      {company.products.map((product, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="bg-white border-[#f9a8c9] text-[#30035e]"
                        >
                          {product}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {company.markets.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-[#30035e]">Markets</Label>
                    <div className="flex flex-wrap gap-2">
                      {company.markets.map((market, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="bg-white border-[#f9a8c9] text-[#30035e]"
                        >
                          {market}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

export function ResponseAnalysis({ companyId }: Props) {
  const { effectiveCompanyId } = useDashboardStore();
  const finalCompanyId = companyId ?? effectiveCompanyId;

  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>({
    name: '',
    industry: null,
    products: [],
    markets: [],
    competitors: []
  });

  const [icps, setICPs] = useState<ICP[]>([]);
  const [showSetupWizard, setShowSetupWizard] = useState(false);
  const [setupComplete, setSetupComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState<StepId>('company');

  const handleSetupComplete = (completedICPs: ICP[]) => {
    setICPs(completedICPs);
    setSetupComplete(true);
    setShowSetupWizard(false);
  };

  const handleGenerateQuestions = (selectedIds: string[]) => {
    // TODO: Implement question generation
    console.log('Generating questions for:', selectedIds)
  }

  const handleGenerateResponses = (selectedIds: string[]) => {
    // TODO: Implement response generation
    console.log('Generating responses for:', selectedIds)
  }

  if (!effectiveCompanyId) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-semibold tracking-tight">Generate Analysis</h2>
          <p className="text-muted-foreground mt-2">Please select a company to view response analysis</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="space-y-8">
        {showSetupWizard ? (
          <CompanySetup onComplete={handleSetupComplete} />
        ) : (
          <>
            {/* Compact Company Profile */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h2 className="text-lg font-semibold mb-2">{companyProfile.name}</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Industry</p>
                  <p>{companyProfile.industry || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Products</p>
                  <p>{companyProfile.products.length} products</p>
                </div>
              </div>
            </div>

            {/* Query Generation Section */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Generate Analysis</h3>
              <p className="text-gray-600">
                Select ICPs and personas to generate AI responses based on your company profile.
              </p>
              {/* Add your query generation table/UI here */}
            </div>
          </>
        )}
      </div>
    </Card>
  )
} 