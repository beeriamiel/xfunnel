'use client'

import { useState } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Globe2, ChevronRight, Plus, Pencil, X } from "lucide-react"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import type { ICP } from '../../../types/analysis'

interface ICPStepProps {
  icps: ICP[];
  onAddICP: (icp: Omit<ICP, 'id' | 'personas'>) => void;
  onEditICP: (icp: ICP) => void;
  onDeleteICP: (id: number) => void;
  onNext: () => void;
  isLoading?: boolean;
}

export function ICPStep({ 
  icps, 
  onAddICP, 
  onEditICP, 
  onDeleteICP,
  onNext,
  isLoading = false 
}: ICPStepProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingICP, setEditingICP] = useState<ICP | null>(null)
  const [newICP, setNewICP] = useState<Partial<ICP>>({
    region: '',
    vertical: '',
    company_size: ''
  })

  const handleAddICP = () => {
    if (!newICP.region || !newICP.vertical || !newICP.company_size) return
    onAddICP(newICP as Omit<ICP, 'id' | 'personas'>)
    setNewICP({ region: '', vertical: '', company_size: '' })
    setDialogOpen(false)
  }

  const handleEditICP = (icp: ICP) => {
    setEditingICP(icp)
    setNewICP(icp)
    setDialogOpen(true)
  }

  const handleUpdateICP = () => {
    if (!editingICP || !newICP.region || !newICP.vertical || !newICP.company_size) return
    onEditICP({ ...editingICP, ...newICP as ICP })
    setEditingICP(null)
    setNewICP({ region: '', vertical: '', company_size: '' })
    setDialogOpen(false)
  }

  return (
    <Card className="w-full max-w-4xl p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-[#30035e]">Initial ICPs</h3>
          <p className="text-sm text-muted-foreground">
            {icps.length > 0 
              ? "These ICPs have been auto-generated based on your company profile."
              : "Add your Ideal Customer Profiles (ICPs)."}
          </p>
        </div>

        <ScrollArea className="w-full">
          <div className="flex gap-4 pb-4">
            {icps.map((icp) => (
              <Card 
                key={icp.id} 
                className="p-4 min-w-[250px] space-y-3 bg-[#f6efff]/50 hover:bg-[#f6efff] transition-colors group relative"
              >
                <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleEditICP(icp)}
                    className="h-8 w-8"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onDeleteICP(icp.id)}
                    className="h-8 w-8 text-red-500 hover:text-red-600"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Globe2 className="h-4 w-4 text-[#f9a8c9]" />
                  <span className="font-medium text-[#30035e]">{icp.region}</span>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div>Vertical: {icp.vertical}</div>
                  <div>Company Size: {icp.company_size}</div>
                </div>
              </Card>
            ))}
            {icps.length === 0 && (
              <div className="w-full py-8 text-center text-sm text-muted-foreground">
                No ICPs added yet
              </div>
            )}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        <div className="flex justify-between items-center pt-4">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#30035e] hover:bg-[#30035e]/90">
                Add ICP <Plus className="ml-2 h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{editingICP ? 'Edit' : 'Add'} ICP</DialogTitle>
                <DialogDescription>
                  Add details about your Ideal Customer Profile. All fields are required.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>Region</Label>
                  <Input
                    placeholder="Enter region"
                    value={newICP.region}
                    onChange={(e) => setNewICP({ ...newICP, region: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Vertical</Label>
                  <Input
                    placeholder="Enter vertical"
                    value={newICP.vertical}
                    onChange={(e) => setNewICP({ ...newICP, vertical: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Company Size</Label>
                  <Input
                    placeholder="Enter company size range"
                    value={newICP.company_size}
                    onChange={(e) => setNewICP({ ...newICP, company_size: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  onClick={editingICP ? handleUpdateICP : handleAddICP}
                  disabled={!newICP.region || !newICP.vertical || !newICP.company_size}
                  className="bg-[#30035e] hover:bg-[#30035e]/90"
                >
                  {editingICP ? 'Update' : 'Add'} ICP
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button 
            onClick={onNext}
            disabled={icps.length === 0 || isLoading}
            className="bg-[#30035e] hover:bg-[#30035e]/90"
          >
            {isLoading ? (
              <>Generating...</>
            ) : (
              <>Continue to Personas <ChevronRight className="ml-2 h-4 w-4" /></>
            )}
          </Button>
        </div>
      </div>
    </Card>
  )
} 