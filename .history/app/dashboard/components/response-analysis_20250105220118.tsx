'use client'

import { useState, useRef, useEffect, Fragment } from "react"
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
  companyId: number;
}

export function ResponseAnalysis({ companyId }: Props) {
  const selectedCompanyId = useDashboardStore(state => state.selectedCompanyId)
  const { hasCompletedOnboarding, setHasCompletedOnboarding, companyProfile, setCompanyProfile } = useDashboardStore()
  const [icps, setICPs] = useState<ICP[]>([])
  const [personas, setPersonas] = useState<Persona[]>([])
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false)
  const [showSuccessAnimation, setShowSuccessAnimation] = useState<boolean>(false)
  const effectiveCompanyId = companyId ?? selectedCompanyId

  // ... rest of the component code ...
}