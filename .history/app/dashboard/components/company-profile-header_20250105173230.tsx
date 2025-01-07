'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Building2, Package, Users, Globe2, ChevronRight, Pencil } from "lucide-react"
import { useDashboardStore } from '../store'
import { CompanySetup } from './response-analysis'

interface CompanyProfileHeaderProps {
  companyName: string
}

export function CompanyProfileHeader({ companyName }: CompanyProfileHeaderProps) {
  const [isEditing, setIsEditing] = useState(false)
  const { companyProfile, setCompanyProfile, setHasCompletedOnboarding } = useDashboardStore()

  const handleSetupComplete = (completedICPs: any[], completedPersonas: any[]) => {
    setCompanyProfile({
      icps: completedICPs,
      personas: completedPersonas,
      products: companyProfile?.products || [],
      competitors: companyProfile?.competitors || []
    })
    setIsEditing(false)
  }

  return (
    <Card className="p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-[#f9a8c9]" />
            <h3 className="text-lg font-semibold text-[#30035e]">{companyName}</h3>
          </div>
          
          <div className="flex gap-2">
            {companyProfile && (
              <>
                <Badge variant="outline" className="bg-[#f6efff] border-[#f9a8c9] text-[#30035e]">
                  <Package className="h-3 w-3 mr-1" />
                  {companyProfile.products.length} Products
                </Badge>
                <Badge variant="outline" className="bg-[#f6efff] border-[#f9a8c9] text-[#30035e]">
                  <Building2 className="h-3 w-3 mr-1" />
                  {companyProfile.competitors.length} Competitors
                </Badge>
                <Badge variant="outline" className="bg-[#f6efff] border-[#f9a8c9] text-[#30035e]">
                  <Globe2 className="h-3 w-3 mr-1" />
                  {companyProfile.icps.length} ICPs
                </Badge>
                <Badge variant="outline" className="bg-[#f6efff] border-[#f9a8c9] text-[#30035e]">
                  <Users className="h-3 w-3 mr-1" />
                  {companyProfile.personas.length} Personas
                </Badge>
              </>
            )}
          </div>
        </div>

        <Sheet open={isEditing} onOpenChange={setIsEditing}>
          <SheetTrigger asChild>
            <Button 
              variant="outline" 
              className="border-[#30035e] text-[#30035e] hover:bg-[#30035e]/10"
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[800px] sm:max-w-[800px]">
            <SheetHeader>
              <SheetTitle>Edit Company Profile</SheetTitle>
              <SheetDescription>
                Update your company profile, ICPs, and personas.
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              <CompanySetup onComplete={handleSetupComplete} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </Card>
  )
} 