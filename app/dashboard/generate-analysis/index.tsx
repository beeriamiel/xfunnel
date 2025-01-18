'use client'

import { useState, useEffect } from 'react'
import { Card } from "@/components/ui/card"
import { ResponseTable } from './components/analysis/response-table'
import { useDashboardStore, type CompanyProfile } from '@/app/dashboard/store'
import { CompanySetup } from './components/setup/company-setup'
import { CompanyProfileHeader } from './components/company-profile-header'
import { SuccessAnimation } from './components/shared/success-animation'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'
import confetti from 'canvas-confetti'
import { getCompanyProfile } from './utils/actions'
import type { ICP, Persona } from './types/analysis'
import { createClient } from '@/app/supabase/client'
import { type Step } from './types/setup'

interface GenerateAnalysisProps {
  accountId: string;
  isOnboarding: boolean;
  step?: Step;
}

export function GenerateAnalysis({ accountId, isOnboarding: initialIsOnboarding }: GenerateAnalysisProps) {
  console.log('🔵 GenerateAnalysis Render:', {
    accountId,
    initialIsOnboarding,
    selectedCompanyId: useDashboardStore.getState().selectedCompanyId,
    companyProfile: useDashboardStore.getState().companyProfile,
    storeState: useDashboardStore.getState()
  })

  const { 
    selectedCompanyId,
    isOnboarding,
    startOnboarding,
    completeOnboarding,
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

  const supabase = createClient()

  useEffect(() => {
    if (initialIsOnboarding) {
      startOnboarding()
    }
  }, [initialIsOnboarding])

  useEffect(() => {
    async function fetchCompanyProfile() {
      console.log('🔵 fetchCompanyProfile START:', { 
        selectedCompanyId,
        isLoading,
        showNewContent
      })
      
      if (!selectedCompanyId) {
        console.log('🟡 No selectedCompanyId, resetting state')
        setShowNewContent(false)
        setIsLoading(false)
        return
      }
      
      setIsLoading(true)
      try {
        console.log('🟡 Fetching profile for company:', selectedCompanyId)
        const profile = await getCompanyProfile(selectedCompanyId, accountId)
        
        console.log('🟢 Profile fetched:', { profile })
        if (profile && Object.keys(profile).length > 0) {
          // Transform API response to match CompanyProfile interface
          const transformedProfile: CompanyProfile = {
            ...profile,
            icps: profile.ideal_customer_profiles || [],
            personas: [], // Add if available from API
            products: [], // Add if available from API
            competitors: [], // Add if available from API
          }
          setCompanyProfile(transformedProfile)
          setShowNewContent(true)
          setError(null)
        } else {
          setShowNewContent(false)
          setCompanyProfile(null)
          setError(null)
        }
      } catch (error) {
        console.error('🔴 Error fetching profile:', error)
        setError(error instanceof Error ? error.message : 'Failed to fetch company profile')
        setShowNewContent(false)
        setCompanyProfile(null)
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

  const handleSetupComplete = async () => {
    console.log('🔵 handleSetupComplete START:', {
      selectedCompanyId,
      isTransitioning,
      showNewContent
    })
    
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    if (selectedCompanyId) {
      try {
        console.log('🟡 Fetching final company profile...')
        const profile = await getCompanyProfile(selectedCompanyId, accountId)
        if (profile) {
          const transformedProfile: CompanyProfile = {
            ...profile,
            icps: profile.ideal_customer_profiles || [],
            personas: [], 
            products: [],
            competitors: []
          }
          setCompanyProfile(transformedProfile)
        }
      } catch (error) {
        console.error('🔴 Error fetching final profile:', error)
      }
    }
    
    console.log('🟡 Updating transition state...')
    setShowSuccessAnimation(false)
    
    await new Promise(resolve => setTimeout(resolve, 500))
    setShowNewContent(true)
    setIsTransitioning(false)
    completeOnboarding()
    
    console.log('🟢 handleSetupComplete END:', {
      showNewContent: true,
      isTransitioning: false,
      isOnboarding: false
    })
  }

  const handleTransitionStart = () => {
    setIsTransitioning(true)
    setShowSuccessAnimation(true)
    fireConfetti()
  }

  const handleCompanyCreate = async (companyName: string) => {
    console.log('🔵 handleCompanyCreate START:', { companyName })
    setIsLoading(true)
    try {
      console.log('🟡 Creating company via API...')
      const response = await fetch('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: companyName, accountId })
      })

      if (!response.ok) {
        console.error('🔴 API Error:', await response.text())
        throw new Error('Failed to create company')
      }
      
      const company = await response.json()
      console.log('🟢 Company created:', company)
      
      setSelectedCompanyId(company.id)
      addCompany(company)
      
      console.log('🟢 handleCompanyCreate END:', {
        newCompanyId: company.id,
        storeState: useDashboardStore.getState()
      })
      return company
    } catch (error) {
      console.error('🔴 handleCompanyCreate ERROR:', error)
      throw error
    }
  }

  return (
    <div className="space-y-6">
      {!isOnboarding && selectedCompanyId && (
        <CompanyProfileHeader companyId={selectedCompanyId} />
      )}
      
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
      ) : error && !(!selectedCompanyId || isDevMode || (!companyProfile && !isTransitioning)) ? (
        <Card className="p-6">
          <div className="text-red-500">{error}</div>
        </Card>
      ) : (
        <>
          {(!selectedCompanyId || isDevMode || (!companyProfile && !isTransitioning)) && (
            <Card className="p-6 transition-all duration-500 ease-in-out">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">
                    {isDevMode ? 'Dev Mode: Company Setup' : !selectedCompanyId ? 'Welcome! Let\'s set up your company' : 'Company Setup'}
                  </h2>
                  <p className="text-muted-foreground">
                    Get started by setting up your company profile
                  </p>
                </div>
                <CompanySetup 
                  accountId={accountId}
                  onCompanyCreate={handleCompanyCreate}
                  onComplete={() => {
                    console.log('GenerateAnalysis: onComplete called')
                    handleTransitionStart()
                    handleSetupComplete()
                  }}
                  onTransitionStart={handleTransitionStart}
                />
              </div>
            </Card>
          )}

          {showNewContent && companyProfile && (
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