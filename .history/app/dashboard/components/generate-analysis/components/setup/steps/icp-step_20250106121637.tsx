'use client'

import { useState, useEffect } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronRight, Plus, Users, Pencil, X, Loader2 } from "lucide-react"
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
import { generateICPSuggestions } from '../../../utils/mock-suggestions'
import type { ICP } from '../../../types/analysis'

interface ICPStepProps {
  industry: string;
  products: Array<{ id: string; name: string }>;
  icps: ICP[];
  onAddICP: (icp: Omit<ICP, 'id'>) => void;
  onEditICP: (icp: ICP) => void;
  onDeleteICP: (id: string) => void;
  onNext: () => void;
}

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

  useEffect(() => {
    const generateSuggestions = async () => {
      if (icps.length === 0 && industry && products.length > 0) {
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

    generateSuggestions()
  }, [industry, products, icps.length, onAddICP])

  const handleAddICP = () => {
    if (!newICP.vertical || !newICP.region || !newICP.company_size) return
    onAddICP({
      ...newICP,
      personas: []
    } as Omit<ICP, 'id'>)
    setNewICP({ region: '', vertical: '', company_size: '', personas: [] })
    setDialogOpen(false)
  }

  const handleEditICP = (icp: ICP) => {
    setEditingICP(icp)
    setNewICP(icp)
    setDialogOpen(true)
  }

  const handleUpdateICP = () => {
    if (!editingICP || !newICP.vertical || !newICP.region || !newICP.company_size) return
    onEditICP({ ...editingICP, ...newICP as ICP })
    setEditingICP(null)
    setNewICP({ region: '', vertical: '', company_size: '', personas: [] })
    setDialogOpen(false)
  }

  return (
    <Card className="w-full max-w-xl p-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-[#30035e]">Ideal Customer Profile (ICP)</h3>
            <p className="text-sm text-muted-foreground">Define your target customer segments</p>
          </div>
        </div>

        <AnimatePresence>
          <div className="min-h-[100px] flex flex-col">
            {icps.map((icp) => (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                key={icp.id}
                className="group flex items-center justify-between p-2 hover:bg-[#f6efff]/50 rounded-md transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-[#f9a8c9]" />
                  <div className="flex flex-col">
                    <span className="font-medium">{icp.vertical}</span>
                    <span className="text-xs text-muted-foreground">
                      {icp.region} · {icp.company_size} employees
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleEditICP(icp)}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive"
                    onClick={() => onDeleteICP(icp.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </motion.div>
            ))}
            {icps.length === 0 && !isGenerating && (
              <div className="h-[100px] flex items-center justify-center">
                <p className="text-sm text-muted-foreground">Add your first ICP</p>
              </div>
            )}
            {isGenerating && (
              <div className="h-[100px] flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-[#30035e]" />
                <p className="ml-2 text-sm text-muted-foreground">Generating suggestions...</p>
              </div>
            )}
          </div>
        </AnimatePresence>

        <div className="flex justify-between items-center pt-2">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-[#30035e] text-[#30035e] hover:bg-[#30035e]/10">
                Add ICP <Plus className="ml-2 h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{editingICP ? 'Edit' : 'Add'} ICP</DialogTitle>
                <DialogDescription>
                  Define your ideal customer profile. All fields are required.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>Vertical/Industry</Label>
                  <Input
                    placeholder="e.g., SaaS, Healthcare, E-commerce"
                    value={newICP.vertical}
                    onChange={(e) => setNewICP({ ...newICP, vertical: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Region</Label>
                  <Input
                    placeholder="e.g., North America, Europe, Global"
                    value={newICP.region}
                    onChange={(e) => setNewICP({ ...newICP, region: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Company Size</Label>
                  <Input
                    placeholder="e.g., 100-1000"
                    value={newICP.company_size}
                    onChange={(e) => setNewICP({ ...newICP, company_size: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  onClick={editingICP ? handleUpdateICP : handleAddICP}
                  disabled={!newICP.vertical || !newICP.region || !newICP.company_size}
                  className="bg-[#30035e] hover:bg-[#30035e]/90"
                >
                  {editingICP ? 'Update' : 'Add'} ICP
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button
            onClick={onNext}
            disabled={icps.length === 0 || isGenerating}
            className="bg-[#30035e] hover:bg-[#30035e]/90"
          >
            Continue <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
} 