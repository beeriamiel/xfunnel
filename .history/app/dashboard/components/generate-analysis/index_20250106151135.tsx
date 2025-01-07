'use client'

import { useState, useEffect } from 'react'
import { Card } from "@/components/ui/card"
import { ResponseTable } from './components/analysis/response-table'
import { useDashboardStore } from '@/app/dashboard/store'
import { CompanySetup } from './components/setup/company-setup'
import { CompanyProfileHeader } from './components/company-profile-header'
import { SuccessAnimation } from './components/shared/success-animation'
import confetti from 'canvas-confetti'
import { getCompanyProfile } from './utils/actions'
import type { ICP, Persona } from './types/analysis'

export function GenerateAnalysis() {
  const { 
    selectedCompanyId,
    companyProfile,
    setCompanyProfile
  } = useDashboardStore()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false)
  const [showNewContent, setShowNewContent] = useState(false)

  useEffect(() => {
    async function fetchCompanyProfile() {
      if (!selectedCompanyId) return
      
      setIsLoading(true)
      try {
        const profile = await getCompanyProfile(selectedCompanyId)
        if (profile) {
          setCompanyProfile(profile)
          setShowNewContent(true)
        }
        setError(null)
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to fetch company profile')
      } finally {
        setIsLoading(false)
      }
    }

    fetchCompanyProfile()
  }, [selectedCompanyId, setCompanyProfile])

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
      icps: completedICPs,
      personas: completedPersonas,
      products: [],
      competitors: []
    })

    await new Promise(resolve => setTimeout(resolve, 500))
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

  if (!selectedCompanyId) {
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
      <CompanyProfileHeader companyId={selectedCompanyId} />
      
      {isLoading ? (
        <Card className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </Card>
      ) : error ? (
        <Card className="p-6">
          <div className="text-red-500">{error}</div>
        </Card>
      ) : companyProfile ? (
        <div className={`transition-all duration-800 ease-in-out ${showNewContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <Card className="p-6">
            <div className={`space-y-4 transition-all duration-1000 delay-300 ease-in-out ${showNewContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <ResponseTable
                icps={companyProfile.icps}
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
      ) : !isTransitioning ? (
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
      ) : null}

      {showSuccessAnimation && (
        <SuccessAnimation title="Setup Complete!" />
      )}
    </div>
  )
} 