'use client'

import { useState, useEffect } from 'react'
import { Card } from "@/components/ui/card"
import { ResponseTable } from './components/analysis/response-table'
import { useDashboardStore } from '@/app/dashboard/store'
import { CompanySetup } from './components/setup/company-setup'
import { CompanyProfileHeader } from './components/company-profile-header'
import { SuccessAnimation } from './components/shared/success-animation'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'
import confetti from 'canvas-confetti'
import { getCompanyProfile } from './utils/actions'
import type { ICP, Persona } from './types/analysis'

interface GenerateAnalysisProps {
  accountId: string;
}

export function GenerateAnalysis({ accountId }: GenerateAnalysisProps) {
  const { 
    selectedCompanyId,
    companyProfile,
    setCompanyProfile,
    isDevMode,
    setIsDevMode,
    resetCompanyProfile,
    setSelectedCompanyId,
    addCompany
  } = useDashboardStore()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false)
  const [showNewContent, setShowNewContent] = useState(false)

  // Only show dev mode toggle in development
  const isDevelopment = process.env.NODE_ENV === 'development'

  useEffect(() => {
    async function fetchCompanyProfile() {
      if (!selectedCompanyId) return
      
      setIsLoading(true)
      try {
        const profile = await getCompanyProfile(selectedCompanyId, accountId)
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

  const handleCompanyCreate = async (companyName: string) => {
    try {
      const response = await fetch('/api/companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: companyName,
          accountId
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create company')
      }

      const company = await response.json()
      setSelectedCompanyId(company.id)
      addCompany(company)
    } catch (error) {
      console.error('Error creating company:', error)
      setError(error instanceof Error ? error.message : 'Failed to create company')
    }
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
      
      {isDevelopment && (
        <div className="flex items-center gap-4 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
          <AlertCircle className="w-5 h-5 text-yellow-600" />
          <span className="text-sm text-yellow-700">Development Mode</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setIsDevMode(!isDevMode)
              if (!isDevMode) {
                resetCompanyProfile()
              }
            }}
          >
            {isDevMode ? 'Exit Dev Mode' : 'Enter Dev Mode'}
          </Button>
        </div>
      )}
      
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
      ) : (
        <>
          {/* Show setup in dev mode or when no profile exists */}
          {(isDevMode || !companyProfile) && !isTransitioning && (
            <Card className="p-6 transition-all duration-500 ease-in-out">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">
                    {isDevMode ? 'Dev Mode: Company Setup' : 'Generate Analysis'}
                  </h2>
                  <p className="text-muted-foreground">
                    Set up your company profile and generate AI responses
                  </p>
                </div>
                <CompanySetup 
                  accountId={accountId}
                  onCompanyCreate={handleCompanyCreate}
                  onComplete={handleSetupComplete}
                  onTransitionStart={handleTransitionStart}
                />
              </div>
            </Card>
          )}

          {/* Show existing profile if it exists */}
          {companyProfile && (
            <div className={`transition-all duration-800 ease-in-out ${showNewContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <Card className="p-6">
                <div className={`space-y-4 transition-all duration-1000 delay-300 ease-in-out ${showNewContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                  <ResponseTable
                    icps={companyProfile.icps}
                    companyId={selectedCompanyId!}
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
        </>
      )}

      {showSuccessAnimation && (
        <SuccessAnimation title="Setup Complete!" />
      )}
    </div>
  )
} 