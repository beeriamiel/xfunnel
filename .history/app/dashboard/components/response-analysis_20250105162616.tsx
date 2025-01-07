'use client'

import * as React from "react"
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

interface Query {
  id: string;
  text: string;
  buyerJourneyPhase: string;
}

interface ICPPersonaCombination {
  id: string;
  region: string;
  vertical: string;
  companySize: string;
  title: string;
  seniority: string;
  department: string;
  queries: Query[] | null;
  analysisStatus: 'not_started' | 'queued' | 'in_progress' | 'completed';
  lastUpdated: string | null;
}

function QueryList({ 
  queries,
  onAddQuery,
  onEditQuery,
  onDeleteQuery 
}: { 
  queries: Query[] | null;
  onAddQuery: (query: Omit<Query, 'id'>) => void;
  onEditQuery: (id: string, query: Partial<Query>) => void;
  onDeleteQuery: (id: string) => void;
}) {
  return (
    <div className="space-y-2 py-2">
      {queries?.map((query) => (
        <div key={query.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{query.buyerJourneyPhase}</Badge>
            <span className="text-sm">{query.text}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditQuery(query.id, query)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDeleteQuery(query.id)}
              className="text-destructive hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onAddQuery({ text: '', buyerJourneyPhase: 'problem_exploration' })}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Query
      </Button>
    </div>
  );
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
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [combinations, setCombinations] = useState<ICPPersonaCombination[]>([])
  const [expandedRows, setExpandedRows] = useState<string[]>([])

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
          queries: null,
          analysisStatus: 'not_started',
          lastUpdated: null
        })
      })
    })
    setCombinations(newCombinations)
  }, [icps, personas])

  const toggleRow = (id: string) => {
    setSelectedRows(prev => 
      prev.includes(id) 
        ? prev.filter(rowId => rowId !== id)
        : [...prev, id]
    )
  }

  const toggleExpanded = (id: string) => {
    setExpandedRows(prev =>
      prev.includes(id)
        ? prev.filter(rowId => rowId !== id)
        : [...prev, id]
    )
  }

  const handleGenerateQueriesForRow = async (combinationId: string) => {
    // Mock query generation
    const mockQueries: Query[] = [
      {
        id: crypto.randomUUID(),
        text: 'What are the key challenges in implementing this solution?',
        buyerJourneyPhase: 'problem_exploration'
      },
      {
        id: crypto.randomUUID(),
        text: 'How does this compare to existing solutions?',
        buyerJourneyPhase: 'solution_comparison'
      }
    ]

    setCombinations(prev =>
      prev.map(c =>
        c.id === combinationId
          ? { ...c, queries: mockQueries }
          : c
      )
    )
  }

  const handleAddQuery = (combinationId: string, query: Omit<Query, 'id'>) => {
    setCombinations(prev =>
      prev.map(c =>
        c.id === combinationId
          ? {
              ...c,
              queries: [
                ...(c.queries || []),
                { ...query, id: crypto.randomUUID() }
              ]
            }
          : c
      )
    )
  }

  const handleEditQuery = (combinationId: string, queryId: string, query: Partial<Query>) => {
    setCombinations(prev =>
      prev.map(c =>
        c.id === combinationId
          ? {
              ...c,
              queries: c.queries?.map(q =>
                q.id === queryId
                  ? { ...q, ...query }
                  : q
              ) || null
            }
          : c
      )
    )
  }

  const handleDeleteQuery = (combinationId: string, queryId: string) => {
    setCombinations(prev =>
      prev.map(c =>
        c.id === combinationId
          ? {
              ...c,
              queries: c.queries?.filter(q => q.id !== queryId) || null
            }
          : c
      )
    )
  }

  const handleRunAnalysis = (combinationId: string) => {
    setCombinations(prev =>
      prev.map(c =>
        c.id === combinationId
          ? { ...c, analysisStatus: 'queued' }
          : c
      )
    )
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
              <TableHead>Queries</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {combinations.map((combination) => (
              <React.Fragment key={combination.id}>
                <TableRow>
                  <TableCell>
                    <Checkbox 
                      checked={selectedRows.includes(combination.id)}
                      onCheckedChange={() => toggleRow(combination.id)}
                    />
                  </TableCell>
                  <TableCell>{combination.region}</TableCell>
                  <TableCell>{combination.vertical}</TableCell>
                  <TableCell>{combination.companySize}</TableCell>
                  <TableCell>{combination.title}</TableCell>
                  <TableCell>{combination.seniority}</TableCell>
                  <TableCell>{combination.department}</TableCell>
                  <TableCell>
                    {combination.queries ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpanded(combination.id)}
                      >
                        View Queries ({combination.queries.length})
                        {expandedRows.includes(combination.id) ? (
                          <ChevronUp className="ml-2 h-4 w-4" />
                        ) : (
                          <ChevronDown className="ml-2 h-4 w-4" />
                        )}
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleGenerateQueriesForRow(combination.id)}
                      >
                        Generate Queries
                      </Button>
                    )}
                  </TableCell>
                  <TableCell>
                    {combination.queries && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleRunAnalysis(combination.id)}
                        disabled={combination.analysisStatus !== 'not_started'}
                      >
                        {combination.analysisStatus === 'not_started' && 'Run Analysis (500 points)'}
                        {combination.analysisStatus === 'queued' && 'Queued...'}
                        {combination.analysisStatus === 'in_progress' && 'Running...'}
                        {combination.analysisStatus === 'completed' && 'Completed'}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
                {expandedRows.includes(combination.id) && (
                  <TableRow>
                    <TableCell colSpan={9} className="bg-muted/5">
                      <QueryList
                        queries={combination.queries}
                        onAddQuery={(query) => handleAddQuery(combination.id, query)}
                        onEditQuery={(queryId, query) => handleEditQuery(combination.id, queryId, query)}
                        onDeleteQuery={(queryId) => handleDeleteQuery(combination.id, queryId)}
                      />
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
            {combinations.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-6 text-muted-foreground">
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