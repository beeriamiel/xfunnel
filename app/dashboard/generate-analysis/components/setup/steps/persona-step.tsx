'use client'

import { useState, useEffect } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronRight, Plus, UserCircle2, Pencil, X, Loader2, AlertCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import { design } from '../../../lib/design-system'
import type { ICP, Persona } from '../../../types/analysis'
import { useDashboardStore } from '@/app/dashboard/store'
import { createClient } from '@/app/supabase/client'

// Type for ICPs from database that doesn't require the personas field
interface DatabaseICP {
  id: number
  vertical: string
  company_size: string
  region: string
  created_at?: string | null
  icp_batch_id?: string | null
  created_by_batch?: boolean | null
  company_id?: number | null
}

interface PersonaStepProps {
  onAddPersona: (persona: Omit<Persona, 'id'>, icpId: string) => void;
  onEditPersona: (persona: Persona) => void;
  onDeletePersona: (id: number) => void;
  onComplete: () => void;
}

export function PersonaStep({ 
  onAddPersona, 
  onEditPersona, 
  onDeletePersona,
  onComplete 
}: PersonaStepProps) {
  console.log('🔵 PersonaStep Render')

  const supabase = createClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPersona, setEditingPersona] = useState<Persona | null>(null)
  const [selectedICP, setSelectedICP] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingGeneratedData, setIsLoadingGeneratedData] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newPersona, setNewPersona] = useState<Partial<Persona>>({
    title: '',
    seniority_level: '',
    department: ''
  })
  const [hasLoadedInitialData, setHasLoadedInitialData] = useState(false)
  const [icps, setICPs] = useState<DatabaseICP[]>([])
  const [personas, setPersonas] = useState<Persona[]>([])

  const { 
    onboarding: { stepData },
    selectedCompanyId,
    setStepData
  } = useDashboardStore()

  // Load ICPs and personas once when mounted
  useEffect(() => {
    let isMounted = true;

    async function loadGeneratedData() {
      console.log('🟡 PersonaStep loadGeneratedData starting:', {
        selectedCompanyId,
        hasLoadedInitialData,
        currentPersonas: personas.length,
        stepData
      })

      if (!selectedCompanyId || hasLoadedInitialData || personas.length > 0) {
        console.log('🔴 PersonaStep loadGeneratedData skipped:', {
          reason: !selectedCompanyId 
            ? 'no selectedCompanyId' 
            : hasLoadedInitialData 
              ? 'already loaded' 
              : 'personas already exist',
          selectedCompanyId,
          hasLoadedInitialData,
          personasLength: personas.length
        })
        return
      }

      try {
        console.log('🟡 PersonaStep: Starting Supabase queries for company:', selectedCompanyId)
        
        // First fetch ICPs
        const { data: dbICPs, error: icpsError } = await supabase
          .from('ideal_customer_profiles')
          .select('id, vertical, region, company_size')
          .eq('company_id', selectedCompanyId)

        if (icpsError) {
          console.error('🔴 PersonaStep: ICPs query error:', icpsError)
          throw icpsError
        }

        if (dbICPs && isMounted) {
          console.log('🟢 PersonaStep: Fetched ICPs:', dbICPs)
          setICPs(dbICPs)
        }
        
        // Then fetch personas with ICP data
        const { data: dbPersonas, error: personasError } = await supabase
          .from('personas')
          .select(`
            id,
            title,
            seniority_level,
            department,
            icp_id,
            ideal_customer_profiles!inner (
              id,
              company_id,
              vertical,
              region
            )
          `)
          .eq('ideal_customer_profiles.company_id', selectedCompanyId)

        console.log('🟡 PersonaStep: DB query complete:', {
          error: personasError,
          personasCount: dbPersonas?.length,
          rawData: dbPersonas
        })

        if (personasError) {
          console.error('🔴 PersonaStep: Personas query error:', personasError)
          throw personasError
        }

        if (dbPersonas?.length && isMounted) {
          // Map the personas from the database
          const mappedPersonas = dbPersonas.map(persona => ({
            id: persona.id,
            title: persona.title,
            seniority_level: persona.seniority_level,
            department: persona.department,
            icp_id: persona.icp_id
          }))

          console.log('🟢 PersonaStep: Mapped personas:', {
            count: mappedPersonas.length,
            personas: mappedPersonas
          })

          setPersonas(mappedPersonas)

          // Pre-select the ICP of the first persona if it exists
          if (mappedPersonas[0]?.icp_id) {
            console.log('🟢 PersonaStep: Pre-selecting ICP:', mappedPersonas[0].icp_id.toString())
            setSelectedICP(mappedPersonas[0].icp_id.toString())
          }

          // Update the store after adding personas
          if (isMounted) {
            console.log('🟢 PersonaStep: Updating store with hasPersonas')
            setStepData({
              ...stepData,
              hasPersonas: true
            })
          }
        } else {
          console.log('🟡 PersonaStep: No personas found in DB or component unmounted:', {
            dbPersonasLength: dbPersonas?.length,
            isMounted
          })
        }
      } catch (error) {
        console.error('🔴 PersonaStep Error loading data:', error)
        if (isMounted) {
          setError(error instanceof Error ? error.message : 'Failed to load data')
        }
      } finally {
        if (isMounted) {
          setIsLoadingGeneratedData(false)
          setHasLoadedInitialData(true)
          console.log('🟢 PersonaStep loadGeneratedData complete:', {
            isLoadingGeneratedData: false,
            hasLoadedInitialData: true
          })
        }
      }
    }

    loadGeneratedData()

    return () => {
      console.log('🔴 PersonaStep: Cleanup - setting isMounted to false')
      isMounted = false
    }
  }, [selectedCompanyId, setStepData, stepData, hasLoadedInitialData, personas.length])

  // Log state changes
  useEffect(() => {
    console.log('🟡 PersonaStep state changed:', {
      dialogOpen,
      editingPersona,
      selectedICP,
      isSubmitting,
      isLoadingGeneratedData,
      hasLoadedInitialData,
      error,
      newPersona,
      icpsCount: icps.length,
      personasCount: personas.length
    })
  }, [dialogOpen, editingPersona, selectedICP, isSubmitting, isLoadingGeneratedData, hasLoadedInitialData, error, newPersona, icps.length, personas.length])

  const handleAddPersona = async () => {
    if (!newPersona.title || !newPersona.seniority_level || !newPersona.department || !selectedICP) return
    
    setIsSubmitting(true)
    setError(null)
    
    try {
      // First get the account_id from the selected ICP
      const { data: selectedICPData, error: icpError } = await supabase
        .from('ideal_customer_profiles')
        .select('account_id')
        .eq('id', parseInt(selectedICP))
        .single()

      if (icpError) throw icpError
      if (!selectedICPData?.account_id) throw new Error('Could not find account_id for selected ICP')

      // Insert the new persona directly into the database
      const { data: insertedPersona, error: insertError } = await supabase
        .from('personas')
        .insert({
          title: newPersona.title,
          seniority_level: newPersona.seniority_level,
          department: newPersona.department,
          icp_id: parseInt(selectedICP),
          account_id: selectedICPData.account_id
        })
        .select()
        .single()

      if (insertError) throw insertError

      console.log('🟢 PersonaStep: Added new persona:', insertedPersona)
      
      // Add to local state
      setPersonas(prev => [...prev, insertedPersona])
      
      // Reset form
      setNewPersona({ title: '', seniority_level: '', department: '' })
      setDialogOpen(false)
    } catch (err) {
      console.error('🔴 PersonaStep: Error adding persona:', err)
      setError(err instanceof Error ? err.message : 'Failed to add persona')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditPersona = (persona: Persona) => {
    setEditingPersona(persona)
    setNewPersona(persona)
    setDialogOpen(true)
  }

  const handleUpdatePersona = async () => {
    if (!editingPersona || !newPersona.title || !newPersona.seniority_level || !newPersona.department) return
    
    setIsSubmitting(true)
    setError(null)
    
    try {
      // Update the persona in the database
      const { data: updatedPersona, error: updateError } = await supabase
        .from('personas')
        .update({
          title: newPersona.title,
          seniority_level: newPersona.seniority_level,
          department: newPersona.department
        })
        .eq('id', editingPersona.id)
        .select()
        .single()

      if (updateError) throw updateError

      console.log('🟢 PersonaStep: Updated persona:', updatedPersona)
      
      // Update local state
      setPersonas(prev => prev.map(p => p.id === editingPersona.id ? updatedPersona : p))
      
      // Reset form
      setEditingPersona(null)
      setNewPersona({ title: '', seniority_level: '', department: '' })
      setDialogOpen(false)
    } catch (err) {
      console.error('🔴 PersonaStep: Error updating persona:', err)
      setError(err instanceof Error ? err.message : 'Failed to update persona')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeletePersona = async (id: number) => {
    setIsSubmitting(true)
    setError(null)
    
    try {
      // Delete the persona from the database
      const { error: deleteError } = await supabase
        .from('personas')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      console.log('🟢 PersonaStep: Deleted persona:', id)
      
      // Update local state
      setPersonas(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      console.error('🔴 PersonaStep: Error deleting persona:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete persona')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Validation for next step
  const canProceed = personas.length > 0 && stepData.hasPersonas

  if (isLoadingGeneratedData) {
    return (
      <Card className={cn(design.layout.card, design.spacing.card)}>
        <div className="flex flex-col items-center justify-center p-8 space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-[#30035e]" />
          <div className="space-y-2 text-center">
            <h3 className={design.typography.title}>
              Loading Personas
            </h3>
            <p className={design.typography.subtitle}>
              Checking for generated persona data...
            </p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className={cn(design.layout.card, design.spacing.card)}>
      <div className={design.layout.container}>
        <div className={design.layout.header}>
          <div className={design.layout.headerContent}>
            <h3 className={design.typography.title}>Buyer Personas</h3>
            <p className={design.typography.subtitle}>Review generated personas or add your own</p>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className={design.spacing.section}>
          <div className={design.spacing.element}>
            <Label className={design.typography.label}>Select ICP</Label>
            <Select 
              value={selectedICP} 
              onValueChange={setSelectedICP}
            >
              <SelectTrigger className={design.components.input.base}>
                <SelectValue placeholder="Choose an ICP to add personas" />
              </SelectTrigger>
              <SelectContent>
                {icps.map((icp) => (
                  <SelectItem key={icp.id} value={icp.id.toString()}>
                    {icp.vertical} ({icp.region})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <AnimatePresence>
            <div className="min-h-[100px] flex flex-col gap-2">
              {personas
                .filter(persona => selectedICP ? persona.icp_id === parseInt(selectedICP, 10) : false)
                .map((persona) => (
                <motion.div
                  initial={design.animations.listItem.initial}
                  animate={design.animations.listItem.animate}
                  exit={design.animations.listItem.exit}
                  key={persona.id}
                  className={design.components.listItem.base}
                >
                  <div className="flex items-center gap-2">
                    <UserCircle2 className={design.components.listItem.icon} />
                    <div className="flex flex-col">
                      <span className="font-medium">{persona.title}</span>
                      <span className={design.typography.subtitle}>
                        {persona.department} · {persona.seniority_level}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                    <Button
                      variant="ghost"
                      size="icon"
                      className={design.components.button.icon}
                      onClick={() => handleEditPersona(persona)}
                      disabled={isSubmitting}
                    >
                      <Pencil className={design.components.button.iconSize} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(design.components.button.icon, "text-destructive")}
                      onClick={() => handleDeletePersona(persona.id)}
                      disabled={isSubmitting}
                    >
                      <X className={design.components.button.iconSize} />
                    </Button>
                  </div>
                </motion.div>
              ))}
              {!selectedICP && (
                <div className="h-[100px] flex items-center justify-center">
                  <p className={design.typography.subtitle}>Select an ICP to add personas</p>
                </div>
              )}
              {selectedICP && personas.filter(p => p.icp_id === parseInt(selectedICP, 10)).length === 0 && (
                <div className="h-[100px] flex items-center justify-center">
                  <p className={design.typography.subtitle}>Waiting for personas to be generated...</p>
                </div>
              )}
            </div>
          </AnimatePresence>
        </div>

        <div className="flex justify-between items-center pt-2">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                className={design.components.button.outline}
                disabled={!selectedICP || isSubmitting}
              >
                Add Persona <Plus className={cn("ml-2", design.components.button.iconSize)} />
              </Button>
            </DialogTrigger>
            <DialogContent className={design.components.dialog.content}>
              <DialogHeader>
                <DialogTitle>{editingPersona ? 'Edit' : 'Add'} Persona</DialogTitle>
                <DialogDescription>
                  Define your buyer persona. All fields are required.
                </DialogDescription>
              </DialogHeader>
              <div className={design.components.dialog.body}>
                <div className={design.spacing.element}>
                  <Label className={design.typography.label}>Title</Label>
                  <Input
                    placeholder="e.g., Product Manager, CTO"
                    value={newPersona.title}
                    onChange={(e) => setNewPersona({ ...newPersona, title: e.target.value })}
                    className={design.components.input.base}
                  />
                </div>
                <div className={design.spacing.element}>
                  <Label className={design.typography.label}>Department</Label>
                  <Input
                    placeholder="e.g., Engineering, Marketing"
                    value={newPersona.department}
                    onChange={(e) => setNewPersona({ ...newPersona, department: e.target.value })}
                    className={design.components.input.base}
                  />
                </div>
                <div className={design.spacing.element}>
                  <Label className={design.typography.label}>Seniority Level</Label>
                  <Select 
                    value={newPersona.seniority_level} 
                    onValueChange={(value) => setNewPersona({ ...newPersona, seniority_level: value })}
                  >
                    <SelectTrigger className={design.components.input.base}>
                      <SelectValue placeholder="Select seniority level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Junior">Junior</SelectItem>
                      <SelectItem value="Mid-Level">Mid-Level</SelectItem>
                      <SelectItem value="Senior">Senior</SelectItem>
                      <SelectItem value="Lead">Lead</SelectItem>
                      <SelectItem value="Manager">Manager</SelectItem>
                      <SelectItem value="Director">Director</SelectItem>
                      <SelectItem value="VP">VP</SelectItem>
                      <SelectItem value="C-Level">C-Level</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  onClick={editingPersona ? handleUpdatePersona : handleAddPersona}
                  disabled={!newPersona.title || !newPersona.seniority_level || !newPersona.department || isSubmitting}
                  className={design.components.button.primary}
                >
                  {isSubmitting ? 'Saving...' : editingPersona ? 'Update' : 'Add'} Persona
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button
            onClick={onComplete}
            disabled={!canProceed || isSubmitting}
            className={design.components.button.primary}
          >
            Complete <ChevronRight className={cn("ml-2", design.components.button.iconSize)} />
          </Button>
        </div>
      </div>
    </Card>
  )
} 