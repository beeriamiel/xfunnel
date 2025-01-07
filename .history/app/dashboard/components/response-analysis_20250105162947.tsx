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

interface Persona {
  id: number;
  title: string;
  seniority_level: string;
  department: string;
}

interface ICP {
  id: number;
  vertical: string;
  company_size: string;
  region: string;
  personas: Persona[];
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

function QueryDialog({
  query,
  open,
  onOpenChange,
  onSave
}: {
  query?: Query;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (query: Omit<Query, 'id'>) => void;
}): React.JSX.Element {
  const form = useForm<Omit<Query, 'id'>>({
    defaultValues: {
      text: query?.text || '',
      buyerJourneyPhase: query?.buyerJourneyPhase || 'problem_exploration'
    }
  })

  const handleSubmit = (values: Omit<Query, 'id'>) => {
    onSave(values)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{query ? 'Edit Query' : 'Add Query'}</DialogTitle>
          <DialogDescription>
            {query ? 'Edit the query details below.' : 'Add a new query for this ICP/Persona combination.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem>
                  <Label>Query Text</Label>
                  <Input {...field} placeholder="Enter your query" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="buyerJourneyPhase"
              render={({ field }) => (
                <FormItem>
                  <Label>Buyer Journey Phase</Label>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a phase" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="problem_exploration">Problem Exploration</SelectItem>
                      <SelectItem value="solution_comparison">Solution Comparison</SelectItem>
                      <SelectItem value="solution_evaluation">Solution Evaluation</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
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
}): React.JSX.Element {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedQuery, setSelectedQuery] = useState<Query | undefined>()

  const handleEdit = (query: Query) => {
    setSelectedQuery(query)
    setDialogOpen(true)
  }

  const handleAdd = () => {
    setSelectedQuery(undefined)
    setDialogOpen(true)
  }

  const handleSave = (query: Omit<Query, 'id'>) => {
    if (selectedQuery) {
      onEditQuery(selectedQuery.id, query)
    } else {
      onAddQuery(query)
    }
  }

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
              onClick={() => handleEdit(query)}
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
        onClick={handleAdd}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Query
      </Button>
      <QueryDialog
        query={selectedQuery}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSave}
      />
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
}): React.JSX.Element {
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [combinations, setCombinations] = useState<ICPPersonaCombination[]>([])
  const [expandedRows, setExpandedRows] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState<{ [key: string]: boolean }>({})
  const [isRunningAnalysis, setIsRunningAnalysis] = useState<{ [key: string]: boolean }>({})

  // Generate combinations of ICPs and Personas
  useEffect(() => {
    const newCombinations: ICPPersonaCombination[] = []
    icps.forEach(icp => {
      personas.forEach(persona => {
        newCombinations.push({
          id: `${icp.id}-${persona.id}`,
          region: icp.region,
          vertical: icp.vertical,
          companySize: icp.company_size,
          title: persona.title,
          seniority: persona.seniority_level,
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
    setIsGenerating(prev => ({ ...prev, [combinationId]: true }))
    try {
      await onGenerateQuestions([combinationId])
      // Mock query generation for now
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
    } catch (error) {
      console.error('Failed to generate queries:', error)
    } finally {
      setIsGenerating(prev => ({ ...prev, [combinationId]: false }))
    }
  }

  const handleRunAnalysis = async (combinationId: string) => {
    setIsRunningAnalysis(prev => ({ ...prev, [combinationId]: true }))
    try {
      await onGenerateResponses([combinationId])
      setCombinations(prev =>
        prev.map(c =>
          c.id === combinationId
            ? { ...c, analysisStatus: 'completed', lastUpdated: new Date().toISOString() }
            : c
        )
      )
    } catch (error) {
      console.error('Failed to run analysis:', error)
    } finally {
      setIsRunningAnalysis(prev => ({ ...prev, [combinationId]: false }))
    }
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
              ) || []
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
              queries: c.queries?.filter(q => q.id !== queryId) || []
            }
          : c
      )
    )
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Region</TableHead>
            <TableHead>Vertical</TableHead>
            <TableHead>Company Size</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Seniority</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {combinations.map((combination) => (
            <React.Fragment key={combination.id}>
              <TableRow>
                <TableCell>{combination.region}</TableCell>
                <TableCell>{combination.vertical}</TableCell>
                <TableCell>{combination.companySize}</TableCell>
                <TableCell>{combination.title}</TableCell>
                <TableCell>{combination.seniority}</TableCell>
                <TableCell>{combination.department}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleGenerateQueriesForRow(combination.id)}
                      disabled={isGenerating[combination.id]}
                    >
                      {isGenerating[combination.id] ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Plus className="h-4 w-4 mr-2" />
                      )}
                      Generate Queries
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRunAnalysis(combination.id)}
                      disabled={isRunningAnalysis[combination.id] || !combination.queries?.length}
                    >
                      {isRunningAnalysis[combination.id] ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <MessageSquare className="h-4 w-4 mr-2" />
                      )}
                      Run Full Analysis (500 points)
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpanded(combination.id)}
                    >
                      {expandedRows.includes(combination.id) ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
              {expandedRows.includes(combination.id) && (
                <TableRow>
                  <TableCell colSpan={7}>
                    <div className="p-4 bg-muted/50 rounded-md">
                      <QueryList
                        queries={combination.queries}
                        onAddQuery={(query) => handleAddQuery(combination.id, query)}
                        onEditQuery={(queryId, query) => handleEditQuery(combination.id, queryId, query)}
                        onDeleteQuery={(queryId) => handleDeleteQuery(combination.id, queryId)}
                      />
                      {combination.analysisStatus === 'completed' && (
                        <div className="mt-4">
                          <Badge variant="outline" className="mb-2">
                            Last Updated: {new Date(combination.lastUpdated!).toLocaleString()}
                          </Badge>
                          <Alert>
                            <AlertTitle>Analysis Complete</AlertTitle>
                            <AlertDescription>
                              The full analysis has been completed for this ICP/Persona combination.
                            </AlertDescription>
                          </Alert>
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
} 