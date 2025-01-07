'use client'

import { type ReactNode } from 'react'
import { useState, useRef, useEffect, Fragment } from 'react'
import type { ChangeEvent, KeyboardEvent } from 'react'
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

// Utility functions
function formatLastRun(date: string | null): string {
  if (!date) return 'Never'
  return new Date(date).toLocaleString()
}

function generateMockQueries(vertical: string, title: string): Array<{id: string; text: string}> {
  return [
    {
      id: crypto.randomUUID(),
      text: `What are the key challenges in ${vertical} for ${title}s?`
    },
    {
      id: crypto.randomUUID(),
      text: `How does ${title} evaluate new solutions in ${vertical}?`
    },
    {
      id: crypto.randomUUID(),
      text: `What are the main pain points for ${title}s?`
    }
  ]
}

[... rest of the file remains exactly the same ...] 