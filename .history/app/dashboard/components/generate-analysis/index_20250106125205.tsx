'use client'

import { useState } from 'react'
import { Card } from "@/components/ui/card"
import { ResponseTable } from './components/analysis/response-table'
import { useDashboardStore } from '@/app/dashboard/store'
import { CompanySetup } from './components/setup/company-setup'
import { CompanyProfileHeader } from './components/company-profile-header'
import { SuccessAnimation } from './components/shared/success-animation'
import confetti from 'canvas-confetti'
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
  const [showNewContent, setShowNewContent] = useState(false)

  const fireConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f9a8c9', '#30035e', '#f6efff'],
    });

    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#f9a8c9', '#30035e', '#f6efff'],
      });
    }, 200);

    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#f9a8c9', '#30035e', '#f6efff'],
      });
    }, 400);
  };

  const handleSetupComplete = async (completedICPs: ICP[], completedPersonas: Persona[]) => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setShowSuccessAnimation(false)
    
    setCompanyProfile({
      icps: completedICPs.map(icp => ({ 
        ...icp, 
        id: Number(icp.id),
        personas: icp.personas.map(p => ({ ...p, id: Number(p.id) }))
      })),
      personas: completedPersonas.map(persona => ({ ...persona, id: Number(persona.id) })),
      products: [],
      competitors: []
    })

    await new Promise(resolve => setTimeout(resolve, 500))
    setHasCompletedOnboarding(true)
    
    await new Promise(resolve => setTimeout(resolve, 100))
    setShowNewContent(true)
    setIsTransitioning(false)
  }

  const handleTransitionStart = () => {
    setIsTransitioning(true)
    setShowSuccessAnimation(true)
    fireConfetti()
    
    setTimeout(() => {
      confetti({
        particleCount: 30,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#f9a8c9', '#30035e', '#f6efff'],
      });
    }, 700)
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
        <Card className="p-6 transition-all duration-500 ease-in-out">
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
        <div className={`transition-all duration-800 ease-in-out ${showNewContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <CompanyProfileHeader companyName="Your Company Name" />
          <Card className="p-6">
            <div className={`space-y-4 transition-all duration-1000 delay-300 ease-in-out ${showNewContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <ResponseTable
                icps={companyProfile?.icps.map(icp => ({ 
                  ...icp, 
                  id: String(icp.id),
                  personas: icp.personas.map(p => ({ ...p, id: String(p.id) }))
                })) || []}
                personas={companyProfile?.personas.map(persona => ({ ...persona, id: String(persona.id) })) || []}
                onGenerateQuestions={async (selectedIds: string[]) => {
                  console.log('Generating questions for:', selectedIds)
                }}
                onGenerateResponses={async (selectedIds: string[]) => {
                  console.log('Generating responses for:', selectedIds)
                }}
              />
            </div>
          </Card>
        </div>
      )}

      {showSuccessAnimation && (
        <SuccessAnimation title="Setup Complete!" />
      )}
    </div>
  )
} 