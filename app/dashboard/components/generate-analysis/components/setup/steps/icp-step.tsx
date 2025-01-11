'use client'

import { useState, useEffect } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronRight, Plus, Users, Pencil, X, Loader2, Sparkles } from "lucide-react"
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
import { cn } from "@/lib/utils"
import { design } from '../../../lib/design-system'
import { generateICPSuggestions } from '../../../utils/mock-suggestions'
import { B2CICPForm } from './b2c-icp-form'
import type { ICP } from '../../../types/analysis'
import type { B2CToB2BMapping } from '../../../types/b2c-mappings'

interface ICPStepProps {
  businessType: 'b2b' | 'b2c';
  icps: ICP[];
  onAddICP: (icp: Omit<ICP, 'id'>) => void;
  onEditICP: (icp: ICP) => void;
  onDeleteICP: (id: number) => void;
  onNext: () => void;
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
  businessType,
  icps, 
  onAddICP, 
  onEditICP, 
  onDeleteICP,
  onNext 
}: ICPStepProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingICP, setEditingICP] = useState<ICP | null>(null)
  const [newICP, setNewICP] = useState<Partial<ICP>>({
    region: '',
    vertical: '',
    company_size: '',
    personas: []
  })
  const [isGenerating, setIsGenerating] = useState(false)

  const isB2C = businessType === 'b2c'

  // Auto-generate ICPs when component mounts (only for B2B)
  useEffect(() => {
    const generateInitialICPs = async () => {
      if (icps.length === 0 && !isB2C) {
        setIsGenerating(true)
        try {
          const suggestions = await generateICPSuggestions()
          suggestions.forEach(icp => {
            onAddICP({
              region: icp.region,
              vertical: icp.vertical,
              company_size: icp.company_size,
              personas: []
            })
          })
        } catch (error) {
          console.error('Failed to generate ICP suggestions:', error)
        }
        setIsGenerating(false)
      }
    }

    generateInitialICPs()
  }, []) // Only run once on mount

  const handleEditICP = (icp: ICP) => {
    setEditingICP(icp)
    setNewICP(icp)
    setDialogOpen(true)
  }

  const handleCreateICP = () => {
    setEditingICP(null)
    setNewICP({
      region: '',
      vertical: '',
      company_size: '',
      personas: []
    })
    setDialogOpen(true)
  }

  const handleUpdateICP = () => {
    if (!newICP.vertical || !newICP.region || !newICP.company_size) return

    if (editingICP) {
      onEditICP({ ...editingICP, ...newICP as ICP })
    } else {
      onAddICP(newICP as Omit<ICP, 'id'>)
    }

    setEditingICP(null)
    setNewICP({ region: '', vertical: '', company_size: '', personas: [] })
    setDialogOpen(false)
  }

  const getB2CInitialData = (icp: ICP): Partial<B2CToB2BMapping> => {
    return {
      ageGroup: icp.vertical,
      incomeLevel: icp.company_size,
      location: icp.region,
      gender: icp.personas[0]?.title || '',
      additionalTraits: [
        icp.personas[0]?.department || '',
        icp.personas[0]?.seniority_level || ''
      ].filter(Boolean)
    }
  }

  return (
    <Card className={cn(design.layout.card, design.spacing.card)}>
      <div className={design.layout.container}>
        <div className={design.layout.header}>
          <div className={design.layout.headerContent}>
            <h3 className={design.typography.title}>
              {isB2C ? 'Consumer Profile' : 'Ideal Customer Profile (ICP)'}
            </h3>
            <p className={design.typography.subtitle}>
              {isB2C 
                ? 'Define your target consumer segments'
                : 'Define your target customer segments'}
            </p>
          </div>
        </div>

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
                      {icp.region} · {isB2C ? 'Income: ' : ''}{icp.company_size}
                      {!isB2C && ' employees'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={design.components.button.icon}
                    onClick={() => handleEditICP(icp)}
                  >
                    <Pencil className={design.components.button.iconSize} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(design.components.button.icon, "text-destructive")}
                    onClick={() => onDeleteICP(icp.id)}
                  >
                    <X className={design.components.button.iconSize} />
                  </Button>
                </div>
              </motion.div>
            ))}
            {icps.length === 0 && !isGenerating && !isB2C && (
              <div className="h-[100px] flex flex-col items-center justify-center gap-2">
                <Sparkles className={cn(design.components.listItem.icon, "h-8 w-8")} />
                <p className={design.typography.subtitle}>Generating your ideal customer profiles...</p>
              </div>
            )}
            {isGenerating && (
              <div className="h-[100px] flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-[#30035e]" />
                <p className={cn("ml-2", design.typography.subtitle)}>Generating suggestions...</p>
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
              >
                Add {isB2C ? 'Consumer Profile' : 'ICP'} 
                <Plus className={cn("ml-2", design.components.button.iconSize)} />
              </Button>
            </DialogTrigger>
            <DialogContent className={design.components.dialog.content}>
              <DialogHeader>
                <DialogTitle>
                  {editingICP 
                    ? `Edit ${isB2C ? 'Consumer Profile' : 'ICP'}`
                    : `Create ${isB2C ? 'Consumer Profile' : 'ICP'}`}
                </DialogTitle>
                <DialogDescription>
                  {editingICP 
                    ? `Customize your ${isB2C ? 'consumer' : 'ideal customer'} profile.`
                    : `Create a new ${isB2C ? 'consumer' : 'ideal customer'} profile.`}
                </DialogDescription>
              </DialogHeader>
              
              {isB2C ? (
                <B2CICPForm
                  onSubmit={(b2cMappedData) => {
                    if (editingICP) {
                      onEditICP({ ...editingICP, ...b2cMappedData })
                    } else {
                      onAddICP(b2cMappedData)
                    }
                    setDialogOpen(false)
                  }}
                  isEditing={!!editingICP}
                  initialData={editingICP ? getB2CInitialData(editingICP) : undefined}
                />
              ) : (
                <div className={design.components.dialog.body}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="vertical">Industry/Vertical</Label>
                      <Input
                        id="vertical"
                        placeholder="e.g. Enterprise SaaS, Healthcare"
                        value={newICP.vertical}
                        onChange={(e) => setNewICP({ ...newICP, vertical: e.target.value })}
                        className={cn(design.components.input.base, design.typography.input)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="region">Region</Label>
                      <Select
                        value={newICP.region}
                        onValueChange={(value) => setNewICP({ ...newICP, region: value })}
                      >
                        <SelectTrigger id="region">
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
                    <div className="space-y-2">
                      <Label htmlFor="company-size">Company Size</Label>
                      <Select
                        value={newICP.company_size}
                        onValueChange={(value) => setNewICP({ ...newICP, company_size: value })}
                      >
                        <SelectTrigger id="company-size">
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
                </div>
              )}
              <DialogFooter>
                <Button 
                  onClick={handleUpdateICP}
                  disabled={!newICP.vertical || !newICP.region || !newICP.company_size}
                  className={design.components.button.primary}
                >
                  {editingICP ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button
            onClick={onNext}
            disabled={icps.length === 0 || isGenerating}
            className={design.components.button.primary}
          >
            Continue <ChevronRight className={cn("ml-2", design.components.button.iconSize)} />
          </Button>
        </div>
      </div>
    </Card>
  )
} 