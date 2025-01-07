'use client'

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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type StepType = 'company' | 'product' | 'competitors' | 'icps' | 'personas' | 'complete';
type EditableStepType = Exclude<StepType, 'complete'>;

interface CompletedStep {
  type: EditableStepType;
  title: string;
  summary: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
}

interface Competitor {
  id: number;
  name: string;
  description: string;
  mainProducts: string[];
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

// Mock data generation functions
function generateCompanyData(companyName: string): CompanyData {
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

function generatePersonas(): Persona[] {
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

function generateCompetitors(companyName: string): Competitor[] {
  return [
    {
      id: 1,
      name: "CompetitorA Analytics",
      description: "Leading provider of analytics solutions",
      mainProducts: ["Analytics Platform", "Data Visualization", "AI Insights"]
    },
    {
      id: 2,
      name: "DataTech Solutions",
      description: "Enterprise data management platform",
      mainProducts: ["Data Platform", "ETL Tools", "Analytics Suite"]
    },
    {
      id: 3,
      name: "AI Dynamics",
      description: "AI-powered analytics and insights",
      mainProducts: ["AI Analytics", "Predictive Insights", "Data Processing"]
    }
  ]
}

function CompanySetup({ onComplete }: { onComplete: (completedICPs: ICP[], completedPersonas: Persona[]) => void }) {
  const [step, setStep] = useState<StepType>('company')
  const [isLoading, setIsLoading] = useState(false)
  const [companyName, setCompanyName] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | undefined>()
  const [competitors, setCompetitors] = useState<Competitor[]>([])
  const [competitorDialogOpen, setCompetitorDialogOpen] = useState(false)
  const [editingCompetitor, setEditingCompetitor] = useState<Competitor | undefined>()
  const [icps, setICPs] = useState<ICP[]>([])
  const [personas, setPersonas] = useState<Persona[]>([])
  const [completedSteps, setCompletedSteps] = useState<CompletedStep[]>([])
  const [editingStep, setEditingStep] = useState<EditableStepType | null>(null)

  const steps = [
    { 
      id: 'company' as const, 
      label: 'Company',
      description: "Set up your company's basic information and details. This will help us understand your business context."
    },
    { 
      id: 'product' as const, 
      label: 'Products',
      description: "Add and manage your company's products or services. You can add multiple products and edit them anytime."
    },
    { 
      id: 'competitors' as const, 
      label: 'Competitors',
      description: "Review your auto-generated main competitors. You can add, modify, or remove competitors as needed."
    },
    { 
      id: 'icps' as const, 
      label: 'ICPs',
      description: "Review your auto-generated Ideal Customer Profiles. You can customize these profiles to better match your target market."
    },
    { 
      id: 'personas' as const, 
      label: 'Personas',
      description: "Review your auto-generated buyer personas. You can modify these to align with your actual target audience."
    }
  ] as const;

  const handleEditStep = (type: EditableStepType) => {
    setEditingStep(type)
    setStep(type)
    // Remove all steps after the edited one
    const index = completedSteps.findIndex(s => s.type === type)
    setCompletedSteps(completedSteps.slice(0, index))
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

  const handleProductsSubmit = () => {
    setCompletedSteps([...completedSteps, {
      type: 'product',
      title: 'Products',
      summary: `${products.length} product${products.length === 1 ? '' : 's'}`
    }])
    setStep('competitors')
    setIsLoading(true)
    setTimeout(() => {
      setCompetitors(generateCompetitors(companyName))
      setIsLoading(false)
    }, 1500)
  }

  const handleCompetitorsSubmit = () => {
    setCompletedSteps([...completedSteps, {
      type: 'competitors',
      title: 'Competitors',
      summary: `${competitors.length} competitor${competitors.length === 1 ? '' : 's'}`
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

  const handleAddProduct = () => {
    setEditingProduct(undefined)
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
    setEditingProduct(undefined)
  }

  const handleAddCompetitor = () => {
    setEditingCompetitor(undefined)
    setCompetitorDialogOpen(true)
  }

  const handleEditCompetitor = (competitor: Competitor) => {
    setEditingCompetitor(competitor)
    setCompetitorDialogOpen(true)
  }

  const handleDeleteCompetitor = (id: number) => {
    setCompetitors(competitors.filter(c => c.id !== id))
  }

  const handleSaveCompetitor = (competitorData: Omit<Competitor, 'id'>) => {
    if (editingCompetitor) {
      setCompetitors(competitors.map(c => 
        c.id === editingCompetitor.id 
          ? { ...c, ...competitorData }
          : c
      ))
    } else {
      setCompetitors([...competitors, { id: Date.now(), ...competitorData }])
    }
    setCompetitorDialogOpen(false)
    setEditingCompetitor(undefined)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-[#30035e]">Company Setup</h2>
        <div className="flex items-center gap-2">
          {completedSteps.map((step, index) => (
            <div key={index} className="flex items-center">
              <Badge 
                variant="secondary" 
                className="bg-[#f6efff] text-[#30035e] hover:bg-[#f6efff]/80 cursor-pointer"
                onClick={() => handleEditStep(step.type)}
              >
                {step.title}: {step.summary}
              </Badge>
              {index < completedSteps.length - 1 && (
                <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground" />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {step === 'company' && (
          <div className="w-full max-w-xl space-y-3">
            <Label className="text-center block">Company Name</Label>
            <Input 
              value={companyName} 
              onChange={e => setCompanyName(e.target.value)} 
              placeholder="Enter your company name"
              className="focus-visible:ring-[#30035e]"
            />
            <Button 
              onClick={handleCompanySubmit}
              disabled={!companyName.trim()}
              className="w-full bg-[#30035e] hover:bg-[#30035e]/90"
            >
              Continue
            </Button>
          </div>
        )}

        {step === 'product' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-[#30035e]">Products</h3>
              <Button 
                onClick={handleAddProduct}
                className="bg-[#30035e] hover:bg-[#30035e]/90"
              >
                Add Product
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map(product => (
                <Card key={product.id} className="p-4 relative group">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h4 className="font-medium text-[#30035e]">{product.name}</h4>
                      <p className="text-sm text-muted-foreground">{product.description}</p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleEditProduct(product)}
                        className="h-8 w-8 p-0"
                      >
                        <Pencil className="h-4 w-4 text-[#30035e]" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDeleteProduct(product.id)}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4 text-[#30035e]" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            <Button 
              onClick={handleProductsSubmit}
              disabled={products.length === 0}
              className="w-full bg-[#30035e] hover:bg-[#30035e]/90"
            >
              Continue
            </Button>
            <ProductDialog
              open={dialogOpen}
              onClose={() => setDialogOpen(false)}
              onSave={handleSaveProduct}
              initialData={editingProduct}
            />
          </div>
        )}

        {step === 'competitors' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-[#30035e]">Competitors</h3>
              <Button 
                onClick={handleAddCompetitor}
                className="bg-[#30035e] hover:bg-[#30035e]/90"
              >
                Add Competitor
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {competitors.map(competitor => (
                <CompetitorCard
                  key={competitor.id}
                  competitor={competitor}
                  onEdit={handleEditCompetitor}
                  onDelete={handleDeleteCompetitor}
                />
              ))}
            </div>
            <Button 
              onClick={handleCompetitorsSubmit}
              disabled={competitors.length === 0}
              className="w-full bg-[#30035e] hover:bg-[#30035e]/90"
            >
              Continue
            </Button>
            <CompetitorDialog
              open={competitorDialogOpen}
              onClose={() => setCompetitorDialogOpen(false)}
              onSave={handleSaveCompetitor}
              initialData={editingCompetitor}
            />
          </div>
        )}

        {step === 'icps' && (
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Auto-Generated ICPs</AlertTitle>
              <AlertDescription>
                We've generated Ideal Customer Profiles based on your company and product information.
                You can review and modify them below.
              </AlertDescription>
            </Alert>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {icps.map(icp => (
                <Card key={icp.id} className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Globe2 className="h-4 w-4 text-[#30035e]" />
                      <p className="font-medium text-[#30035e]">{icp.region}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-[#30035e]" />
                      <p className="text-sm text-muted-foreground">{icp.vertical}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-[#30035e]" />
                      <p className="text-sm text-muted-foreground">{icp.companySize}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            <Button 
              onClick={handleGeneratePersonas}
              disabled={icps.length === 0}
              className="w-full bg-[#30035e] hover:bg-[#30035e]/90"
            >
              Continue
            </Button>
          </div>
        )}

        {step === 'personas' && (
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Auto-Generated Personas</AlertTitle>
              <AlertDescription>
                We've generated buyer personas based on your ICPs.
                You can review and modify them below.
              </AlertDescription>
            </Alert>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {personas.map(persona => (
                <Card key={persona.id} className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-[#30035e]" />
                      <p className="font-medium text-[#30035e]">{persona.title}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <CircleDot className="h-4 w-4 text-[#30035e]" />
                      <p className="text-sm text-muted-foreground">{persona.seniority}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-[#30035e]" />
                      <p className="text-sm text-muted-foreground">{persona.department}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            <Button 
              onClick={handleComplete}
              disabled={personas.length === 0}
              className="w-full bg-[#30035e] hover:bg-[#30035e]/90"
            >
              Complete Setup
            </Button>
          </div>
        )}

        {isLoading && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
            <StepLoadingSpinner />
          </div>
        )}
      </div>
    </div>
  )
}

function ProductDialog({ 
  open, 
  onClose, 
  onSave, 
  initialData 
}: { 
  open: boolean; 
  onClose: () => void; 
  onSave: (data: Omit<Product, 'id'>) => void;
  initialData?: Product;
}) {
  const [name, setName] = useState(initialData?.name || '')
  const [description, setDescription] = useState(initialData?.description || '')

  useEffect(() => {
    if (initialData) {
      setName(initialData.name)
      setDescription(initialData.description)
    } else {
      setName('')
      setDescription('')
    }
  }, [initialData])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Product' : 'Add Product'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input 
              id="name" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder="Product name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input 
              id="description" 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              placeholder="Product description"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button 
            onClick={() => onSave({ name, description })}
            disabled={!name || !description}
          >
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function CompetitorCard({ 
  competitor, 
  onEdit, 
  onDelete 
}: { 
  competitor: Competitor; 
  onEdit: (competitor: Competitor) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <Card className="p-4 relative group">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="space-y-1">
            <h3 className="font-medium text-[#30035e]">{competitor.name}</h3>
            <p className="text-sm text-muted-foreground">{competitor.description}</p>
          </div>
          {competitor.mainProducts.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {competitor.mainProducts.map((product, index) => (
                <Badge 
                  key={index} 
                  variant="secondary"
                  className="bg-[#f6efff] text-[#30035e] hover:bg-[#f6efff]/80"
                >
                  {product}
                </Badge>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onEdit(competitor)}
            className="h-8 w-8 p-0"
          >
            <Pencil className="h-4 w-4 text-[#30035e]" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onDelete(competitor.id)}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4 text-[#30035e]" />
          </Button>
        </div>
      </div>
    </Card>
  )
}

function CompetitorDialog({ 
  open, 
  onClose, 
  onSave, 
  initialData 
}: { 
  open: boolean; 
  onClose: () => void; 
  onSave: (data: Omit<Competitor, 'id'>) => void;
  initialData?: Competitor;
}) {
  const [name, setName] = useState(initialData?.name || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [mainProducts, setMainProducts] = useState<string[]>(initialData?.mainProducts || [])
  const [newProduct, setNewProduct] = useState('')

  useEffect(() => {
    if (initialData) {
      setName(initialData.name)
      setDescription(initialData.description)
      setMainProducts(initialData.mainProducts)
    } else {
      setName('')
      setDescription('')
      setMainProducts([])
    }
  }, [initialData])

  const handleAddProduct = () => {
    if (newProduct) {
      setMainProducts([...mainProducts, newProduct])
      setNewProduct('')
    }
  }

  const handleRemoveProduct = (index: number) => {
    setMainProducts(mainProducts.filter((_, i) => i !== index))
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Competitor' : 'Add Competitor'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input 
              id="name" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder="Competitor name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input 
              id="description" 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              placeholder="Competitor description"
            />
          </div>
          <div className="space-y-2">
            <Label>Main Products</Label>
            <div className="flex gap-2">
              <Input 
                value={newProduct} 
                onChange={e => setNewProduct(e.target.value)} 
                placeholder="Add product"
              />
              <Button onClick={handleAddProduct} disabled={!newProduct}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {mainProducts.map((product, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {product}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleRemoveProduct(index)} 
                  />
                </Badge>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <Button 
            onClick={() => onSave({ name, description, mainProducts })}
            disabled={!name || !description || mainProducts.length === 0}
          >
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function ResponseAnalysis({ companyId }: Props) {
  // ... rest of the code ...
} 