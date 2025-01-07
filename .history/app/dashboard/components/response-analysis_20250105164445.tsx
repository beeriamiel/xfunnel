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

interface QueryListProps {
  queries: Query[];
  onAddQuery: () => void;
  onEditQuery: (query: Query) => void;
  onDeleteQuery: (id: string) => void;
}

function QueryList({ 
  queries,
  onAddQuery,
  onEditQuery,
  onDeleteQuery 
}: QueryListProps) {
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

interface ResponseTableProps {
  icps: ICP[];
  personas: Persona[];
}

function ResponseTable({ 
  icps, 
  personas
}: ResponseTableProps) {
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [combinations, setCombinations] = useState<ICPPersonaCombination[]>([])
  const [dialogOpen, setDialogOpen] = useState({
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
    const combination = combinations.find(c => c.id === combinationId)
    if (!combination) return

    // Mock query generation
    const mockQueries: Query[] = [
      {
        id: crypto.randomUUID(),
        text: `What are the key challenges in ${combination.vertical}?`,
        status: 'complete',
        createdAt: new Date()
      },
      {
        id: crypto.randomUUID(),
        text: `How do you evaluate new solutions in your role?`,
        status: 'complete',
        createdAt: new Date()
      },
      {
        id: crypto.randomUUID(),
        text: `What are your main pain points in ${combination.companySize} companies?`,
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

interface CompanySetupProps {
  onComplete: (completedICPs: ICP[], completedPersonas: Persona[]) => void;
}

function CompanySetup({ onComplete }: CompanySetupProps): JSX.Element {
  // ... rest of the CompanySetup implementation ...
  return <div>Implementation needed</div>
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