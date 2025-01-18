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
import type { ICP } from '../../../types/analysis'

interface ICPStepProps {
  industry: string;
  products: Array<{ id: string; name: string }>;
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
  industry,
  products,
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

  // Auto-generate ICPs when component mounts
  useEffect(() => {
    const generateInitialICPs = async () => {
      if (icps.length === 0) {
        setIsGenerating(true)
        try {
          const suggestions = await generateICPSuggestions(
            industry,
            products.map(p => p.name)
          )
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

  return (
    <Card className={cn(design.layout.card, design.spacing.card)}>
      <div className={design.layout.container}>
        <div className={design.layout.header}>
          <div className={design.layout.headerContent}>
            <h3 className={design.typography.title}>Ideal Customer Profile (ICP)</h3>
            <p className={design.typography.subtitle}>Define your target customer segments</p>
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
            {icps.length === 0 && !isGenerating && (
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
                  disabled={!newICP.vertical || !newICP.region || !newICP.company_size}
                  className={design.components.button.primary}
                >
                  {editingICP ? 'Update' : 'Create'} ICP
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