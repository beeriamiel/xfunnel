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
import { getCompanyProfile } from './utils/actions'
import type { ICP, Persona } from './types/analysis'
import { createClient } from '@/app/supabase/client'
import { type Step } from './types/setup'
import { motion } from 'framer-motion'
import { CheckCircle, Loader2 } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useRouter } from 'next/navigation'
import { updateCompanySetupCompletion } from '@/lib/services/company'
import React from 'react'

interface GenerateAnalysisProps {
  accountId: string;
  isOnboarding: boolean;
  step?: Step;
  initialProductId?: string;
}

export function GenerateAnalysis({ 
  accountId, 
  isOnboarding: initialIsOnboarding,
  step: initialStep,
  initialProductId
}: GenerateAnalysisProps) {
  console.log('🔵 GenerateAnalysis Render:', {
    accountId,
    initialIsOnboarding,
    initialStep,
    initialProductId,
    selectedCompanyId: useDashboardStore.getState().selectedCompanyId,
    companyProfile: useDashboardStore.getState().companyProfile,
    storeState: useDashboardStore.getState()
  })

  const { 
    selectedCompanyId,
    companyProfile,
    isDevMode,
    onboarding: { isOnboarding, serverCompleted },
    startOnboarding,
    completeOnboarding,
    setCompanyProfile,
    setIsDevMode,
    resetCompanyProfile,
    setSelectedCompanyId,
    setSelectedProductId,
    addCompany,
    syncOnboardingState
  } = useDashboardStore()

  const [isGlobalLoading, setIsGlobalLoading] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false)
  const [showNewContent, setShowNewContent] = useState(false)
  const [hasCompleteAnalysis, setHasCompleteAnalysis] = useState(false)

  // Only show dev mode toggle in development
  const isDevelopment = process.env.NODE_ENV === 'development'

  const supabase = createClient()
  const router = useRouter()

  // Sync with initial onboarding state
  useEffect(() => {
    if (initialIsOnboarding) {
      startOnboarding()
    }
  }, [initialIsOnboarding, startOnboarding])

  // Add logging for product ID
  useEffect(() => {
    if (initialProductId) {
      console.log('🔵 Setting initial product ID:', {
        initialProductId,
        parsedProductId: Number(initialProductId),
        isValidNumber: !isNaN(Number(initialProductId)),
        currentStoreValue: useDashboardStore.getState().selectedProductId
      });
      setSelectedProductId(initialProductId);
    } else {
      console.warn('⚠️ No initial product ID provided');
    }
  }, [initialProductId, setSelectedProductId]);

  // Profile fetching and state management
  useEffect(() => {
    async function fetchCompanyProfile() {
      console.log('🔵 fetchCompanyProfile START:', { 
        selectedCompanyId,
        isLoading,
        showNewContent,
        hasExistingProfile: !!companyProfile?.name,
        isTransitioning,
        isOnboarding,
        serverCompleted
      })
      
      if (!selectedCompanyId) {
        console.log('🟡 No selectedCompanyId, resetting state')
        setShowNewContent(false)
        setIsLoading(false)
        setIsGlobalLoading(false)
        setHasCompleteAnalysis(false)
        return
      }

      // Check if we have valid profile data and not transitioning
      const hasValidProfile = companyProfile?.name && 
        companyProfile.icps?.length > 0 && 
        companyProfile.personas?.length > 0

      if (hasValidProfile && !isTransitioning) {
        console.log('🟢 Using existing valid profile:', { 
          companyName: companyProfile.name,
          icpsCount: companyProfile.icps?.length,
          personasCount: companyProfile.personas?.length,
          isOnboarding,
          serverCompleted
        })
        setShowNewContent(true)
        setIsLoading(false)
        setIsGlobalLoading(false)
        setHasCompleteAnalysis(true)
        return
      }
      
      setIsLoading(true)
      setHasCompleteAnalysis(false)
      try {
        console.log('🟡 Fetching profile for company:', selectedCompanyId)
        const profile = await getCompanyProfile(selectedCompanyId, accountId)
        
        if (!profile) {
          console.log('🔴 No profile received')
          setShowNewContent(false)
          setCompanyProfile(null)
          setError(null)
          setHasCompleteAnalysis(false)
          return
        }

        console.log('🟢 Profile fetched:', { profile })
        
        // Transform API response to match CompanyProfile interface
        const transformedProfile: CompanyProfile = {
          ...profile,
          icps: profile.ideal_customer_profiles || [],
          personas: profile.ideal_customer_profiles?.flatMap(icp => 
            (icp.personas || []).map(persona => ({
              ...persona,
              queries: persona.queries || [],
              icp_id: icp.id
            }))
          ) || [],
          products: profile.products || [],
          competitors: (profile.competitors || []).map(c => ({
            id: String(c.id),
            name: c.competitor_name
          }))
        }

        // Check if we have complete analysis data
        const hasFullData = transformedProfile.icps && 
          transformedProfile.icps.length > 0 && 
          transformedProfile.personas && 
          transformedProfile.personas.length > 0

        console.log('🟢 Setting transformed profile:', {
          hasFullData,
          icpsCount: transformedProfile.icps.length,
          personasCount: transformedProfile.personas.length,
          isOnboarding,
          serverCompleted
        })

        // Sync onboarding state with server
        const isSetupCompleted = 'setup_completed_at' in profile && !!profile.setup_completed_at
        syncOnboardingState(selectedCompanyId, isSetupCompleted)

        setHasCompleteAnalysis(hasFullData)
        setCompanyProfile(transformedProfile)
        setShowNewContent(hasFullData)
        setError(null)
      } catch (error) {
        console.error('🔴 Error fetching profile:', error)
        setError(error instanceof Error ? error.message : 'Failed to fetch company profile')
        // Don't reset profile on error if we have existing data
        if (!companyProfile) {
          setShowNewContent(false)
          setCompanyProfile(null)
          setHasCompleteAnalysis(false)
        } else {
          console.warn('Keeping existing profile data after fetch error')
        }
      } finally {
        setIsLoading(false)
        setIsGlobalLoading(false)
      }
    }

    fetchCompanyProfile()
  }, [selectedCompanyId, accountId, setCompanyProfile, companyProfile, isTransitioning, isOnboarding, serverCompleted, syncOnboardingState])

  const handleCompanyCreate = async (companyName: string) => {
    console.log('🔵 handleCompanyCreate START:', { companyName })
    setIsGlobalLoading(true)
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

      // Set company ID first to trigger profile fetch
      setSelectedCompanyId(company.id)
      addCompany(company)
      
      console.log('🟢 handleCompanyCreate END:', {
        newCompanyId: company.id,
        storeState: useDashboardStore.getState()
      })
      return company
    } catch (error) {
      console.error('🔴 handleCompanyCreate ERROR:', error)
      setIsGlobalLoading(false)
      setIsLoading(false)
      throw error
    }
  }

  const handleSetupComplete = async () => {
    console.log('🔵 handleSetupComplete START:', {
      selectedCompanyId,
      isTransitioning,
      showNewContent
    })
    
    setIsTransitioning(true)
    setIsGlobalLoading(true)
    
    if (selectedCompanyId) {
      try {
        // Update setup completion status
        await updateCompanySetupCompletion(selectedCompanyId)
        
        // Trigger profile refetch by temporarily clearing and resetting company ID
        const currentId = selectedCompanyId
        setSelectedCompanyId(null)
        setTimeout(() => setSelectedCompanyId(currentId), 0)
        
        setShowSuccessAnimation(true)
        completeOnboarding()
      } catch (error) {
        console.error('🔴 Error completing setup:', error)
        setError(error instanceof Error ? error.message : 'Failed to complete setup')
        setIsTransitioning(false)
        setIsGlobalLoading(false)
      }
    }
  }

  const handleTransitionStart = () => {
    console.log('🔵 Starting transition')
    setIsTransitioning(true)
    setIsGlobalLoading(true)
    setShowSuccessAnimation(true)
  }

  const handleAnimationComplete = () => {
    console.log('🟢 Success animation complete, transitioning...')
    setShowSuccessAnimation(false)
    setShowNewContent(true)
    setIsTransitioning(false)
    setIsGlobalLoading(false)
    
    // Redirect with company param to match URL convention
    if (selectedCompanyId) {
      router.push(`/dashboard/generate-analysis?company=${selectedCompanyId}`)
    }
  }

  // Simple loading card with just a spinner and message
  const LoadingCard = () => (
    <Card className="p-6">
      <div className="flex flex-col items-center justify-center min-h-[200px] space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-purple-700" />
        <p className="text-sm text-muted-foreground">Collecting company information...</p>
      </div>
    </Card>
  );

  // Add this effect near the other useEffect hooks
  useEffect(() => {
    const selectedProductId = useDashboardStore.getState().selectedProductId;
    console.log('🔵 ResponseTable productId state:', {
      initialProductId,
      parsedProductId: Number(initialProductId),
      selectedProductId,
      isValidNumber: !isNaN(Number(initialProductId))
    });
  }, [initialProductId]);

  return (
    <div className="h-full space-y-4 p-4 md:p-8 pt-6">
      {isOnboarding && !serverCompleted ? (
        <CompanySetup
          accountId={accountId}
          onCompanyCreate={handleCompanyCreate}
          onComplete={handleSetupComplete}
          onTransitionStart={handleTransitionStart}
        />
      ) : selectedCompanyId && (isGlobalLoading || isLoading) && !showSuccessAnimation ? (
        <div className="space-y-6">
          <LoadingCard />
        </div>
      ) : error ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      ) : (
        <div className="space-y-6">
          {isDevMode && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Development Mode</AlertTitle>
              <AlertDescription>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDevMode(false)}
                >
                  Disable Dev Mode
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <div className="w-full">
            {showSuccessAnimation && (
              <SuccessAnimation onComplete={handleAnimationComplete} />
            )}
            <div className="space-y-6">
              {!isTransitioning && hasCompleteAnalysis && companyProfile?.name ? (
                <React.Fragment key="analysis">
                  <CompanyProfileHeader companyId={selectedCompanyId!} />
                  <ResponseTable 
                    icps={companyProfile?.icps || []}
                    companyId={selectedCompanyId!}
                    accountId={accountId}
                    companyName={companyProfile?.name || ''}
                    productId={useDashboardStore.getState().selectedProductId ? Number(useDashboardStore.getState().selectedProductId) : undefined}
                  />
                </React.Fragment>
              ) : !selectedCompanyId && (
                <CompanySetup 
                  accountId={accountId}
                  onCompanyCreate={handleCompanyCreate}
                  onComplete={handleSetupComplete}
                  onTransitionStart={handleTransitionStart}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}