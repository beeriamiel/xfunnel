'use client'

import { useState, useRef, useEffect, Fragment } from 'react'
import type { FC, ReactNode } from 'react'
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useDashboardStore } from "@/app/dashboard/store"
import { cn } from "@/lib/utils"
import confetti from 'canvas-confetti'
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
import { CompanyProfileHeader } from './company-profile-header'
import type {
  CompanyData,
  ICP,
  Persona,
  Query,
  Product,
  Competitor,
  CompletedStep,
  StepId,
  StepIndicatorProps,
  CompanySetupProps,
  ICPPersonaCombination,
  SelectableCardProps
} from './types'

const STAGE_EXPLANATIONS = {
  initial: "Enter your company details to get started with the analysis process.",
  product: "Define your product offerings and their key features.",
  companyData: "Identify and analyze your main competitors in the market.",
  icps: "Generate and refine your Ideal Customer Profiles (ICPs) based on market data.",
  personas: "Create detailed buyer personas aligned with your ICPs."
} as const;

interface Props {
  icps: ICP[]
  personas: Persona[]
}

const QueryGeneration: FC<Props> = ({ icps, personas }) => {
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
                  subtitle={icp.company_size}
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
                  subtitle={persona.seniority_level}
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
                  {queries.map((query: Query) => (
                    <Card key={query.id} className="p-3 bg-[#f6efff]/50 hover:bg-[#f6efff] transition-colors">
                      <div className="space-y-2">
                        <p className="text-sm text-[#30035e]">{query.text}</p>
                        <div className="flex gap-2">
                          <div className="text-xs border rounded px-2 py-1 border-[#f9a8c9]">
                            {query.icp.region} · {query.icp.vertical}
                          </div>
                          <div className="text-xs border rounded px-2 py-1 border-[#f9a8c9]">
                            {query.persona.title} · {query.persona.department}
                          </div>
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

function StepIndicator({ currentStep, isLoading }: StepIndicatorProps) {
  const steps = [
    { id: 'initial', label: 'Company' },
    { id: 'product', label: 'Product' },
    { id: 'companyData', label: 'Competitors' },
    { id: 'icps', label: 'ICPs' },
    { id: 'personas', label: 'Personas' }
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
        <div>Company Size: {icp.company_size}</div>
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
        <div>Seniority: {persona.seniority_level}</div>
        <div>Department: {persona.department}</div>
      </div>
    </Card>
  )
}

function CompanySetup({ onComplete, onTransitionStart }: CompanySetupProps) {
  const [step, setStep] = React.useState<StepId>('initial')
  const [isLoading, setIsLoading] = React.useState(false)
  const [companyName, setCompanyName] = React.useState('')
  const [products, setProducts] = React.useState<Product[]>([])
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(null)
  const [newProduct, setNewProduct] = React.useState<Partial<Product>>({
    name: '',
    description: ''
  })
  const [competitors, setCompetitors] = React.useState<Competitor[]>([])
  const [editingCompetitor, setEditingCompetitor] = React.useState<Competitor | null>(null)
  const [newCompetitor, setNewCompetitor] = React.useState<Partial<Competitor>>({
    name: ''
  })
  const [icps, setICPs] = React.useState<ICP[]>([])
  const [personas, setPersonas] = React.useState<Persona[]>([])
  const [completedSteps, setCompletedSteps] = React.useState<CompletedStep[]>([])
  const [editingStep, setEditingStep] = React.useState<StepId | null>(null)
  const [editingICP, setEditingICP] = React.useState<ICP | null>(null)
  const [newICP, setNewICP] = React.useState<Partial<ICP>>({
    region: '',
    vertical: '',
    company_size: ''
  })
  const [newPersona, setNewPersona] = React.useState<Partial<Persona>>({
    title: '',
    seniority_level: '',
    department: ''
  })
  const [editingPersona, setEditingPersona] = React.useState<Persona | null>(null)
  const [dialogOpen, setDialogOpen] = React.useState({
    competitor: false,
    icp: false,
    persona: false,
    product: false
  })
  const [competitorNames, setCompetitorNames] = React.useState(['', '', '', ''])

  const handleComplete = () => {
    setCompletedSteps([...completedSteps, {
      type: 'personas',
      title: 'Personas',
      summary: `${personas.length} personas generated`
    }])
    setStep('complete')
    onTransitionStart()
    onComplete(icps, personas)
  }

  const generateCompetitors = (companyName: string, products: Product[]): Competitor[] => {
    return [
      {
        id: crypto.randomUUID(),
        name: "Competitor A"
      },
      {
        id: crypto.randomUUID(),
        name: "Competitor B"
      }
    ]
  }

  const handleProductSubmit = () => {
    if (products.length === 0) {
      return
    }
    setCompletedSteps([...completedSteps, {
      type: 'product',
      title: 'Products',
      summary: `${products.length} products added`
    }])
    setStep('companyData')
    setIsLoading(true)
    setTimeout(() => {
      const generatedCompetitors = generateCompetitors(companyName, products)
      setCompetitors(generatedCompetitors)
      setIsLoading(false)
    }, 1500)
  }

  const handleAddCompetitor = () => {
    if (!newCompetitor.name) return
    
    const competitor: Competitor = {
      id: crypto.randomUUID(),
      name: newCompetitor.name,
    }
    
    setCompetitors([...competitors, competitor])
    setNewCompetitor({ name: '' })
    setDialogOpen({ ...dialogOpen, competitor: false })
  }

  const handleEditCompetitor = (competitor: Competitor) => {
    setEditingCompetitor(competitor)
    setNewCompetitor({ name: competitor.name })
  }

  const handleUpdateCompetitor = () => {
    if (!editingCompetitor || !newCompetitor.name) return
    
    setCompetitors(competitors.map(c => 
      c.id === editingCompetitor.id 
        ? { ...editingCompetitor, ...newCompetitor as Competitor }
        : c
    ))
    setEditingCompetitor(null)
    setNewCompetitor({ name: '' })
    setDialogOpen({ ...dialogOpen, competitor: false })
  }

  const handleDeleteCompetitor = (id: string) => {
    setCompetitors(competitors.filter(c => c.id !== id))
  }

  const handleCompetitorsSubmit = () => {
    if (competitors.length === 0) return
    
    setCompletedSteps([...completedSteps, {
      type: 'data',
      title: 'Competitors',
      summary: `${competitors.length} competitors added`
    }])
    setStep('icps')
    setIsLoading(true)
    setTimeout(() => {
      setICPs(generateICPs())
      setIsLoading(false)
    }, 1500)
  }

  const handleAddProduct = () => {
    if (!newProduct.name) return
    
    const product: Product = {
      id: crypto.randomUUID(),
      name: newProduct.name,
    }
    
    setProducts([...products, product])
    setDialogOpen({ ...dialogOpen, product: false })
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setNewProduct(product)
  }

  const handleUpdateProduct = () => {
    if (!editingProduct || !newProduct.name) return
    
    setProducts(products.map(p => 
      p.id === editingProduct.id 
        ? { ...editingProduct, ...newProduct }
        : p
    ))
    setEditingProduct(null)
    setDialogOpen({ ...dialogOpen, product: false })
  }

  const handleDeleteProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id))
  }

  const handleEditStep = (type: CompletedStep['type']) => {
    setEditingStep(type as StepId)
    setStep(type as StepId)
    const index = completedSteps.findIndex(s => s.type === type)
    setCompletedSteps(completedSteps.slice(0, index))
  }

  const handleAddICP = () => {
    if (!newICP.region || !newICP.vertical || !newICP.company_size) return
    
    const icp: ICP = {
      id: icps.length + 1,
      region: newICP.region,
      vertical: newICP.vertical,
      company_size: newICP.company_size,
      personas: []
    }
    
    setICPs([...icps, icp])
    setNewICP({ region: '', vertical: '', company_size: '' })
    setDialogOpen({ ...dialogOpen, icp: false })
  }

  const handleEditICP = (icp: ICP) => {
    setEditingICP(icp)
    setNewICP(icp)
  }

  const handleUpdateICP = () => {
    if (!editingICP || !newICP.region || !newICP.vertical || !newICP.company_size) return
    
    setICPs(icps.map(i => 
      i.id === editingICP.id 
        ? { ...editingICP, ...newICP as ICP }
        : i
    ))
    setEditingICP(null)
    setNewICP({ region: '', vertical: '', company_size: '' })
    setDialogOpen({ ...dialogOpen, icp: false })
  }

  const handleDeleteICP = (id: number) => {
    setICPs(icps.filter(i => i.id !== id))
  }

  const handleICPsSubmit = () => {
    if (icps.length === 0) return
    
    setCompletedSteps([...completedSteps, {
      type: 'icps',
      title: 'ICPs',
      summary: `${icps.length} ICPs configured`
    }])
    setStep('personas')
    setIsLoading(true)
    setTimeout(() => {
      setPersonas(generatePersonas())
      setIsLoading(false)
    }, 1500)
  }

  const handleAddPersona = () => {
    if (!newPersona.title || !newPersona.seniority_level || !newPersona.department) return
    
    const persona: Persona = {
      id: personas.length + 1,
      title: newPersona.title,
      seniority_level: newPersona.seniority_level,
      department: newPersona.department
    }
    
    setPersonas([...personas, persona])
    setNewPersona({ title: '', seniority_level: '', department: '' })
    setDialogOpen({ ...dialogOpen, persona: false })
  }

  const handleEditPersona = (persona: Persona) => {
    setEditingPersona(persona)
    setNewPersona(persona)
  }

  const handleUpdatePersona = () => {
    if (!editingPersona || !newPersona.title || !newPersona.seniority_level || !newPersona.department) return
    
    setPersonas(personas.map(p => 
      p.id === editingPersona.id 
        ? { ...editingPersona, ...newPersona }
        : p
    ))
    setEditingPersona(null)
    setNewPersona({ title: '', seniority_level: '', department: '' })
    setDialogOpen({ ...dialogOpen, persona: false })
  }

  const handleDeletePersona = (id: number) => {
    setPersonas(personas.filter(p => p.id !== id))
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

  const handleCompetitorNameChange = (index: number, value: string) => {
    const newNames = [...competitorNames]
    newNames[index] = value
    setCompetitorNames(newNames)
  }

  const handleAddCompetitors = () => {
    const newCompetitors = competitorNames
      .filter(name => name.trim())
      .map(name => ({
        id: crypto.randomUUID(),
        name: name.trim()
      }))
    
    setCompetitors([...competitors, ...newCompetitors])
    setCompetitorNames(['', '', '', ''])
    setDialogOpen({ ...dialogOpen, competitor: false })
  }

  const fireConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f9a8c9', '#30035e', '#f6efff'],
    });

    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#f9a8c9', '#30035e', '#f6efff'],
      });
    }, 200);

    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#f9a8c9', '#30035e', '#f6efff'],
      });
    }, 400);
  };

  const handleSetupComplete = async (completedICPs: ICP[], completedPersonas: Persona[]) => {
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setShowSuccessAnimation(false)
    
    setICPs(completedICPs)
    setPersonas(completedPersonas)
    setCompanyProfile({
      icps: completedICPs,
      personas: completedPersonas,
      products: [],
      competitors: []
    })

    await new Promise(resolve => setTimeout(resolve, 500))
    setHasCompletedOnboarding(true)
    setIsTransitioning(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-4">
        <StepIndicator currentStep={step} isLoading={isLoading} />
        
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

            {step === 'product' && !isLoading && (
              <Card className="w-full max-w-xl p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-[#30035e]">Products</h3>
                      <p className="text-sm text-muted-foreground">Add your main products or services</p>
                    </div>
                  </div>

                  <AnimatePresence>
                    <div className="min-h-[100px] flex flex-col">
                      {products.map((product) => (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          key={product.id}
                          className="group flex items-center justify-between p-2 hover:bg-[#f6efff]/50 rounded-md transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-[#f9a8c9]" />
                            <span className="font-medium">{product.name}</span>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleEditProduct(product)}
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive"
                              onClick={() => handleDeleteProduct(product.id)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                      {products.length === 0 && (
                        <div className="h-[100px] flex items-center justify-center">
                          <p className="text-sm text-muted-foreground">Add your first product</p>
                        </div>
                      )}
                    </div>
                  </AnimatePresence>

                  <div className="flex justify-between items-center pt-2">
                    <Dialog open={dialogOpen.product} onOpenChange={(open) => setDialogOpen({ ...dialogOpen, product: open })}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="border-[#30035e] text-[#30035e] hover:bg-[#30035e]/10">
                          Add Product <Plus className="ml-2 h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>{editingProduct ? 'Edit' : 'Add'} Product</DialogTitle>
                          <DialogDescription>
                            Add details about your product. All fields are required.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="space-y-2">
                            <Label>Product Name</Label>
                            <Input
                              placeholder="Enter product name"
                              value={newProduct.name}
                              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button 
                            onClick={editingProduct ? handleUpdateProduct : handleAddProduct}
                            disabled={!newProduct.name}
                            className="bg-[#30035e] hover:bg-[#30035e]/90"
                          >
                            {editingProduct ? 'Update' : 'Add'} Product
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <Button
                      onClick={handleProductSubmit}
                      disabled={products.length === 0}
                      className="bg-[#30035e] hover:bg-[#30035e]/90"
                    >
                      Continue <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {step === 'companyData' && !isLoading && (
              <Card className="w-full max-w-2xl p-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-[#30035e]">Competitors</h3>
                    <p className="text-sm text-muted-foreground">These competitors were auto-generated based on your company profile.</p>
                  </div>

                  <div className="min-h-[100px] max-h-[300px] overflow-y-auto">
                    <div className="grid gap-2">
                      {competitors.map((competitor) => (
                        <CompetitorCard
                          key={competitor.id}
                          competitor={competitor}
                          onEdit={handleEditCompetitor}
                          onDelete={handleDeleteCompetitor}
                        />
                      ))}
                      {competitors.length === 0 && (
                        <div className="py-8 text-center text-sm text-muted-foreground">
                          No competitors added yet
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <Dialog open={dialogOpen.competitor} onOpenChange={(open) => setDialogOpen({ ...dialogOpen, competitor: open })}>
                      <DialogTrigger asChild>
                        <Button className="bg-[#30035e] hover:bg-[#30035e]/90">
                          Add Competitors <Plus className="ml-2 h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Add Competitors</DialogTitle>
                          <DialogDescription>
                            Add up to 4 main competitors in your industry
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-3 py-4">
                          {[0, 1, 2, 3].map((index) => (
                            <div key={index} className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-[#f9a8c9] shrink-0" />
                              <Input
                                placeholder={`Competitor ${index + 1}`}
                                value={competitorNames[index]}
                                onChange={(e) => handleCompetitorNameChange(index, e.target.value)}
                              />
                            </div>
                          ))}
                        </div>
                        <DialogFooter>
                          <Button 
                            onClick={handleAddCompetitors}
                            disabled={!competitorNames.some(name => name.trim())}
                            className="bg-[#30035e] hover:bg-[#30035e]/90"
                          >
                            Add Competitors
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <Button
                      onClick={handleCompetitorsSubmit}
                      disabled={competitors.length === 0}
                      className="bg-[#30035e] hover:bg-[#30035e]/90"
                    >
                      Continue <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {step === 'icps' && !isLoading && (
              <Card className="w-full max-w-4xl p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-[#30035e]">Initial ICPs</h3>
                    <p className="text-sm text-muted-foreground">These ICPs have been auto-generated based on your company profile.</p>
                  </div>

                  <ScrollArea className="w-full">
                    <div className="flex gap-4 pb-4">
                      {icps.map((icp) => (
                        <ICPCard
                          key={icp.id}
                          icp={icp}
                          onEdit={handleEditICP}
                          onDelete={handleDeleteICP}
                        />
                      ))}
                      {icps.length === 0 && (
                        <div className="w-full py-8 text-center text-sm text-muted-foreground">
                          No ICPs added yet
                        </div>
                      )}
                    </div>
                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>

                  <div className="flex justify-between items-center pt-4">
                    <Dialog open={dialogOpen.icp} onOpenChange={(open) => setDialogOpen({ ...dialogOpen, icp: open })}>
                      <DialogTrigger asChild>
                        <Button className="bg-[#30035e] hover:bg-[#30035e]/90">
                          Add ICP <Plus className="ml-2 h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>{editingICP ? 'Edit' : 'Add'} ICP</DialogTitle>
                          <DialogDescription>
                            Add details about your Ideal Customer Profile. All fields are required.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="space-y-2">
                            <Label>Region</Label>
                            <Input
                              placeholder="Enter region"
                              value={newICP.region}
                              onChange={(e) => setNewICP({ ...newICP, region: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Vertical</Label>
                            <Input
                              placeholder="Enter vertical"
                              value={newICP.vertical}
                              onChange={(e) => setNewICP({ ...newICP, vertical: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Company Size</Label>
                            <Input
                              placeholder="Enter company size range"
                              value={newICP.company_size}
                              onChange={(e) => setNewICP({ ...newICP, company_size: e.target.value })}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button 
                            onClick={editingICP ? handleUpdateICP : handleAddICP}
                            disabled={!newICP.region || !newICP.vertical || !newICP.company_size}
                            className="bg-[#30035e] hover:bg-[#30035e]/90"
                          >
                            {editingICP ? 'Update' : 'Add'} ICP
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <Button 
                      onClick={handleICPsSubmit}
                      disabled={icps.length === 0}
                      className="bg-[#30035e] hover:bg-[#30035e]/90"
                    >
                      Continue to Personas <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {step === 'personas' && !isLoading && (
              <Card className="w-full max-w-4xl p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-[#30035e]">Initial Personas</h3>
                    <p className="text-sm text-muted-foreground">These personas have been auto-generated based on your company profile.</p>
                  </div>

                  <ScrollArea className="w-full">
                    <div className="flex gap-4 pb-4">
                      {personas.map((persona) => (
                        <PersonaCard
                          key={persona.id}
                          persona={persona}
                          onEdit={handleEditPersona}
                          onDelete={handleDeletePersona}
                        />
                      ))}
                      {personas.length === 0 && (
                        <div className="w-full py-8 text-center text-sm text-muted-foreground">
                          No personas added yet
                        </div>
                      )}
                    </div>
                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>

                  <div className="flex justify-between items-center pt-4">
                    <Dialog open={dialogOpen.persona} onOpenChange={(open) => setDialogOpen({ ...dialogOpen, persona: open })}>
                      <DialogTrigger asChild>
                        <Button className="bg-[#30035e] hover:bg-[#30035e]/90">
                          Add Persona <Plus className="ml-2 h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>{editingPersona ? 'Edit' : 'Add'} Persona</DialogTitle>
                          <DialogDescription>
                            Add details about your buyer persona. All fields are required.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="space-y-2">
                            <Label>Title</Label>
                            <Input
                              placeholder="Enter title"
                              value={newPersona.title}
                              onChange={(e) => setNewPersona({ ...newPersona, title: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Seniority</Label>
                            <Select
                              value={newPersona.seniority_level}
                              onValueChange={(value) => setNewPersona({ ...newPersona, seniority_level: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select seniority" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Junior">Junior</SelectItem>
                                <SelectItem value="Mid-Level">Mid-Level</SelectItem>
                                <SelectItem value="Senior">Senior</SelectItem>
                                <SelectItem value="Lead">Lead</SelectItem>
                                <SelectItem value="Director">Director</SelectItem>
                                <SelectItem value="VP">VP</SelectItem>
                                <SelectItem value="C-Level">C-Level</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Department</Label>
                            <Select
                              value={newPersona.department}
                              onValueChange={(value) => setNewPersona({ ...newPersona, department: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select department" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Engineering">Engineering</SelectItem>
                                <SelectItem value="Product">Product</SelectItem>
                                <SelectItem value="Design">Design</SelectItem>
                                <SelectItem value="Marketing">Marketing</SelectItem>
                                <SelectItem value="Sales">Sales</SelectItem>
                                <SelectItem value="Operations">Operations</SelectItem>
                                <SelectItem value="Finance">Finance</SelectItem>
                                <SelectItem value="HR">HR</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button 
                            onClick={editingPersona ? handleUpdatePersona : handleAddPersona}
                            disabled={!newPersona.title || !newPersona.seniority_level || !newPersona.department}
                            className="bg-[#30035e] hover:bg-[#30035e]/90"
                          >
                            {editingPersona ? 'Update' : 'Add'} Persona
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <Button 
                      onClick={handleComplete}
                      disabled={personas.length === 0}
                      className="bg-[#30035e] hover:bg-[#30035e]/90"
                    >
                      Complete Setup <Check className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>

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
  const [combinations, setCombinations] = React.useState<ICPPersonaCombination[]>([])
  const [newQuery, setNewQuery] = React.useState("")

  React.useEffect(() => {
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
        ? { 
            ...c, 
            isGeneratingQueries: true,
            queries: c.queries,
            isExpanded: c.isExpanded,
            hasAnalysis: c.hasAnalysis,
            lastAnalysisRun: c.lastAnalysisRun,
            isAnalyzing: c.isAnalyzing,
            analysisHistory: c.analysisHistory
          }
        : c
    ))

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
            isAnalyzing: false,
            analysisHistory: []
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
            queries: c.queries,
            isExpanded: c.isExpanded
          }
        : c
    ))

    await new Promise(resolve => setTimeout(resolve, 2000))

    const now = new Date().toISOString()
    
    setCombinations(prev => prev.map(c => 
      c.id === combination.id 
        ? { 
            ...c, 
            isAnalyzing: false, 
            hasAnalysis: true,
            lastAnalysisRun: now,
            queries: c.queries,
            isExpanded: c.isExpanded,
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

  const handleQueryChange = (query: string) => {
    setSearchQuery(query)
    if (query.length > 0) {
      const filtered = combinations.filter(c => 
        c.region.toLowerCase().includes(query.toLowerCase()) ||
        c.vertical.toLowerCase().includes(query.toLowerCase()) ||
        c.title.toLowerCase().includes(query.toLowerCase()) ||
        c.department.toLowerCase().includes(query.toLowerCase())
      )
      setFilteredCombinations(filtered)
    } else {
      setFilteredCombinations(combinations)
    }
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
              <React.Fragment key={combination.id}>
                <TableRow className="group">
                  <TableCell>{combination.region}</TableCell>
                  <TableCell>{combination.vertical}</TableCell>
                  <TableCell>{combination.company_size}</TableCell>
                  <TableCell>{combination.title}</TableCell>
                  <TableCell>{combination.seniority_level}</TableCell>
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
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Analysis History</p>
                          {combination.analysisHistory?.length > 0 ? (
                            <div className="space-y-1">
                              {combination.analysisHistory.slice().reverse().map((run, index) => (
                                <div key={run.runDate} className="text-sm flex items-center gap-2">
                                  <span className={cn(
                                    "w-2 h-2 rounded-full",
                                    run.status === 'completed' ? "bg-green-500" : "bg-red-500"
                                  )} />
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
                          className={cn(
                            "text-[#30035e] hover:text-[#30035e]/90 transition-colors",
                            combination.isExpanded && "bg-[#f6efff]"
                          )}
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
              </React.Fragment>
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

export function ResponseAnalysis({ companyId }: Props) {
  const selectedCompanyId = useDashboardStore(state => state.selectedCompanyId)
  const { 
    hasCompletedOnboarding, 
    setHasCompletedOnboarding, 
    companyProfile, 
    setCompanyProfile 
  } = useDashboardStore()
  
  const [icps, setICPs] = React.useState<ICP[]>([])
  const [personas, setPersonas] = React.useState<Persona[]>([])
  const [isTransitioning, setIsTransitioning] = React.useState(false)
  const [showSuccessAnimation, setShowSuccessAnimation] = React.useState(false)
  const effectiveCompanyId = companyId ?? selectedCompanyId

  const fireConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f9a8c9', '#30035e', '#f6efff'],
    });

    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#f9a8c9', '#30035e', '#f6efff'],
      });
    }, 200);

    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#f9a8c9', '#30035e', '#f6efff'],
      });
    }, 400);
  };

  const handleTransitionStart = () => {
    setIsTransitioning(true)
    setShowSuccessAnimation(true)
    fireConfetti()
    
    setTimeout(() => {
      confetti({
        particleCount: 30,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#f9a8c9', '#30035e', '#f6efff'],
      });
    }, 700)
  }

  const handleSetupComplete = async (completedICPs: ICP[], completedPersonas: Persona[]) => {
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setShowSuccessAnimation(false)
    
    setICPs(completedICPs)
    setPersonas(completedPersonas)
    setCompanyProfile({
      icps: completedICPs,
      personas: completedPersonas,
      products: [],
      competitors: []
    })

    await new Promise(resolve => setTimeout(resolve, 500))
    setHasCompletedOnboarding(true)
    setIsTransitioning(false)
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
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {!hasCompletedOnboarding && !isTransitioning && (
          <motion.div
            key="setup"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20, transition: { duration: 0.3 } }}
          >
            <Card className="p-6">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Generate Analysis</h2>
                  <p className="text-muted-foreground">Set up your company profile and generate AI responses</p>
                </div>
                <CompanySetup 
                  onComplete={handleSetupComplete}
                  onTransitionStart={handleTransitionStart}
                />
              </div>
            </Card>
          </motion.div>
        )}

        {showSuccessAnimation && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center"
            >
              <div className="bg-[#f6efff] border-2 border-[#f9a8c9] rounded-full p-8 shadow-lg">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ 
                    type: "spring",
                    stiffness: 200,
                    damping: 20,
                    delay: 0.2 
                  }}
                >
                  <Check className="h-12 w-12 text-[#30035e]" />
                </motion.div>
              </div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-6"
              >
                <h3 className="text-lg font-semibold text-[#30035e]">Setup Complete!</h3>
              </motion.div>
            </motion.div>
          </motion.div>
        )}

        {hasCompletedOnboarding && (
          <motion.div
            key="analysis"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.4,
              delay: 0.2,
              ease: [0.4, 0, 0.2, 1]
            }}
          >
            <CompanyProfileHeader companyName="Your Company Name" />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.4,
                delay: 0.4,
                ease: [0.4, 0, 0.2, 1]
              }}
            >
              <Card className="p-6">
                <ResponseTable 
                  icps={companyProfile?.icps || []}
                  personas={companyProfile?.personas || []}
                  onGenerateQuestions={() => {}}
                  onGenerateResponses={() => {}}
                />
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}