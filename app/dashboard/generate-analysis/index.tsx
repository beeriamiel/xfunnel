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

interface GenerateAnalysisProps {
  accountId: string;
  isOnboarding: boolean;
  step?: Step;
}

export function GenerateAnalysis({ 
  accountId, 
  isOnboarding: initialIsOnboarding,
  step: initialStep 
}: GenerateAnalysisProps) {
  console.log('🔵 GenerateAnalysis Render:', {
    accountId,
    initialIsOnboarding,
    initialStep,
    selectedCompanyId: useDashboardStore.getState().selectedCompanyId,
    companyProfile: useDashboardStore.getState().companyProfile,
    storeState: useDashboardStore.getState()
  })

  const { 
    selectedCompanyId,
    companyProfile,
    isDevMode,
    onboarding: { isOnboarding },
    startOnboarding,
    completeOnboarding,
    setCompanyProfile,
    setIsDevMode,
    resetCompanyProfile,
    setSelectedCompanyId,
    addCompany
  } = useDashboardStore()

  const [isGlobalLoading, setIsGlobalLoading] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false)
  const [showNewContent, setShowNewContent] = useState(false)
  const [currentStep, setCurrentStep] = useState<Step | undefined>(initialStep)
  const [hasCompleteAnalysis, setHasCompleteAnalysis] = useState(false)

  // Only show dev mode toggle in development
  const isDevelopment = process.env.NODE_ENV === 'development'

  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    if (initialIsOnboarding) {
      startOnboarding()
    }
  }, [initialIsOnboarding, startOnboarding])

  useEffect(() => {
    setCurrentStep(initialStep)
  }, [initialStep])

  useEffect(() => {
    async function fetchCompanyProfile() {
      console.log('🔵 fetchCompanyProfile START:', { 
        selectedCompanyId,
        isLoading,
        showNewContent,
        hasExistingProfile: !!companyProfile?.name
      })
      
      if (!selectedCompanyId) {
        console.log('🟡 No selectedCompanyId, resetting state')
        setShowNewContent(false)
        setIsLoading(false)
        setIsGlobalLoading(false)
        setHasCompleteAnalysis(false)
        return
      }

      // Skip fetching if we already have the profile data for this company
      if (companyProfile?.name && !isTransitioning) {
        console.log('🟢 Using existing profile data:', { 
          companyName: companyProfile.name,
          icpsCount: companyProfile.icps?.length,
          personasCount: companyProfile.personas?.length
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
        
        console.log('🟢 Profile fetched:', { profile })
        if (profile && Object.keys(profile).length > 0) {
          // Transform API response to match CompanyProfile interface
          const transformedProfile: CompanyProfile = {
            ...profile,
            icps: profile.ideal_customer_profiles || [],
            personas: profile.ideal_customer_profiles?.flatMap(icp => icp.personas || []) || [],
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

          setHasCompleteAnalysis(hasFullData)
          setCompanyProfile(transformedProfile)
          setShowNewContent(hasFullData)
          setError(null)
        } else {
          setShowNewContent(false)
          setCompanyProfile(null)
          setError(null)
          setHasCompleteAnalysis(false)
        }
      } catch (error) {
        console.error('🔴 Error fetching profile:', error)
        setError(error instanceof Error ? error.message : 'Failed to fetch company profile')
        setShowNewContent(false)
        setCompanyProfile(null)
        setHasCompleteAnalysis(false)
      } finally {
        setIsLoading(false)
        // Only turn off global loading if we have complete analysis or there's an error
        setIsGlobalLoading(!hasCompleteAnalysis && !error)
      }
    }

    fetchCompanyProfile()
  }, [selectedCompanyId, setCompanyProfile])

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

      // Additional company data fetching
      const profileResponse = await fetch(`/api/companies/${company.id}/profile`)
      if (!profileResponse.ok) {
        console.warn('⚠️ Could not fetch company profile:', await profileResponse.text())
      } else {
        const profile = await profileResponse.json()
        console.log('🟢 Company profile fetched:', profile)
      }
      
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
        console.log('🟡 Fetching final company profile...')
        const profile = await getCompanyProfile(selectedCompanyId, accountId)
        if (profile) {
          console.log('🟡 Transforming profile:', profile)
          const transformedProfile: CompanyProfile = {
            ...profile,
            icps: profile.ideal_customer_profiles || [],
            personas: profile.ideal_customer_profiles?.flatMap(icp => icp.personas || []) || [],
            products: profile.products || [],
            competitors: (profile.competitors || []).map(c => ({
              id: String(c.id),
              name: c.competitor_name
            }))
          }

          // Check if we have complete data
          const hasFullData = transformedProfile.icps && 
            transformedProfile.icps.length > 0 && 
            transformedProfile.personas && 
            transformedProfile.personas.length > 0

          console.log('🟢 Setting transformed profile:', transformedProfile)
          setCompanyProfile(transformedProfile)
          setHasCompleteAnalysis(hasFullData)
          setError(null)
        }
      } catch (error) {
        console.error('🔴 Error fetching final profile:', error)
        setError(error instanceof Error ? error.message : 'Failed to fetch company profile')
        // Even if there's an error, we want to complete the transition
        setHasCompleteAnalysis(true) // Force complete to avoid stuck loading state
      }
    }
    
    console.log('🟡 Starting success animation...')
    setShowSuccessAnimation(true)
    completeOnboarding()
  }

  const handleTransitionStart = () => {
    setIsTransitioning(true)
    setIsGlobalLoading(true)
    setShowSuccessAnimation(true)
  }

  const handleAnimationComplete = () => {
    console.log('🟡 Success animation complete, transitioning...')
    setShowSuccessAnimation(false)
    setShowNewContent(true)
    setIsTransitioning(false)
    setIsGlobalLoading(false)
    setHasCompleteAnalysis(true) // Ensure loading state is cleared
    
    // Redirect with companyId
    if (selectedCompanyId) {
      router.push(`/dashboard/generate-analysis?companyId=${selectedCompanyId}`)
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

  return (
    <div className="h-full py-6">
      {isOnboarding ? (
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
                <>
                  <CompanyProfileHeader companyId={selectedCompanyId!} />
                  <ResponseTable 
                    icps={companyProfile?.icps || []}
                    companyId={selectedCompanyId!}
                    accountId={accountId}
                    companyName={companyProfile?.name || ''}
                  />
                </>
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