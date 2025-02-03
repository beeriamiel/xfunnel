'use client'

import { useState } from 'react'
import { useWizard } from '../../context'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { generateCompanyData } from '../../services/company-generation'
import type { GenerationProgress } from '../../types'
import AiButton from '@/app/components/animata/button/ai-button'
import AnimatedProgress from '@/components/animata/graphs/progress'

const PROGRESS_STEPS = [
  { progress: 30, message: "Analyzing company name...", step: "1" },
  { progress: 60, message: "Generating company profile...", step: "2" },
  { progress: 90, message: "Finalizing details...", step: "3" },
  { progress: 98, message: "Almost there...", step: "4" }
];

const TOTAL_DURATION = 20000; // 20 seconds

interface CompanyStepProps {
  accountId: string
}

export function CompanyStep({ accountId }: CompanyStepProps) {
  const { 
    dispatch, 
    companyName, 
    isLoading,
    isGenerating,
    generationProgress,
    nextStep 
  } = useWizard()
  const [validationError, setValidationError] = useState<string | null>(null)

  const handleCompanyNameChange = (value: string) => {
    dispatch({ type: 'SET_COMPANY_NAME', payload: value })
    setValidationError(null)
  }

  const simulateProgress = async () => {
    const stepDuration = TOTAL_DURATION / PROGRESS_STEPS.length;
    
    for (const step of PROGRESS_STEPS) {
      await new Promise(resolve => setTimeout(resolve, stepDuration));
      dispatch({
        type: 'UPDATE_GENERATION_PROGRESS',
        payload: {
          progress: step.progress,
          message: step.message,
          step: step.step
        }
      });
    }
  }

  const handleGenerate = async () => {
    if (!companyName) return

    try {
      dispatch({ type: 'START_GENERATION' })
      
      // Start progress simulation
      simulateProgress();
      
      // Make the actual API call
      const data = await generateCompanyData(
        companyName,
        accountId,
        () => {} // We're using our simulated progress instead
      )

      // Ensure we show 100% at the end
      dispatch({
        type: 'UPDATE_GENERATION_PROGRESS',
        payload: {
          progress: 100,
          message: "Company profile created!",
          step: "5"
        }
      });

      // Short delay before moving to next step
      await new Promise(resolve => setTimeout(resolve, 500));
      
      dispatch({ type: 'SET_GENERATED_DATA', payload: data })
      nextStep()
    } catch (error) {
      if (error instanceof Error) {
        dispatch({ type: 'SET_ERROR', payload: error.message })
      }
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="companyName">Company Name</Label>
          <Input
            id="companyName"
            value={companyName}
            onChange={(e) => handleCompanyNameChange(e.target.value)}
            placeholder="Enter your company name"
            disabled={isGenerating}
          />
        </div>

        {validationError && (
          <Alert variant="destructive">
            <AlertDescription>{validationError}</AlertDescription>
          </Alert>
        )}

        {!isGenerating && companyName && (
          <div className="flex justify-center">
            <AiButton
              onClick={handleGenerate}
              disabled={!companyName}
            >
              Create Company
            </AiButton>
          </div>
        )}
      </div>

      {isGenerating && generationProgress && (
        <div className="space-y-4">
          <AnimatedProgress progress={generationProgress.progress} />
          <div className="text-sm text-muted-foreground text-center">
            {generationProgress.message}
          </div>
        </div>
      )}
    </div>
  )
} 