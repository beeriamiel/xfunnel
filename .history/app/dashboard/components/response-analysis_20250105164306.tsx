'use client'

import * as React from 'react'
import { useState, useRef, useEffect } from "react"
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
  X,
  ChevronUp,
  ChevronDown
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
  id: string;
  text: string;
  status: 'pending' | 'complete';
  createdAt: Date;
}

interface SelectableCardProps { 
  isSelected: boolean;
  onClick: () => void;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  className?: string;
}

function SelectableCard({ 
  isSelected, 
  onClick, 
  icon: Icon, 
  title, 
  subtitle,
  className
}: SelectableCardProps) {
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
      setQueries(generateQueries())
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

type StepId = 'initial' | 'product' | 'companyData' | 'icps' | 'personas' | 'complete'

interface StepIndicatorProps {
  currentStep: StepId;
  isLoading: boolean;
}

const STAGE_EXPLANATIONS = {
  initial: "Enter your company details to begin the analysis setup",
  product: "Add your main products or services - you can add multiple products",
  companyData: "Review and modify auto-generated list of your main competitors",
  icps: "Review and customize auto-generated Ideal Customer Profiles - you can add, edit or remove them",
  personas: "Review and customize auto-generated buyer personas - you can add, edit or remove them"
} as const

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

function CompanySetup({ onComplete }: { onComplete: (completedICPs: ICP[], completedPersonas: Persona[]) => void }) {
  const [step, setStep] = useState<StepId>('initial')
  const [isLoading, setIsLoading] = useState(false)
  const [companyName, setCompanyName] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    description: ''
  })
  const [competitors, setCompetitors] = useState<Competitor[]>([])
  const [editingCompetitor, setEditingCompetitor] = useState<Competitor | null>(null)
  const [newCompetitor, setNewCompetitor] = useState<Partial<Competitor>>({
    name: ''
  })
  const [icps, setICPs] = useState<ICP[]>([])
  const [personas, setPersonas] = useState<Persona[]>([])
  const [completedSteps, setCompletedSteps] = useState<CompletedStep[]>([])
  const [editingStep, setEditingStep] = useState<StepId | null>(null)
  const [editingICP, setEditingICP] = useState<ICP | null>(null)
  const [newICP, setNewICP] = useState<Partial<ICP>>({
    region: '',
    vertical: '',
    companySize: ''
  })
  const [newPersona, setNewPersona] = useState<Partial<Persona>>({
    title: '',
    seniority: '',
    department: ''
  })
  const [editingPersona, setEditingPersona] = useState<Persona | null>(null)
  const [dialogOpen, setDialogOpen] = useState({
    competitor: false,
    icp: false,
    persona: false,
    product: false
  })
  const [competitorNames, setCompetitorNames] = useState(['', '', '', ''])

  // Mock function to generate competitors based on company name and products
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
    // Generate initial competitors based on company and products
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

  const handleComplete = () => {
    setCompletedSteps([...completedSteps, {
      type: 'personas',
      title: 'Personas',
      summary: `${personas.length} personas generated`
    }])
    setStep('complete')
    onComplete(icps, personas)
  }

  const handleEditStep = (type: CompletedStep['type']) => {
    setEditingStep(type as StepId)
    setStep(type as StepId)
    // Remove all steps after the edited one
    const index = completedSteps.findIndex(s => s.type === type)
    setCompletedSteps(completedSteps.slice(0, index))
  }

  const handleAddICP = () => {
    if (!newICP.region || !newICP.vertical || !newICP.companySize) return
    
    const icp: ICP = {
      id: icps.length + 1,
      region: newICP.region,
      vertical: newICP.vertical,
      companySize: newICP.companySize
    }
    
    setICPs([...icps, icp])
    setNewICP({ region: '', vertical: '', companySize: '' })
    setDialogOpen({ ...dialogOpen, icp: false })
  }

  const handleEditICP = (icp: ICP) => {
    setEditingICP(icp)
    setNewICP(icp)
  }

  const handleUpdateICP = () => {
    if (!editingICP || !newICP.region || !newICP.vertical || !newICP.companySize) return
    
    setICPs(icps.map(i => 
      i.id === editingICP.id 
        ? { ...editingICP, ...newICP as ICP }
        : i
    ))
    setEditingICP(null)
    setNewICP({ region: '', vertical: '', companySize: '' })
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
    if (!newPersona.title || !newPersona.seniority || !newPersona.department) return
    
    const persona: Persona = {
      id: personas.length + 1,
      title: newPersona.title,
      seniority: newPersona.seniority,
      department: newPersona.department
    }
    
    setPersonas([...personas, persona])
    setNewPersona({ title: '', seniority: '', department: '' })
    setDialogOpen({ ...dialogOpen, persona: false })
  }

  const handleEditPersona = (persona: Persona) => {
    setEditingPersona(persona)
    setNewPersona(persona)
  }

  const handleUpdatePersona = () => {
    if (!editingPersona || !newPersona.title || !newPersona.seniority || !newPersona.department) return
    
    setPersonas(personas.map(p => 
      p.id === editingPersona.id 
        ? { ...editingPersona, ...newPersona }
        : p
    ))
    setEditingPersona(null)
    setNewPersona({ title: '', seniority: '', department: '' })
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
                              value={newICP.companySize}
                              onChange={(e) => setNewICP({ ...newICP, companySize: e.target.value })}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button 
                            onClick={editingICP ? handleUpdateICP : handleAddICP}
                            disabled={!newICP.region || !newICP.vertical || !newICP.companySize}
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
                              value={newPersona.seniority}
                              onValueChange={(value) => setNewPersona({ ...newPersona, seniority: value })}
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
                            disabled={!newPersona.title || !newPersona.seniority || !newPersona.department}
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

interface Query {
  id: string;
  text: string;
  status: 'pending' | 'complete';
  createdAt: Date;
}

interface ICPPersonaCombination {
  id: string;
  region: string;
  vertical: string;
  companySize: string;
  title: string;
  seniority: string;
  department: string;
  queries?: Query[];
  isExpanded?: boolean;
  hasGeneratedQueries?: boolean;
  lastUpdated: string | null;
}

function QueryList({ 
  queries,
  onAddQuery,
  onEditQuery,
  onDeleteQuery 
}: { 
  queries: Query[];
  onAddQuery: () => void;
  onEditQuery: (query: Query) => void;
  onDeleteQuery: (id: string) => void;
}) {
  return (
    <div className="py-4 space-y-2">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-medium text-[#30035e]">Generated Queries</h4>
        <Button
          variant="outline"
          size="sm"
          onClick={onAddQuery}
          className="h-8"
        >
          <Plus className="h-3 w-3 mr-1" /> Add Query
        </Button>
      </div>
      <ScrollArea className="h-[200px] w-full rounded-md border">
        <div className="p-4 space-y-3">
          {queries.map((query) => (
            <div
              key={query.id}
              className="flex items-center justify-between p-2 rounded-md hover:bg-[#f6efff]/50 group"
            >
              <span className="text-sm">{query.text}</span>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => onEditQuery(query)}
                >
                  <Pencil className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-destructive"
                  onClick={() => onDeleteQuery(query.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

function ResponseTable({ 
  icps, 
  personas
}: { 
  icps: ICP[];
  personas: Persona[];
}) {
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [combinations, setCombinations] = useState<ICPPersonaCombination[]>([])
  const [dialogOpen, setDialogOpen] = useState<{
    addQuery: boolean;
    editQuery: boolean;
  }>({
    addQuery: false,
    editQuery: false
  })
  const [editingQuery, setEditingQuery] = useState<Query | null>(null)
  const [editingCombinationId, setEditingCombinationId] = useState<string | null>(null)

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
          queries: [],
          isExpanded: false,
          hasGeneratedQueries: false,
          lastUpdated: null
        })
      })
    })
    setCombinations(newCombinations)
  }, [icps, personas])

  const handleGenerateQueries = async (combinationId: string) => {
    // Mock query generation
    const mockQueries: Query[] = [
      {
        id: crypto.randomUUID(),
        text: "What are the key challenges in implementing our solution?",
        status: 'complete',
        createdAt: new Date()
      },
      {
        id: crypto.randomUUID(),
        text: "How do you evaluate new solutions in your role?",
        status: 'complete',
        createdAt: new Date()
      },
      {
        id: crypto.randomUUID(),
        text: "What are your main pain points in the current process?",
        status: 'complete',
        createdAt: new Date()
      }
    ]

    setCombinations(prev => prev.map(combo => 
      combo.id === combinationId
        ? { 
            ...combo, 
            queries: mockQueries,
            hasGeneratedQueries: true,
            isExpanded: true
          }
        : combo
    ))
  }

  const handleRunAnalysis = (combinationId: string) => {
    // Mock analysis start
    console.log('Running analysis for:', combinationId)
  }

  const handleAddQuery = (combinationId: string) => {
    setEditingCombinationId(combinationId)
    setDialogOpen({ ...dialogOpen, addQuery: true })
  }

  const handleEditQuery = (query: Query, combinationId: string) => {
    setEditingQuery(query)
    setEditingCombinationId(combinationId)
    setDialogOpen({ ...dialogOpen, editQuery: true })
  }

  const handleDeleteQuery = (queryId: string, combinationId: string) => {
    setCombinations(prev => prev.map(combo =>
      combo.id === combinationId
        ? {
            ...combo,
            queries: combo.queries?.filter(q => q.id !== queryId) || []
          }
        : combo
    ))
  }

  const toggleExpanded = (combinationId: string) => {
    setCombinations(prev => prev.map(combo =>
      combo.id === combinationId
        ? { ...combo, isExpanded: !combo.isExpanded }
        : combo
    ))
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox 
                  checked={selectedRows.length === combinations.length && combinations.length > 0}
                  onCheckedChange={() => {}}
                />
              </TableHead>
              <TableHead>Region</TableHead>
              <TableHead>Vertical</TableHead>
              <TableHead>Company Size</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Seniority</TableHead>
              <TableHead>Department</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {combinations.map((combination) => (
              <React.Fragment key={combination.id}>
                <TableRow>
                  <TableCell>
                    <Checkbox 
                      checked={selectedRows.includes(combination.id)}
                      onCheckedChange={() => {}}
                    />
                  </TableCell>
                  <TableCell>{combination.region}</TableCell>
                  <TableCell>{combination.vertical}</TableCell>
                  <TableCell>{combination.companySize}</TableCell>
                  <TableCell>{combination.title}</TableCell>
                  <TableCell>{combination.seniority}</TableCell>
                  <TableCell>{combination.department}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      {!combination.hasGeneratedQueries ? (
                        <Button
                          size="sm"
                          onClick={() => handleGenerateQueries(combination.id)}
                          className="bg-[#30035e] hover:bg-[#30035e]/90"
                        >
                          Generate Queries
                        </Button>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleExpanded(combination.id)}
                            className="border-[#30035e] text-[#30035e] hover:bg-[#30035e]/10"
                          >
                            {combination.queries?.length || 0} Queries{' '}
                            {combination.isExpanded ? (
                              <ChevronUp className="ml-1 h-3 w-3" />
                            ) : (
                              <ChevronDown className="ml-1 h-3 w-3" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleRunAnalysis(combination.id)}
                            className="bg-[#30035e] hover:bg-[#30035e]/90"
                          >
                            Run Analysis (500 points)
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
                {combination.isExpanded && combination.queries && (
                  <TableRow>
                    <TableCell colSpan={8} className="bg-accent/5">
                      <QueryList
                        queries={combination.queries}
                        onAddQuery={() => handleAddQuery(combination.id)}
                        onEditQuery={(query) => handleEditQuery(query, combination.id)}
                        onDeleteQuery={(queryId) => handleDeleteQuery(queryId, combination.id)}
                      />
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Add Query Dialog */}
      <Dialog open={dialogOpen.addQuery} onOpenChange={(open) => setDialogOpen({ ...dialogOpen, addQuery: open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Query</DialogTitle>
            <DialogDescription>
              Add a new query for this ICP and persona combination.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Query Text</Label>
              <Input placeholder="Enter your query" />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setDialogOpen({ ...dialogOpen, addQuery: false })}
              className="bg-[#30035e] hover:bg-[#30035e]/90"
            >
              Add Query
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Query Dialog */}
      <Dialog open={dialogOpen.editQuery} onOpenChange={(open) => setDialogOpen({ ...dialogOpen, editQuery: open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Query</DialogTitle>
            <DialogDescription>
              Modify the existing query.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Query Text</Label>
              <Input 
                placeholder="Enter your query" 
                value={editingQuery?.text || ''}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setDialogOpen({ ...dialogOpen, editQuery: false })}
              className="bg-[#30035e] hover:bg-[#30035e]/90"
            >
              Update Query
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export function ResponseAnalysis({ companyId }: Props) {
  const selectedCompanyId = useDashboardStore(state => state.selectedCompanyId)
  const effectiveCompanyId = companyId ?? selectedCompanyId
  const [setupComplete, setSetupComplete] = useState(false)
  const [currentICPs, setICPs] = useState<ICP[]>([])
  const [currentPersonas, setPersonas] = useState<Persona[]>([])
  const queryGenerationRef = useRef<HTMLDivElement>(null)

  const handleSetupComplete = (completedICPs: ICP[], completedPersonas: Persona[]) => {
    setICPs(completedICPs)
    setPersonas(completedPersonas)
    setSetupComplete(true)
    
    setTimeout(() => {
      queryGenerationRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      })
    }, 800)
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
                  delay: 0.5
                }}
              >
                <div className="space-y-6">
                  <Separator className="my-8" />
                  <ResponseTable 
                    icps={currentICPs}
                    personas={currentPersonas}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Card>
  )
} 