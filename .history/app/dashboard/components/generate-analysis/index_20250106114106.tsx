'use client'

import { useState } from 'react'
import { Card } from "@/components/ui/card"
import { ResponseTable } from './components/analysis/response-table'
import { useDashboardStore } from '@/app/dashboard/store'
import { CompanySetup } from './components/setup/company-setup'
import { CompanyProfileHeader } from '../company-profile-header'
import type { ICP, Persona } from './types/analysis'

interface Props {
  companyId: number
}

export function GenerateAnalysis({ companyId }: Props) {
  const { 
    hasCompletedOnboarding,
    setHasCompletedOnboarding,
    companyProfile,
    setCompanyProfile
  } = useDashboardStore()

  const [isTransitioning, setIsTransitioning] = useState(false)
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false)

  const handleSetupComplete = async (completedICPs: ICP[], completedPersonas: Persona[]) => {
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setShowSuccessAnimation(false)
    
    setCompanyProfile({
      icps: completedICPs.map(icp => ({ ...icp, id: Number(icp.id) })),
      personas: completedPersonas.map(persona => ({ ...persona, id: Number(persona.id) })),
      products: [],
      competitors: []
    })

    await new Promise(resolve => setTimeout(resolve, 500))
    setHasCompletedOnboarding(true)
    setIsTransitioning(false)
  }

  const handleTransitionStart = () => {
    setIsTransitioning(true)
    setShowSuccessAnimation(true)
  }

  if (!companyId) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-semibold tracking-tight">Generate Analysis</h2>
          <p className="text-muted-foreground mt-2">Please select a company to view response analysis</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {!hasCompletedOnboarding && !isTransitioning ? (
        <Card className="p-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Generate Analysis</h2>
              <p className="text-muted-foreground">Set up your company profile and generate AI responses</p>
            </div>
            <CompanySetup 
              onComplete={handleSetupComplete}
              onTransitionStart={handleTransitionStart}
            />
          </div>
        </Card>
      ) : (
        <>
          <CompanyProfileHeader companyName="Your Company Name" />
          <Card className="p-6">
            <ResponseTable
              icps={companyProfile?.icps.map(icp => ({ ...icp, id: String(icp.id) })) || []}
              personas={companyProfile?.personas.map(persona => ({ ...persona, id: String(persona.id) })) || []}
              onGenerateQuestions={async (selectedIds: string[]) => {
                console.log('Generating questions for:', selectedIds)
              }}
              onGenerateResponses={async (selectedIds: string[]) => {
                console.log('Generating responses for:', selectedIds)
              }}
            />
          </Card>
        </>
      )}
    </div>
  )
} 