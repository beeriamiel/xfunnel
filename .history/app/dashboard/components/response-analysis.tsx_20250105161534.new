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
import { QuestionDialog } from "./question-dialog"
import { Question, QuestionFormData, ICPPersonaCombination } from "./types"

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

// Mock questions based on role and industry
function generateMockQuestions(combination: Omit<ICPPersonaCombination, 'questions' | 'responseCount'>): Question[] {
  const questions: Question[] = []
  
  // Technical roles
  if (combination.department === 'Engineering' || combination.department === 'Technology') {
    questions.push(
      {
        id: crypto.randomUUID(),
        text: `What are your main technical challenges in implementing ${combination.vertical} solutions?`,
        status: 'pending',
        createdAt: new Date().toISOString(),
        combinationId: combination.id
      },
      {
        id: crypto.randomUUID(),
        text: `How do you evaluate new technology vendors for your ${combination.vertical} stack?`,
        status: 'pending',
        createdAt: new Date().toISOString(),
        combinationId: combination.id
      }
    )
  }
  
  // Finance roles
  if (combination.department === 'Finance') {
    questions.push(
      {
        id: crypto.randomUUID(),
        text: `What ROI metrics are most important for ${combination.vertical} investments?`,
        status: 'pending',
        createdAt: new Date().toISOString(),
        combinationId: combination.id
      },
      {
        id: crypto.randomUUID(),
        text: `How do you measure the financial impact of ${combination.vertical} solutions?`,
        status: 'pending',
        createdAt: new Date().toISOString(),
        combinationId: combination.id
      }
    )
  }
  
  // Product roles
  if (combination.department === 'Product') {
    questions.push(
      {
        id: crypto.randomUUID(),
        text: `What are your key product requirements for ${combination.vertical} solutions?`,
        status: 'pending',
        createdAt: new Date().toISOString(),
        combinationId: combination.id
      },
      {
        id: crypto.randomUUID(),
        text: `How do you prioritize feature requests in your ${combination.vertical} roadmap?`,
        status: 'pending',
        createdAt: new Date().toISOString(),
        combinationId: combination.id
      }
    )
  }

  // Generic questions for all roles
  questions.push(
    {
      id: crypto.randomUUID(),
      text: `What are your main challenges in ${combination.vertical} for ${combination.companySize} companies?`,
      status: 'pending',
      createdAt: new Date().toISOString(),
      combinationId: combination.id
    }
  )

  return questions
}

function QuestionList({ 
  questions,
  onAddQuestion,
  onEditQuestion,
  onDeleteQuestion 
}: { 
  questions: Question[];
  onAddQuestion: (combinationId: string) => void;
  onEditQuestion: (question: Question) => void;
  onDeleteQuestion: (questionId: string) => void;
}) {
  return (
    <div className="space-y-3 p-4 bg-[#f6efff]/50">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-[#30035e]">Questions</h4>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-[#30035e] hover:text-[#30035e]/90"
          onClick={() => onAddQuestion(questions[0]?.combinationId)}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Question
        </Button>
      </div>
      <div className="space-y-2">
        {questions.map((question) => (
          <div
            key={question.id}
            className="flex items-start justify-between group rounded-md p-2 hover:bg-white/50"
          >
            <div className="flex items-start gap-2 flex-1">
              <div className="mt-1">
                <Badge
                  variant={question.status === 'analyzed' ? 'default' : 'secondary'}
                  className={cn(
                    "h-5",
                    question.status === 'analyzed' 
                      ? "bg-[#30035e] hover:bg-[#30035e]/90" 
                      : "bg-muted hover:bg-muted/90"
                  )}
                >
                  {question.status === 'analyzed' ? 'Analyzed' : 'Pending'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground flex-1">{question.text}</p>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => onEditQuestion(question)}
              >
                <Pencil className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive"
                onClick={() => onDeleteQuestion(question.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
        {questions.length === 0 && (
          <div className="text-center py-4 text-sm text-muted-foreground">
            No questions yet. Click "Generate Questions" or add them manually.
          </div>
        )}
      </div>
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
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [combinations, setCombinations] = useState<ICPPersonaCombination[]>([])
  const [expandedRows, setExpandedRows] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [activeCombinationId, setActiveCombinationId] = useState<string | null>(null)

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
          questions: [],
          responseCount: 0,
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

  const toggleExpand = (id: string) => {
    setExpandedRows(prev =>
      prev.includes(id)
        ? prev.filter(rowId => rowId !== id)
        : [...prev, id]
    )
  }

  const toggleAll = () => {
    setSelectedRows(prev => 
      prev.length === combinations.length 
        ? [] 
        : combinations.map(c => c.id)
    )
  }

  const handleGenerateQuestionsClick = async () => {
    setIsGenerating(true)
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Generate questions for selected combinations
    const updatedCombinations = combinations.map(combination => {
      if (selectedRows.includes(combination.id)) {
        return {
          ...combination,
          questions: generateMockQuestions(combination),
          lastUpdated: new Date().toISOString()
        }
      }
      return combination
    })
    
    setCombinations(updatedCombinations)
    setIsGenerating(false)
    
    // Expand the rows that were just generated
    setExpandedRows(prev => {
      const uniqueRows = new Set(prev)
      selectedRows.forEach(id => uniqueRows.add(id))
      return Array.from(uniqueRows)
    })
  }

  const handleAddQuestion = (combinationId: string) => {
    setActiveCombinationId(combinationId)
    setEditingQuestion(null)
    setDialogOpen(true)
  }

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question)
    setActiveCombinationId(question.combinationId)
    setDialogOpen(true)
  }

  const handleDeleteQuestion = (questionId: string) => {
    setCombinations(combinations.map(combination => ({
      ...combination,
      questions: combination.questions.filter(q => q.id !== questionId)
    })))
  }

  const handleSaveQuestion = (data: QuestionFormData, questionId?: string) => {
    if (!activeCombinationId) return

    setCombinations(combinations.map(combination => {
      if (combination.id === activeCombinationId) {
        if (questionId) {
          // Editing existing question
          return {
            ...combination,
            questions: combination.questions.map(q => 
              q.id === questionId 
                ? {
                    ...q,
                    text: data.text,
                    status: 'pending'
                  }
                : q
            ),
            lastUpdated: new Date().toISOString()
          }
        } else {
          // Adding new question
          return {
            ...combination,
            questions: [
              ...combination.questions,
              {
                id: crypto.randomUUID(),
                text: data.text,
                status: 'pending',
                createdAt: new Date().toISOString(),
                combinationId: activeCombinationId
              }
            ],
            lastUpdated: new Date().toISOString()
          }
        }
      }
      return combination
    }))

    setActiveCombinationId(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-[#30035e]">ICPs and Personas</h3>
        <div className="flex gap-2">
          <Button
            onClick={handleGenerateQuestionsClick}
            disabled={selectedRows.length === 0 || isGenerating}
            className="bg-[#30035e] hover:bg-[#30035e]/90"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>Generate Questions</>
            )}
          </Button>
          <Button
            onClick={() => onGenerateResponses(selectedRows)}
            disabled={selectedRows.length === 0}
            variant="outline"
            className="border-[#30035e] text-[#30035e] hover:bg-[#30035e]/10"
          >
            Generate New Responses
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox 
                  checked={selectedRows.length === combinations.length && combinations.length > 0}
                  onCheckedChange={toggleAll}
                />
              </TableHead>
              <TableHead>Region</TableHead>
              <TableHead>Vertical</TableHead>
              <TableHead>Company Size</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Seniority</TableHead>
              <TableHead>Department</TableHead>
              <TableHead className="text-right">Questions</TableHead>
              <TableHead className="text-right">Responses</TableHead>
              <TableHead className="text-right">Last Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {combinations.map((combination) => (
              <>
                <TableRow 
                  key={combination.id}
                  className="cursor-pointer"
                  onClick={() => toggleExpand(combination.id)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
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
                  <TableCell className="text-right">{combination.questions.length}</TableCell>
                  <TableCell className="text-right">{combination.responseCount}</TableCell>
                  <TableCell className="text-right">
                    {combination.lastUpdated ? new Date(combination.lastUpdated).toLocaleDateString() : 'Never'}
                  </TableCell>
                </TableRow>
                {expandedRows.includes(combination.id) && (
                  <TableRow>
                    <TableCell colSpan={10} className="p-0">
                      <QuestionList
                        questions={combination.questions}
                        onAddQuestion={handleAddQuestion}
                        onEditQuestion={handleEditQuestion}
                        onDeleteQuestion={handleDeleteQuestion}
                      />
                    </TableCell>
                  </TableRow>
                )}
              </>
            ))}
            {combinations.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-6 text-muted-foreground">
                  No combinations available. Add ICPs and Personas to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <QuestionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        question={editingQuestion || undefined}
        combinationId={activeCombinationId || ''}
        onSave={handleSaveQuestion}
      />
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

  const handleGenerateQuestions = (selectedIds: string[]) => {
    // TODO: Implement question generation
    console.log('Generating questions for:', selectedIds)
  }

  const handleGenerateResponses = (selectedIds: string[]) => {
    // TODO: Implement response generation
    console.log('Generating responses for:', selectedIds)
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
                    icps={icps}
                    personas={personas}
                    onGenerateQuestions={handleGenerateQuestions}
                    onGenerateResponses={handleGenerateResponses}
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