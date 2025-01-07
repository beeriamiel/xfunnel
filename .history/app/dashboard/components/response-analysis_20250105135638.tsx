'use client'

// Type definitions
type StepId = 'initial' | 'product' | 'competitors' | 'icps' | 'personas';

interface Step {
  id: StepId;
  label: string;
}

interface Props {
  companyId: number;
}

import { useState, useRef } from "react"
import { Card } from "@/components/ui/card"
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

// Mock data generation functions
function generateICPs() {
  return [
    {
      id: 1,
      region: "North America",
      vertical: "Enterprise Software",
      companySize: "1000+ employees"
    },
    {
      id: 2,
      region: "Europe",
      vertical: "Financial Services",
      companySize: "500-1000 employees"
    },
    {
      id: 3,
      region: "Asia Pacific",
      vertical: "E-commerce",
      companySize: "100-500 employees"
    }
  ]
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

interface ICP {
  id: number;
  region: string;
  vertical: string;
  companySize: string;
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

function StepIndicator({ currentStep, isLoading }: { currentStep: string, isLoading: boolean }) {
  const steps: Step[] = [
    { id: 'initial', label: 'Company' },
    { id: 'product', label: 'Product' },
    { id: 'competitors', label: 'Competitors' },
    { id: 'icps', label: 'ICPs' },
    { id: 'personas', label: 'Personas' }
  ]

  // Add type for step IDs
  type StepId = 'initial' | 'product' | 'competitors' | 'icps' | 'personas';

  // Update STAGE_INFO type
  const STAGE_INFO: Record<StepId, { title: string; description: string }> = {
    initial: {
      title: "Company Information",
      description: "Basic details about your organization to help identify and analyze your market position"
    },
    product: {
      title: "Product Portfolio",
      description: "Your company's products or services that will be analyzed against competitors"
    },
    competitors: {
      title: "Main Competitors",
      description: "Auto-populated list of your key market competitors - you can add, edit or remove competitors"
    },
    icps: {
      title: "Ideal Customer Profiles",
      description: "Auto-generated ICPs based on your market data - fully customizable to match your target segments"
    },
    personas: {
      title: "Target Personas",
      description: "Auto-generated buyer personas - customize to match your ideal decision makers"
    }
  }

  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
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
            <HoverCard>
              <HoverCardTrigger asChild>
                <div className="w-full h-full flex items-center justify-center cursor-help">
                  {steps.indexOf(step) < steps.findIndex(s => s.id === currentStep) ? (
                    <Check className="h-4 w-4" />
                  ) : currentStep === step.id && isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CircleDot className="h-4 w-4" />
                  )}
                </div>
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <div className="space-y-2">
                  <h4 className="font-medium text-[#30035e]">{STAGE_INFO[step.id as StepId].title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {STAGE_INFO[step.id as StepId].description}
                  </p>
                </div>
              </HoverCardContent>
            </HoverCard>
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
            {currentStep === step.id && isLoading && (
              <span className="ml-2 text-xs text-[#f9a8c9] animate-pulse">
                {currentStep === 'competitors' ? "Analyzing..." :
                 currentStep === 'icps' ? "Generating..." :
                 currentStep === 'personas' ? "Generating..." :
                 "Processing..."}
              </span>
            )}
          </span>
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
  type: 'company' | 'product' | 'competitors' | 'icps' | 'personas';
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
        {step.type === 'competitors' && <CircleDot className="h-4 w-4 text-[#f9a8c9]" />}
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

function CompanySetup({ onComplete }: { onComplete: (completedICPs: ICP[], completedPersonas: Persona[]) => void }) {
  const [step, setStep] = useState<StepId | 'complete'>('initial')
  const [isLoading, setIsLoading] = useState(false)
  const [companyName, setCompanyName] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [competitors, setCompetitors] = useState<Competitor[]>([])
  const [icps, setICPs] = useState<ICP[]>([])
  const [personas, setPersonas] = useState<Persona[]>([])
  const [completedSteps, setCompletedSteps] = useState<CompletedStep[]>([])
  const [editingStep, setEditingStep] = useState<string | null>(null)

  const handleCompanySubmit = () => {
    if (!companyName) return
    setCompletedSteps([...completedSteps, {
      type: 'company',
      title: 'Company',
      summary: companyName
    }])
    setStep('product')
  }

  const handleProductSubmit = () => {
    setCompletedSteps([...completedSteps, {
      type: 'product',
      title: 'Product',
      summary: products.length > 0 ? `${products.length} products` : 'No products specified'
    }])
    setStep('competitors')
    setIsLoading(true)
    setTimeout(() => {
      setCompetitors(generateCompetitors(companyName))
      setIsLoading(false)
    }, 1500)
  }

  const handleGenerateICPs = () => {
    setCompletedSteps([...completedSteps, {
      type: 'competitors',
      title: 'Competitors',
      summary: `${competitors.length} competitors`
    }])
    setStep('icps')
    setIsLoading(true)
    setTimeout(() => {
      setICPs(generateICPs())
      setIsLoading(false)
    }, 1500)
  }

  const handleGeneratePersonas = () => {
    setCompletedSteps([...completedSteps, {
      type: 'icps',
      title: 'ICPs',
      summary: `${icps.length} ICPs generated`
    }])
    setStep('personas')
    setIsLoading(true)
    setTimeout(() => {
      setPersonas(generatePersonas())
      setIsLoading(false)
    }, 1500)
  }

  const handleComplete = () => {
    setCompletedSteps([...completedSteps, {
      type: 'personas',
      title: 'Personas',
      summary: `${personas.length} personas generated`
    }])
    setStep('complete')
    onComplete(icps, personas)
  }

  const handleEditStep = (type: string) => {
    setEditingStep(type)
    setStep(type as StepId)
    // Remove all steps after the edited one
    const index = completedSteps.findIndex(s => s.type === type)
    setCompletedSteps(completedSteps.slice(0, index))
  }

  // Product interface
  interface Product {
    id: string;
    name: string;
    description?: string;
    category: string;
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
      <Card className="p-4 bg-[#f6efff]/50 hover:bg-[#f6efff] transition-colors group relative">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-[#f9a8c9]" />
              <span className="font-medium text-[#30035e]">{product.name}</span>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => onEdit(product)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:text-red-500"
                onClick={() => onDelete(product.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {product.description && (
            <p className="text-sm text-muted-foreground">{product.description}</p>
          )}
          <Badge variant="outline" className="text-xs border-[#f9a8c9]">
            {product.category}
          </Badge>
        </div>
      </Card>
    )
  }

  // Add competitor interfaces
  interface Competitor {
    id: string;
    name: string;
    industry: string;
    keyProducts: string[];
    marketOverlap: string[];
    website?: string;
  }

  function generateCompetitors(companyName: string): Competitor[] {
    return [
      {
        id: crypto.randomUUID(),
        name: "Competitor A",
        industry: "Software & Technology",
        keyProducts: ["Analytics Platform", "Data Integration"],
        marketOverlap: ["North America", "Europe"],
        website: "competitora.com"
      },
      {
        id: crypto.randomUUID(),
        name: "Competitor B",
        industry: "Software & Technology",
        keyProducts: ["Business Intelligence", "Data Visualization"],
        marketOverlap: ["Europe", "Asia Pacific"],
        website: "competitorb.com"
      },
      {
        id: crypto.randomUUID(),
        name: "Competitor C",
        industry: "Software & Technology",
        keyProducts: ["AI Analytics", "Predictive Modeling"],
        marketOverlap: ["North America", "Asia Pacific"],
        website: "competitorc.com"
      }
    ]
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
      <Card className="p-4 bg-[#f6efff]/50 hover:bg-[#f6efff] transition-colors group relative">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-[#f9a8c9]" />
              <span className="font-medium text-[#30035e]">{competitor.name}</span>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => onEdit(competitor)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:text-red-500"
                onClick={() => onDelete(competitor.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Industry:</span>
              <p className="font-medium">{competitor.industry}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Website:</span>
              <p className="font-medium">{competitor.website || 'N/A'}</p>
            </div>
          </div>

          <div className="space-y-2">
            <div>
              <span className="text-sm text-muted-foreground">Key Products:</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {competitor.keyProducts.map((product) => (
                  <Badge 
                    key={product} 
                    variant="outline" 
                    className="text-xs border-[#f9a8c9]"
                  >
                    {product}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Market Overlap:</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {competitor.marketOverlap.map((market) => (
                  <Badge 
                    key={market} 
                    variant="outline" 
                    className="text-xs border-[#f9a8c9]"
                  >
                    {market}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Progress and Completed Steps Container */}
      <div className="flex flex-col items-center gap-4">
        {/* Progress Bar with Loading State */}
        <StepIndicator currentStep={step} isLoading={isLoading} />
        
        {/* Completed Steps - Aligned with Progress */}
        <AnimatePresence>
          {completedSteps.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex gap-[32px]"
            >
              {completedSteps.map((completedStep) => (
                <CompletedStepChip
                  key={completedStep.type}
                  step={completedStep}
                  onEdit={() => handleEditStep(completedStep.type)}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Current Step */}
      <AnimatePresence mode="wait">
        {!isLoading && (
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-center"
          >
            {step === 'initial' && (
              <div className="w-full max-w-xl space-y-3">
                <Label className="text-center block">Company Name</Label>
                <div className="relative flex items-center">
                  <div className="relative flex-1">
                    <Input
                      placeholder="Enter company name"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="pr-24 h-12 text-lg focus-visible:ring-[#30035e]"
                    />
                    <Button
                      onClick={handleCompanySubmit}
                      disabled={!companyName}
                      className="absolute right-1 top-1 bottom-1 bg-[#30035e] hover:bg-[#30035e]/90"
                      size="sm"
                    >
                      Next <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {step === 'product' && (
              <div className="w-full max-w-2xl space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-lg font-medium text-[#30035e]">Product Portfolio</Label>
                    <p className="text-sm text-muted-foreground mt-1">Add your company's products or services</p>
                  </div>
                  <Button
                    onClick={() => {
                      const newProduct: Product = {
                        id: crypto.randomUUID(),
                        name: "",
                        category: "B2B"
                      }
                      setProducts([...products, newProduct])
                    }}
                    className="bg-[#30035e] hover:bg-[#30035e]/90"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                </div>

                <ScrollArea className="h-[300px]">
                  <div className="grid grid-cols-1 gap-4">
                    {products.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onEdit={(editedProduct) => {
                          setProducts(products.map(p => 
                            p.id === editedProduct.id ? editedProduct : p
                          ))
                        }}
                        onDelete={(id) => {
                          setProducts(products.filter(p => p.id !== id))
                        }}
                      />
                    ))}
                  </div>
                </ScrollArea>

                <div className="flex justify-end pt-4">
                  <Button
                    onClick={handleProductSubmit}
                    disabled={products.length === 0}
                    className="bg-[#30035e] hover:bg-[#30035e]/90"
                  >
                    Continue to Competitors <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {step === 'competitors' && !isLoading && (
              <Card className="w-full max-w-2xl p-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-[#30035e]">Main Competitors</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Auto-populated competitors based on your company profile. You can add, edit, or remove competitors.
                      </p>
                    </div>
                    <Button
                      onClick={() => {
                        const newCompetitor: Competitor = {
                          id: crypto.randomUUID(),
                          name: "",
                          industry: "",
                          keyProducts: [],
                          marketOverlap: []
                        }
                        setCompetitors([...competitors, newCompetitor])
                      }}
                      className="bg-[#30035e] hover:bg-[#30035e]/90"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Competitor
                    </Button>
                  </div>

                  <ScrollArea className="h-[400px]">
                    <div className="grid grid-cols-1 gap-4">
                      {competitors.map((competitor) => (
                        <CompetitorCard
                          key={competitor.id}
                          competitor={competitor}
                          onEdit={(editedCompetitor) => {
                            setCompetitors(competitors.map(c => 
                              c.id === editedCompetitor.id ? editedCompetitor : c
                            ))
                          }}
                          onDelete={(id) => {
                            setCompetitors(competitors.filter(c => c.id !== id))
                          }}
                        />
                      ))}
                    </div>
                  </ScrollArea>

                  <div className="flex justify-end pt-4">
                    <Button
                      onClick={handleGenerateICPs}
                      disabled={competitors.length === 0}
                      className="bg-[#30035e] hover:bg-[#30035e]/90"
                    >
                      Generate Initial ICPs <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {step === 'icps' && !isLoading && (
              <Card className="w-full max-w-4xl p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-[#30035e]">Initial ICPs</h3>
                    <Button 
                      onClick={handleGeneratePersonas}
                      className="bg-[#30035e] hover:bg-[#30035e]/90"
                    >
                      Generate Initial Personas <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                  <ScrollArea className="w-full">
                    <div className="flex gap-4 pb-4">
                      {icps.map((icp) => (
                        <Card key={icp.id} className="p-4 min-w-[250px] space-y-3 bg-[#f6efff]/50 hover:bg-[#f6efff] transition-colors">
                          <div className="flex items-center gap-2">
                            <Globe2 className="h-4 w-4 text-[#f9a8c9]" />
                            <span className="font-medium text-[#30035e]">{icp.region}</span>
                          </div>
                          <div className="space-y-2 text-sm text-muted-foreground">
                            <div>Vertical: {icp.vertical}</div>
                            <div>Company Size: {icp.companySize}</div>
                          </div>
                        </Card>
                      ))}
                    </div>
                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>
                </div>
              </Card>
            )}

            {step === 'personas' && !isLoading && (
              <Card className="w-full max-w-4xl p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-[#30035e]">Initial Personas</h3>
                    <Button 
                      onClick={handleComplete}
                      className="bg-[#30035e] hover:bg-[#30035e]/90"
                    >
                      Complete Setup <Check className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                  <ScrollArea className="w-full">
                    <div className="flex gap-4 pb-4">
                      {personas.map((persona) => (
                        <Card key={persona.id} className="p-4 min-w-[250px] space-y-3 bg-[#f6efff]/50 hover:bg-[#f6efff] transition-colors">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-[#f9a8c9]" />
                            <span className="font-medium text-[#30035e]">{persona.title}</span>
                          </div>
                          <div className="space-y-2 text-sm text-muted-foreground">
                            <div>Seniority: {persona.seniority}</div>
                            <div>Department: {persona.department}</div>
                          </div>
                        </Card>
                      ))}
                    </div>
                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>
                </div>
              </Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Setup Complete Alert */}
      {step === 'complete' && (
        <Alert className="bg-[#f6efff] border-[#f9a8c9] max-w-2xl mx-auto">
          <Check className="h-4 w-4 text-[#30035e]" />
          <AlertTitle className="text-[#30035e]">Setup Complete</AlertTitle>
          <AlertDescription className="text-[#30035e]/80">
            Company profile has been set up successfully. You can now proceed to generate queries.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

export function ResponseAnalysis({ companyId }: Props) {
  const selectedCompanyId = useDashboardStore(state => state.selectedCompanyId)
  const effectiveCompanyId = companyId ?? selectedCompanyId
  const [setupComplete, setSetupComplete] = useState(false)
  const [icps, setICPs] = useState<ICP[]>([])
  const [personas, setPersonas] = useState<Persona[]>([])
  const queryGenerationRef = useRef<HTMLDivElement>(null)

  const handleSetupComplete = (completedICPs: ICP[], completedPersonas: Persona[]) => {
    setICPs(completedICPs)
    setPersonas(completedPersonas)
    setSetupComplete(true)
    
    // Wait for alert animation to complete then scroll
    setTimeout(() => {
      queryGenerationRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      })
    }, 800) // Matches the alert animation duration
  }

  if (!effectiveCompanyId) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-semibold tracking-tight">No Company Selected</h2>
          <p className="text-muted-foreground mt-2">Please select a company to view response analysis</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Response Analysis</h2>
          <p className="text-muted-foreground">Set up your company profile and generate AI responses</p>
        </div>

        <div className="space-y-8">
          <CompanySetup onComplete={handleSetupComplete} />
          
          <AnimatePresence>
            {setupComplete && (
              <motion.div
                ref={queryGenerationRef}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ 
                  duration: 0.3,
                  delay: 0.5 // Delay to allow setup completion animation to finish
                }}
              >
                <div className="space-y-6">
                  <Separator className="my-8" />
                  <div className="flex items-center gap-2 text-lg font-semibold text-primary">
                    <Package className="h-5 w-5" />
                    Query Generation
                  </div>
                  <QueryGeneration icps={icps} personas={personas} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Card>
  )
} 