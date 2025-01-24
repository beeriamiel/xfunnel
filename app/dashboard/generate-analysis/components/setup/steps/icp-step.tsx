'use client'

import { useState, useEffect } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronRight, Plus, Users, Pencil, X, Loader2, AlertCircle } from "lucide-react"
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
import { useDashboardStore } from '@/app/dashboard/store'
import { createClient } from '@/app/supabase/client'
import type { Product } from '../../../types/setup'

interface ICPBase {
  id: number;
  vertical: string;
  region: string;
  company_size: string;
  personas: any[]; // Assuming personas is an array of any type
}

interface ICPStepProps {
  industry: string;
  products: Product[];
  icps: ICPBase[];
  onAddICP: (icp: ICPBase) => void;
  onEditICP: (icp: ICPBase) => void;
  onDeleteICP: (id: number) => void;
  onNext: () => void;
  accountId: string;
}

const REGIONS = [
  'North America',
  'Europe',
  'Asia Pacific',
  'Latin America',
  'Global'
]

const COMPANY_SIZES = [
  '1-10',
  '11-50',
  '51-200',
  '201-1000',
  '1000+'
]

export function ICPStep({ 
  industry,
  products,
  icps, 
  onAddICP, 
  onEditICP, 
  onDeleteICP,
  onNext,
  accountId 
}: ICPStepProps) {
  console.log('🔵 ICPStep Render:', {
    industry,
    productsCount: products.length,
    icpsCount: icps.length,
    icps: icps.map(icp => ({ 
      id: icp.id, 
      vertical: icp.vertical,
      region: icp.region,
      company_size: icp.company_size
    }))
  })

  const supabase = createClient()
  const { selectedCompanyId } = useDashboardStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingICP, setEditingICP] = useState<ICPBase | null>(null)
  const [newICP, setNewICP] = useState<Omit<ICPBase, 'id' | 'personas'>>({
    vertical: '',
    region: '',
    company_size: ''
  })
  const [isLoadingGeneratedData, setIsLoadingGeneratedData] = useState(true)
  const [hasLoadedInitialData, setHasLoadedInitialData] = useState(false)

  // Log ICPs prop changes
  useEffect(() => {
    console.log('🟡 ICPStep icps prop changed:', icps)
  }, [icps])

  // Log state changes
  useEffect(() => {
    console.log('🟡 ICPStep state changed:', {
      dialogOpen,
      editingICP,
      isSubmitting,
      isLoadingGeneratedData,
      hasLoadedInitialData,
      error,
      newICP
    })
  }, [dialogOpen, editingICP, isSubmitting, isLoadingGeneratedData, hasLoadedInitialData, error, newICP])

  // Load generated data once when mounted
  useEffect(() => {
    let isMounted = true;

    async function loadGeneratedData() {
      console.log('🟡 ICPStep loadGeneratedData starting:', {
        selectedCompanyId,
        hasLoadedInitialData,
        currentICPs: icps.length
      })

      if (!selectedCompanyId || hasLoadedInitialData || icps.length > 0) {
        console.log('🔴 ICPStep loadGeneratedData skipped:', {
          reason: !selectedCompanyId 
            ? 'no selectedCompanyId' 
            : hasLoadedInitialData 
              ? 'already loaded' 
              : 'icps already exist'
        })
        return
      }

      try {
        const { data: dbICPs } = await supabase
          .from('ideal_customer_profiles')
          .select('id, vertical, region, company_size')
          .eq('company_id', selectedCompanyId)

        console.log('🟡 ICPStep: DB ICPs fetched:', dbICPs)

        if (dbICPs?.length && isMounted) {
          // Map the ICPs from the database
          const mappedICPs = dbICPs.map(icp => ({
            id: icp.id,
            vertical: icp.vertical,
            region: icp.region,
            company_size: icp.company_size
          }))

          console.log('🟢 ICPStep: Adding mapped ICPs:', mappedICPs)

          // Add all ICPs at once by calling onAddICP for each one
          for (const icp of mappedICPs) {
            if (isMounted && !icps.some(c => c.id === icp.id)) {
              console.log('🟢 ICPStep: Adding ICP:', icp)
              onAddICP({
                id: icp.id,
                vertical: icp.vertical,
                region: icp.region,
                company_size: icp.company_size,
                personas: []
              })
            }
          }

          // Update the store after adding ICPs
          if (isMounted) {
            setHasLoadedInitialData(true)
            console.log('🟢 ICPStep loadGeneratedData complete')
          }
        }
      } catch (error) {
        console.error('🔴 ICPStep Error loading ICPs:', error)
        if (isMounted) {
          setError(error instanceof Error ? error.message : 'Failed to load ICPs')
        }
      } finally {
        if (isMounted) {
          setIsLoadingGeneratedData(false)
          setHasLoadedInitialData(true)
          console.log('🟢 ICPStep loadGeneratedData complete')
        }
      }
    }

    loadGeneratedData()

    return () => {
      isMounted = false
    }
  }, [selectedCompanyId, onAddICP, hasLoadedInitialData, icps])

  const handleEditICP = (icp: ICPBase) => {
    setEditingICP(icp)
    setNewICP(icp)
    setDialogOpen(true)
  }

  const handleCreateICP = () => {
    setEditingICP(null)
    setNewICP({
      region: '',
      vertical: '',
      company_size: ''
    })
    setDialogOpen(true)
  }

  const handleDelete = async (icpId: number) => {
    if (!selectedCompanyId) return
    
    setIsSubmitting(true)
    setError(null)
    
    try {
      // Delete from database
      const { error: deleteError } = await supabase
        .from('ideal_customer_profiles')
        .delete()
        .eq('id', icpId)
        .eq('company_id', selectedCompanyId)
        .eq('account_id', accountId)
      
      if (deleteError) throw deleteError
      
      // Only update parent state after successful DB deletion
      onDeleteICP(icpId)
    } catch (err) {
      console.error('Error deleting ICP:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete ICP')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateICP = async () => {
    if (!newICP.vertical || !newICP.region || !newICP.company_size || !selectedCompanyId) return
    
    setIsSubmitting(true)
    setError(null)
    
    try {
      if (editingICP) {
        // Update existing ICP
        const { error: updateError } = await supabase
          .from('ideal_customer_profiles')
          .update({
            vertical: newICP.vertical,
            region: newICP.region,
            company_size: newICP.company_size
          })
          .eq('id', editingICP.id)
          .eq('company_id', selectedCompanyId)
          .eq('account_id', accountId)

        if (updateError) throw updateError

        // Update parent state
        onEditICP({
          ...editingICP,
          ...newICP
        })
      } else {
        // Create new ICP
        const { data: newICPData, error: insertError } = await supabase
          .from('ideal_customer_profiles')
          .insert({
            company_id: selectedCompanyId,
            account_id: accountId,
            vertical: newICP.vertical,
            region: newICP.region,
            company_size: newICP.company_size
          })
          .select()
          .single()

        if (insertError) throw insertError
        if (!newICPData) throw new Error('Failed to create ICP')

        // Update parent state
        onAddICP({
          id: newICPData.id,
          ...newICP,
          personas: []
        })
      }
      
      setEditingICP(null)
      setNewICP({ 
        vertical: '', 
        region: '', 
        company_size: '' 
      })
      setDialogOpen(false)
    } catch (err) {
      console.error('Error updating ICP:', err)
      setError(err instanceof Error ? err.message : 'Failed to update ICP')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Validation for next step
  const canProceed = icps.length > 0 && hasLoadedInitialData

  if (isLoadingGeneratedData) {
    return (
      <Card className={cn(design.layout.card, design.spacing.card)}>
        <div className="flex flex-col items-center justify-center p-8 space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-[#30035e]" />
          <div className="space-y-2 text-center">
            <h3 className={design.typography.title}>
              Loading ICPs
            </h3>
            <p className={design.typography.subtitle}>
              Checking for generated ICP data...
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
            <h3 className={design.typography.title}>Ideal Customer Profile (ICP)</h3>
            <p className={design.typography.subtitle}>Review generated ICPs or add your own</p>
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
            {icps.map((icp) => (
              <motion.div
                initial={design.animations.listItem.initial}
                animate={design.animations.listItem.animate}
                exit={design.animations.listItem.exit}
                key={icp.id}
                className={design.components.listItem.base}
              >
                <div className="flex items-center gap-2">
                  <Users className={design.components.listItem.icon} />
                  <div className="flex flex-col">
                    <span className="font-medium">{icp.vertical}</span>
                    <span className={design.typography.subtitle}>
                      {icp.region} · {icp.company_size} employees
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={design.components.button.icon}
                    onClick={() => handleEditICP(icp)}
                    disabled={isSubmitting}
                  >
                    <Pencil className={design.components.button.iconSize} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(design.components.button.icon, "text-destructive")}
                    onClick={() => handleDelete(icp.id)}
                    disabled={isSubmitting}
                  >
                    <X className={design.components.button.iconSize} />
                  </Button>
                </div>
              </motion.div>
            ))}
            {icps.length === 0 && (
              <div className="h-[100px] flex items-center justify-center">
                <p className={design.typography.subtitle}>Waiting for ICPs to be generated...</p>
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
                onClick={handleCreateICP}
                disabled={isSubmitting}
              >
                Add ICP <Plus className={cn("ml-2", design.components.button.iconSize)} />
              </Button>
            </DialogTrigger>
            <DialogContent className={design.components.dialog.content}>
              <DialogHeader>
                <DialogTitle>{editingICP ? 'Edit ICP' : 'Create ICP'}</DialogTitle>
                <DialogDescription>
                  {editingICP ? 'Customize your ideal customer profile.' : 'Create a new ideal customer profile.'}
                </DialogDescription>
              </DialogHeader>
              <div className={design.components.dialog.body}>
                <div className={design.spacing.element}>
                  <Label className={design.typography.label}>Region</Label>
                  <Select 
                    value={newICP.region} 
                    onValueChange={(value) => setNewICP({ ...newICP, region: value })}
                  >
                    <SelectTrigger className={design.components.input.base}>
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      {REGIONS.map((region) => (
                        <SelectItem key={region} value={region}>
                          {region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className={design.spacing.element}>
                  <Label className={design.typography.label}>Vertical/Industry</Label>
                  <Input
                    placeholder="e.g., SaaS, Healthcare, E-commerce"
                    value={newICP.vertical}
                    onChange={(e) => setNewICP({ ...newICP, vertical: e.target.value })}
                    className={design.components.input.base}
                  />
                </div>
                <div className={design.spacing.element}>
                  <Label className={design.typography.label}>Company Size</Label>
                  <Select 
                    value={newICP.company_size} 
                    onValueChange={(value) => setNewICP({ ...newICP, company_size: value })}
                  >
                    <SelectTrigger className={design.components.input.base}>
                      <SelectValue placeholder="Select company size" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMPANY_SIZES.map((size) => (
                        <SelectItem key={size} value={size}>
                          {size} employees
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  onClick={handleUpdateICP}
                  disabled={!newICP.vertical || !newICP.region || !newICP.company_size || isSubmitting}
                  className={design.components.button.primary}
                >
                  {isSubmitting ? 'Saving...' : editingICP ? 'Update' : 'Create'} ICP
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