'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Building2, Package, Users, Globe2, Pencil } from "lucide-react"
import { useDashboardStore } from '../store'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface CompanyProfileHeaderProps {
  companyName: string
}

export function CompanyProfileHeader({ companyName }: CompanyProfileHeaderProps) {
  const { companyProfile, setCompanyProfile } = useDashboardStore()
  const [editingSection, setEditingSection] = useState<'products' | 'competitors' | 'icps' | 'personas' | null>(null)
  
  // Individual section edit states
  const [editingProducts, setEditingProducts] = useState(companyProfile?.products || [])
  const [editingCompetitors, setEditingCompetitors] = useState(companyProfile?.competitors || [])
  const [editingICPs, setEditingICPs] = useState(companyProfile?.icps || [])
  const [editingPersonas, setEditingPersonas] = useState(companyProfile?.personas || [])

  const handleSaveSection = () => {
    if (!editingSection || !companyProfile) return

    setCompanyProfile({
      ...companyProfile,
      [editingSection]: editingSection === 'products' ? editingProducts
        : editingSection === 'competitors' ? editingCompetitors
        : editingSection === 'icps' ? editingICPs
        : editingPersonas
    })
    setEditingSection(null)
  }

  return (
    <Card className="p-4">
      <div className="space-y-4">
        {/* Company Name Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-[#f9a8c9]" />
            <h3 className="text-lg font-semibold text-[#30035e]">{companyName}</h3>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Products */}
          <Dialog open={editingSection === 'products'} onOpenChange={(open) => !open && setEditingSection(null)}>
            <div className="group relative">
              <Badge 
                variant="outline" 
                className="w-full py-3 bg-[#f6efff] border-[#f9a8c9] text-[#30035e] flex items-center justify-between group-hover:border-[#30035e]"
              >
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  <span>{companyProfile?.products.length || 0} Products</span>
                </div>
                <DialogTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setEditingSection('products')}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                </DialogTrigger>
              </Badge>
            </div>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Products</DialogTitle>
                <DialogDescription>
                  Add or remove products for your company.
                </DialogDescription>
              </DialogHeader>
              {/* Products Edit Form */}
            </DialogContent>
          </Dialog>

          {/* Competitors */}
          <Dialog open={editingSection === 'competitors'} onOpenChange={(open) => !open && setEditingSection(null)}>
            <div className="group relative">
              <Badge 
                variant="outline" 
                className="w-full py-3 bg-[#f6efff] border-[#f9a8c9] text-[#30035e] flex items-center justify-between group-hover:border-[#30035e]"
              >
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  <span>{companyProfile?.competitors.length || 0} Competitors</span>
                </div>
                <DialogTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setEditingSection('competitors')}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                </DialogTrigger>
              </Badge>
            </div>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Competitors</DialogTitle>
                <DialogDescription>
                  Add or remove competitors you want to track.
                </DialogDescription>
              </DialogHeader>
              {/* Competitors Edit Form */}
            </DialogContent>
          </Dialog>

          {/* ICPs */}
          <Dialog open={editingSection === 'icps'} onOpenChange={(open) => !open && setEditingSection(null)}>
            <div className="group relative">
              <Badge 
                variant="outline" 
                className="w-full py-3 bg-[#f6efff] border-[#f9a8c9] text-[#30035e] flex items-center justify-between group-hover:border-[#30035e]"
              >
                <div className="flex items-center gap-2">
                  <Globe2 className="h-4 w-4" />
                  <span>{companyProfile?.icps.length || 0} ICPs</span>
                </div>
                <DialogTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setEditingSection('icps')}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                </DialogTrigger>
              </Badge>
            </div>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit ICPs</DialogTitle>
                <DialogDescription>
                  Manage your Ideal Customer Profiles.
                </DialogDescription>
              </DialogHeader>
              {/* ICPs Edit Form */}
            </DialogContent>
          </Dialog>

          {/* Personas */}
          <Dialog open={editingSection === 'personas'} onOpenChange={(open) => !open && setEditingSection(null)}>
            <div className="group relative">
              <Badge 
                variant="outline" 
                className="w-full py-3 bg-[#f6efff] border-[#f9a8c9] text-[#30035e] flex items-center justify-between group-hover:border-[#30035e]"
              >
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{companyProfile?.personas.length || 0} Personas</span>
                </div>
                <DialogTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setEditingSection('personas')}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                </DialogTrigger>
              </Badge>
            </div>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Personas</DialogTitle>
                <DialogDescription>
                  Manage your buyer personas.
                </DialogDescription>
              </DialogHeader>
              {/* Personas Edit Form */}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </Card>
  )
} 