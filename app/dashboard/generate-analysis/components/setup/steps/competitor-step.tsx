'use client'

import { useState, useEffect } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronRight, Plus, Building2, X, Loader2, AlertCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import { design } from '../../../lib/design-system'
import type { Competitor } from '../../../types/analysis'
import { useDashboardStore } from '@/app/dashboard/store'
import { createClient } from '@/app/supabase/client'

interface CompetitorStepProps {
  companyName: string;
  products: Array<{ id: string; name: string }>;
  competitors: Array<{ id: string; name: string }>;
  onAddCompetitor: (competitor: { id: string; name: string }) => void;
  onEditCompetitor: (competitor: { id: string; name: string }) => void;
  onDeleteCompetitor: (id: string) => void;
  onNext: () => void;
  accountId: string;
}

export function CompetitorStep({ 
  companyName,
  products,
  competitors, 
  onAddCompetitor, 
  onEditCompetitor, 
  onDeleteCompetitor,
  onNext,
  accountId
}: CompetitorStepProps) {
  console.log('🔵 CompetitorStep Render:', {
    companyName,
    productsCount: products.length,
    competitorsCount: competitors.length,
    competitors: competitors.map(c => ({ id: c.id, name: c.name }))
  })

  const supabase = createClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingGeneratedData, setIsLoadingGeneratedData] = useState(true)
  const [hasLoadedInitialData, setHasLoadedInitialData] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newCompetitor, setNewCompetitor] = useState<{ name: string }>({
    name: ''
  })

  // Log competitors prop changes
  useEffect(() => {
    console.log('🟡 CompetitorStep competitors prop changed:', competitors)
  }, [competitors])

  // Log state changes
  useEffect(() => {
    console.log('🟡 CompetitorStep state changed:', {
      dialogOpen,
      isSubmitting,
      isLoadingGeneratedData,
      hasLoadedInitialData,
      error,
      newCompetitor
    })
  }, [dialogOpen, isSubmitting, isLoadingGeneratedData, hasLoadedInitialData, error, newCompetitor])

  const { 
    onboarding: { stepData },
    selectedCompanyId,
    setStepData
  } = useDashboardStore()

  // Load generated data once when mounted
  useEffect(() => {
    let isMounted = true;

    async function loadGeneratedData() {
      console.log('🟡 CompetitorStep loadGeneratedData starting:', {
        selectedCompanyId,
        hasLoadedInitialData,
        currentCompetitors: competitors.length
      })

      if (!selectedCompanyId || hasLoadedInitialData || competitors.length > 0) {
        console.log('🔴 CompetitorStep loadGeneratedData skipped:', {
          reason: !selectedCompanyId 
            ? 'no selectedCompanyId' 
            : hasLoadedInitialData 
              ? 'already loaded' 
              : 'competitors already exist'
        })
        return
      }

      try {
        const { data: dbCompetitors } = await supabase
          .from('competitors')
          .select('id, competitor_name')
          .eq('company_id', selectedCompanyId)

        console.log('🟡 CompetitorStep: DB competitors fetched:', dbCompetitors)

        if (dbCompetitors?.length && isMounted) {
          // Map the competitors from the database
          const mappedCompetitors = dbCompetitors.map(comp => ({
            id: comp.id.toString(),
            name: comp.competitor_name
          }))

          console.log('🟢 CompetitorStep: Adding mapped competitors:', mappedCompetitors)

          // Update the store
          setStepData({
            ...stepData,
            hasCompetitors: true
          })
          
          // Add all competitors from DB to parent state for navigation/summary
          for (const competitor of mappedCompetitors) {
            if (isMounted && !competitors.some(c => c.id === competitor.id)) {
              onAddCompetitor(competitor)
            }
          }
        }
      } catch (error) {
        console.error('🔴 CompetitorStep Error loading competitors:', error)
        if (isMounted) {
          setError(error instanceof Error ? error.message : 'Failed to load competitors')
        }
      } finally {
        if (isMounted) {
          setIsLoadingGeneratedData(false)
          setHasLoadedInitialData(true)
          console.log('🟢 CompetitorStep loadGeneratedData complete')
        }
      }
    }

    loadGeneratedData()

    return () => {
      isMounted = false
    }
  }, [selectedCompanyId, setStepData, stepData, onAddCompetitor, hasLoadedInitialData, competitors])

  const handleAddCompetitor = async () => {
    if (!newCompetitor.name.trim() || !selectedCompanyId) return
    
    setIsSubmitting(true)
    setError(null)
    
    try {
      const normalizedName = newCompetitor.name.trim()
      
      // Check for duplicates in database
      const { data: existingCompetitors } = await supabase
        .from('competitors')
        .select('id')
        .eq('company_id', selectedCompanyId)
        .ilike('competitor_name', normalizedName)
        .limit(1)
      
      if (existingCompetitors?.length) {
        setError('This competitor already exists')
        return
      }

      // Add to DB with account_id
      const { data: newCompetitorData, error: insertError } = await supabase
        .from('competitors')
        .insert({
          company_id: selectedCompanyId,
          competitor_name: normalizedName,
          account_id: accountId
        })
        .select()
        .single()

      if (insertError) throw insertError

      // Call parent handler to update local state with DB ID
      await onAddCompetitor({ 
        id: newCompetitorData.id.toString(),
        name: normalizedName
      })
      
      setNewCompetitor({ name: '' })
      setDialogOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add competitor')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddCompetitor()
    }
  }

  // Validation for next step
  const canProceed = competitors.length > 0 && stepData.hasCompetitors

  if (isLoadingGeneratedData) {
    return (
      <Card className={cn(design.layout.card, design.spacing.card)}>
        <div className="flex flex-col items-center justify-center p-8 space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-[#30035e]" />
          <div className="space-y-2 text-center">
            <h3 className={design.typography.title}>
              Loading Competitors
            </h3>
            <p className={design.typography.subtitle}>
              Checking for generated competitor data...
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
            <h3 className={design.typography.title}>Competitors</h3>
            <p className={design.typography.subtitle}>Review generated competitors or add your own ({competitors.length})</p>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <AnimatePresence>
          <div className="min-h-[100px] flex flex-col gap-2">
            {competitors.map((competitor) => (
              <motion.div
                initial={design.animations.listItem.initial}
                animate={design.animations.listItem.animate}
                exit={design.animations.listItem.exit}
                key={competitor.id}
                className={design.components.listItem.base}
              >
                <div className="flex items-center gap-2">
                  <Building2 className={design.components.listItem.icon} />
                  <span className="font-medium">{competitor.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(design.components.button.icon, "text-destructive opacity-0 group-hover:opacity-100")}
                  onClick={async () => {
                    try {
                      const { error } = await supabase
                        .from('competitors')
                        .delete()
                        .eq('id', competitor.id)
                      
                      if (error) throw error
                      
                      // Only update parent state after successful DB deletion
                      onDeleteCompetitor(competitor.id)
                    } catch (err) {
                      setError(err instanceof Error ? err.message : 'Failed to delete competitor')
                    }
                  }}
                  disabled={isSubmitting}
                >
                  <X className={design.components.button.iconSize} />
                </Button>
              </motion.div>
            ))}
            {competitors.length === 0 && (
              <div className="h-[100px] flex items-center justify-center">
                <p className={design.typography.subtitle}>Waiting for competitors to be generated...</p>
              </div>
            )}
          </div>
        </AnimatePresence>

        <div className="flex justify-between items-center pt-2">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                className={design.components.button.outline}
                disabled={isSubmitting}
              >
                Add Competitor <Plus className={cn("ml-2", design.components.button.iconSize)} />
              </Button>
            </DialogTrigger>
            <DialogContent className={design.components.dialog.content}>
              <DialogHeader>
                <DialogTitle>Add Competitor</DialogTitle>
              </DialogHeader>
              <div className={design.components.dialog.body}>
                <Input
                  placeholder="Enter competitor name"
                  value={newCompetitor.name}
                  onChange={(e) => setNewCompetitor({ name: e.target.value })}
                  onKeyDown={handleKeyDown}
                  className={cn(design.components.input.base, design.typography.input)}
                  autoFocus
                />
              </div>
              <DialogFooter>
                <Button 
                  onClick={handleAddCompetitor}
                  disabled={!newCompetitor.name.trim() || isSubmitting}
                  className={design.components.button.primary}
                >
                  {isSubmitting ? 'Adding...' : 'Add Competitor'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button
            onClick={onNext}
            disabled={!canProceed || isSubmitting}
            className={design.components.button.primary}
          >
            Continue <ChevronRight className={cn("ml-2", design.components.button.iconSize)} />
          </Button>
        </div>
      </div>
    </Card>
  )
} 