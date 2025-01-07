'use client'

import React, { useState, useEffect } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Loader2, ChevronDown, ChevronRight } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { QuerySection } from './query-section'
import { generateMockQueries } from '../../utils/mock-suggestions'
import type { ICP, Persona, ICPPersonaCombination } from '../../types/analysis'
import { motion, AnimatePresence } from "framer-motion"

interface ResponseTableProps {
  icps: ICP[];
  onGenerateQuestions: (selectedIds: string[]) => void;
  onGenerateResponses: (selectedIds: string[]) => void;
}

export function ResponseTable({ 
  icps, 
  onGenerateQuestions,
  onGenerateResponses 
}: ResponseTableProps) {
  const [combinations, setCombinations] = useState<ICPPersonaCombination[]>([])
  const [newQuery, setNewQuery] = useState("")
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState<string | null>(null)

  useEffect(() => {
    console.log('Received ICPs:', icps)
    
    const newCombinations: ICPPersonaCombination[] = []
    icps.forEach(icp => {
      console.log('Processing ICP:', { 
        id: icp?.id, 
        hasPersonas: Array.isArray(icp?.personas),
        personasLength: icp?.personas?.length
      })
      
      if (!icp?.id || !Array.isArray(icp.personas)) {
        console.log('Skipping ICP - Invalid ID or personas:', { 
          hasId: !!icp?.id, 
          isPersonasArray: Array.isArray(icp?.personas) 
        })
        return
      }
      
      icp.personas.forEach(persona => {
        console.log('Processing Persona:', { 
          icpId: icp.id, 
          personaId: persona?.id,
          title: persona?.title
        })
        
        if (!persona?.id) {
          console.log('Skipping Persona - No ID:', persona)
          return
        }
        
        const icpIdStr = String(icp.id).trim()
        const personaIdStr = String(persona.id).trim()
        
        if (!icpIdStr || !personaIdStr || 
            icpIdStr === 'undefined' || personaIdStr === 'undefined') {
          console.log('Skipping combination - Invalid ID strings:', { icpIdStr, personaIdStr })
          return
        }
        
        const combinationId = `${icpIdStr}-${personaIdStr}`
        console.log('Creating combination with ID:', combinationId)
        
        newCombinations.push({
          id: combinationId,
          region: icp.region || '',
          vertical: icp.vertical || '',
          company_size: icp.company_size || '',
          title: persona.title || '',
          seniority_level: persona.seniority_level || '',
          department: persona.department || '',
          lastUpdated: null,
          queries: [],
          isGeneratingQueries: false,
          isExpanded: false,
          lastAnalysisRun: null,
          isAnalyzing: false,
          hasAnalysis: false,
          analysisStartTime: null,
          analysisHistory: []
        })
      })
    })
    
    console.log('Created combinations:', newCombinations)
    setCombinations(newCombinations)
  }, [icps])

  const handleGenerateQueries = async (combination: ICPPersonaCombination) => {
    console.log('handleGenerateQueries called with combination:', combination)
    
    if (!combination?.id || !combination.id.includes('-')) {
      console.log('Invalid combination ID:', combination?.id)
      return
    }
    
    setIsGenerating(combination.id)
    console.log('Set isGenerating to:', combination.id)
    
    const [icpId, personaId] = combination.id.split('-')
    console.log('Split IDs:', { icpId, personaId })
    
    if (!icpId || !personaId) {
      console.log('Missing ICP or Persona ID')
      setIsGenerating(null)
      return
    }
    
    const icp = icps.find(i => String(i.id) === icpId)
    const persona = icp?.personas?.find(p => String(p.id) === personaId)
    console.log('Found ICP and Persona:', { icp, persona })
    
    if (icp && persona) {
      console.log('Generating mock queries for:', { icp, persona })
      const queries = await generateMockQueries(icp, persona)
      console.log('Generated queries:', queries)
      
      setCombinations(prev => prev.map(c => 
        c.id === combination.id 
          ? { ...c, queries, isExpanded: true }
          : c
      ))
      setExpandedId(combination.id)
    } else {
      console.log('Failed to find ICP or Persona')
    }
    
    setIsGenerating(null)
  }

  const handleAddQuery = (combinationId: string, text: string) => {
    if (!text.trim()) return

    const [icpId, personaId] = combinationId.split('-')
    const icp = icps.find(i => String(i.id) === icpId)
    const matchedPersona = icp?.personas.find(p => String(p.id) === personaId)

    if (!icp || !matchedPersona) return

    setCombinations(prev => prev.map(c => 
      c.id === combinationId 
        ? { 
            ...c, 
            queries: [...c.queries, { 
              id: crypto.randomUUID(), 
              text: text.trim(),
              icp,
              persona: matchedPersona,
              status: 'pending'
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
            hasAnalysis: false,
            analysisStartTime: new Date().toISOString(),
            queries: c.queries.map(q => ({ ...q, status: 'pending' }))
          }
        : c
    ))

    try {
      await onGenerateResponses([combination.id])
      
      const now = new Date().toISOString()
      setCombinations(prev => prev.map(c => 
        c.id === combination.id 
          ? { 
              ...c, 
              isAnalyzing: false,
              hasAnalysis: true,
              lastAnalysisRun: now,
              analysisStartTime: null,
              queries: c.queries.map(q => ({ ...q, status: 'completed' })),
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
    } catch (error) {
      setCombinations(prev => prev.map(c => 
        c.id === combination.id 
          ? { 
              ...c, 
              isAnalyzing: false,
              analysisStartTime: null,
              analysisHistory: [
                ...(c.analysisHistory || []),
                {
                  runDate: new Date().toISOString(),
                  status: 'failed'
                }
              ]
            }
          : c
      ))
    }
  }

  const getAnalysisStatus = (combination: ICPPersonaCombination): string => {
    if (!combination.analysisStartTime) return ""
    
    const startTime = new Date(combination.analysisStartTime)
    const now = new Date()
    const minutesElapsed = Math.floor((now.getTime() - startTime.getTime()) / 60000)
    const minutesRemaining = Math.max(60 - minutesElapsed, 0)
    
    return `~${minutesRemaining} minutes remaining`
  }

  const formatLastRun = (date: string | null): string => {
    if (!date) return "Never"
    const now = new Date()
    const lastRun = new Date(date)
    const diff = now.getTime() - lastRun.getTime()
    const minutes = Math.floor(diff / 60000)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
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
                <TableRow className={`group ${combination.isAnalyzing ? 'bg-[#f6efff]/30' : ''}`}>
                  <TableCell>{combination.region}</TableCell>
                  <TableCell>{combination.vertical}</TableCell>
                  <TableCell>{combination.company_size}</TableCell>
                  <TableCell>{combination.title}</TableCell>
                  <TableCell>{combination.seniority_level}</TableCell>
                  <TableCell>{combination.department}</TableCell>
                  <TableCell className="text-right">
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <span className={`text-sm cursor-help ${
                          !combination.lastAnalysisRun 
                            ? "text-muted-foreground" 
                            : "text-[#30035e]"
                        }`}>
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
                                  <span className={`w-2 h-2 rounded-full ${
                                    run.status === 'completed' ? "bg-green-500" : "bg-red-500"
                                  }`} />
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
                          onClick={() => setExpandedId(expandedId === combination.id ? null : combination.id)}
                          className={`text-[#30035e] hover:text-[#30035e]/90 transition-colors ${
                            expandedId === combination.id && "bg-[#f6efff]"
                          }`}
                        >
                          {expandedId === combination.id ? <ChevronDown className="h-4 w-4 mr-2" /> : <ChevronRight className="h-4 w-4 mr-2" />}
                          {combination.queries.length} Queries
                        </Button>
                        <Button
                          size="sm"
                          variant={combination.isAnalyzing ? "secondary" : "outline"}
                          onClick={() => handleRunAnalysis(combination)}
                          disabled={combination.isAnalyzing}
                          className={`relative border-[#30035e] text-[#30035e] font-medium transition-all
                            ${combination.isAnalyzing ? 'bg-[#f6efff] hover:bg-[#f6efff]' : 'hover:bg-[#30035e]/10'}`}
                        >
                          {combination.isAnalyzing ? (
                            <>
                              <div className="absolute inset-0 overflow-hidden">
                                <div className="animate-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full" />
                              </div>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              <div className="flex flex-col items-start text-left">
                                <span>Running Analysis...</span>
                                <span className="text-xs text-muted-foreground">
                                  {getAnalysisStatus(combination)}
                                </span>
                              </div>
                            </>
                          ) : (
                            <>
                              {combination.hasAnalysis ? 'Re-run Analysis' : 'Run Analysis'} (500 credits)
                              <span className="text-xs text-muted-foreground ml-1">~1 hour</span>
                            </>
                          )}
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        className="bg-[#30035e] hover:bg-[#30035e]/90"
                        onClick={() => handleGenerateQueries(combination)}
                        disabled={isGenerating === combination.id}
                      >
                        {isGenerating === combination.id ? (
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
                <AnimatePresence mode="sync">
                  {expandedId === combination.id && (
                    <motion.tr
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ 
                        opacity: 1, 
                        height: "auto",
                        transition: { duration: 0.3, ease: "easeOut" }
                      }}
                      exit={{ 
                        opacity: 0, 
                        height: 0,
                        transition: { duration: 0.2, ease: "easeIn" }
                      }}
                    >
                      <td colSpan={8} className="p-0 border-0">
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2, delay: 0.1 }}
                          className={`transition-opacity duration-200 ${combination.isAnalyzing ? 'opacity-50' : ''}`}
                        >
                          <QuerySection
                            queries={combination.queries}
                            onAddQuery={(text) => handleAddQuery(combination.id, text)}
                            newQuery={newQuery}
                            onNewQueryChange={(e) => setNewQuery(e.target.value)}
                          />
                        </motion.div>
                      </td>
                    </motion.tr>
                  )}
                </AnimatePresence>
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