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

  // ... rest of the code ...
}

[... rest of the file remains exactly the same ...] 