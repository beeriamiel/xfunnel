'use client'

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

interface Props {
  companyId: number;
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

interface Product {
  id: number;
  name: string;
  description: string;
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
  const steps = [
    { 
      id: 'initial', 
      label: 'Company',
      description: "Set up your company's basic information and details. This will help us understand your business context."
    },
    { 
      id: 'product', 
      label: 'Products',
      description: "Add and manage your company's products or services. You can add multiple products and edit them anytime."
    },
    { 
      id: 'companyData', 
      label: 'Competitors',
      description: "Review your auto-generated main competitors. You can add, modify, or remove competitors as needed."
    },
    { 
      id: 'icps', 
      label: 'ICPs',
      description: "Review your auto-generated Ideal Customer Profiles. You can customize these profiles to better match your target market."
    },
    { 
      id: 'personas', 
      label: 'Personas',
      description: "Review your auto-generated buyer personas. You can modify these to align with your actual target audience."
    }
  ]

  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <HoverCard>
            <HoverCardTrigger asChild>
              <div className="flex items-center cursor-help">
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
                  ) : currentStep === step.id && isLoading ? (
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
                  {currentStep === step.id && isLoading && (
                    <span className="ml-2 text-xs text-[#f9a8c9] animate-pulse">
                      {currentStep === 'companyData' ? "Analyzing..." :
                       currentStep === 'icps' ? "Generating..." :
                       currentStep === 'personas' ? "Generating..." :
                       "Processing..."}
                    </span>
                  )}
                </span>
              </div>
            </HoverCardTrigger>
            <HoverCardContent 
              className="w-80 p-3" 
              align="center"
              side="bottom"
            >
              <div className="flex flex-col space-y-2">
                <p className="font-medium text-[#30035e]">{step.label}</p>
                <p className="text-sm text-muted-foreground">{step.description}</p>
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

function CompanySetup({ onComplete }: { onComplete: (completedICPs: ICP[], completedPersonas: Persona[]) => void }) {
  const [step, setStep] = useState<'initial' | 'product' | 'companyData' | 'icps' | 'personas' | 'complete'>('initial')
  const [isLoading, setIsLoading] = useState(false)
  const [companyName, setCompanyName] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [companyData, setCompanyData] = useState<CompanyData | null>(null)
  const [icps, setICPs] = useState<ICP[]>([])
  const [personas, setPersonas] = useState<Persona[]>([])
  const [completedSteps, setCompletedSteps] = useState<CompletedStep[]>([])
  const [editingStep, setEditingStep] = useState<string | null>(null)

  const handleAddProduct = () => {
    setEditingProduct(null)
    setDialogOpen(true)
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setDialogOpen(true)
  }

  const handleDeleteProduct = (id: number) => {
    setProducts(products.filter(p => p.id !== id))
  }

  const handleSaveProduct = (productData: Omit<Product, 'id'>) => {
    if (editingProduct) {
      setProducts(products.map(p => 
        p.id === editingProduct.id 
          ? { ...p, ...productData }
          : p
      ))
    } else {
      setProducts([...products, { id: Date.now(), ...productData }])
    }
    setDialogOpen(false)
    setEditingProduct(null)
  }

  const handleProductsSubmit = () => {
    setCompletedSteps([...completedSteps, {
      type: 'product',
      title: 'Products',
      summary: `${products.length} product${products.length === 1 ? '' : 's'}`
    }])
    setStep('companyData')
    setIsLoading(true)
    setTimeout(() => {
      setCompanyData(generateCompanyData(companyName))
      setIsLoading(false)
    }, 1500)
  }

  const handleCompanySubmit = () => {
    if (!companyName) return
    setCompletedSteps([...completedSteps, {
      type: 'company',
      title: 'Company',
      summary: companyName
    }])
    setStep('product')
  }

  const handleGenerateICPs = () => {
    setCompletedSteps([...completedSteps, {
      type: 'data',
      title: 'Company Data',
      summary: `${companyData?.industry}, ${companyData?.category}`
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
    setStep(type as any)
    // Remove all steps after the edited one
    const index = completedSteps.findIndex(s => s.type === type)
    setCompletedSteps(completedSteps.slice(0, index))
  }

  const handleCompanyDataChange = (field: keyof CompanyData, value: string) => {
    if (!companyData) return
    setCompanyData({
      ...companyData,
      [field]: value
    })
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
              <div className="w-full max-w-xl space-y-3">
                <Label className="text-center block">Product Name (Optional)</Label>
                <div className="relative flex items-center">
                  <div className="relative flex-1">
                    <Input
                      placeholder="Enter product name"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="pr-36 h-12 text-lg"
                    />
                    <Button
                      onClick={handleProductsSubmit}
                      className="absolute right-1 top-1 bottom-1"
                      size="sm"
                    >
                      Generate Data <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {step === 'companyData' && !isLoading && companyData && (
              <Card className="w-full max-w-2xl p-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Industry</Label>
                      <Input 
                        value={companyData.industry} 
                        onChange={(e) => handleCompanyDataChange('industry', e.target.value)}
                        className="h-10" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select 
                        defaultValue={companyData.category}
                        onValueChange={(value) => handleCompanyDataChange('category', value)}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="B2B">B2B</SelectItem>
                          <SelectItem value="B2C">B2C</SelectItem>
                          <SelectItem value="Both">Both</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Employee Range</Label>
                      <Input 
                        value={companyData.employees} 
                        onChange={(e) => handleCompanyDataChange('employees', e.target.value)}
                        className="h-10" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Revenue Range</Label>
                      <Input 
                        value={companyData.revenue} 
                        onChange={(e) => handleCompanyDataChange('revenue', e.target.value)}
                        className="h-10" 
                      />
                    </div>
                  </div>
                  <div className="flex justify-end pt-2">
                    <Button onClick={handleGenerateICPs}>
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