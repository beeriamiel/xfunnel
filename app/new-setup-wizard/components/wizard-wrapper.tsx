'use client'

import { useWizard } from '../context'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'
import type { WizardStep } from '../types'
import { useCallback } from 'react'

const steps: Array<{ id: WizardStep; title: string }> = [
  { id: 'company', title: 'Company' },
  { id: 'products', title: 'Products' },
  { id: 'competitors', title: 'Competitors' },
  { id: 'icps', title: 'ICPs' },
  { id: 'personas', title: 'Personas' },
  { id: 'review', title: 'Review' }
]

interface WizardWrapperProps {
  children: React.ReactNode
  onReviewSubmit?: () => Promise<void>
}

export function WizardWrapper({ children, onReviewSubmit }: WizardWrapperProps) {
  const { currentStep, nextStep, prevStep, isStepComplete, isLoading, error, isTransitioning } = useWizard()

  const handleNextClick = useCallback(async () => {
    if (currentStep === 'review') {
      if (onReviewSubmit) {
        await onReviewSubmit()
      }
    } else {
      nextStep()
    }
  }, [currentStep, nextStep, onReviewSubmit])

  return (
    <div className="flex flex-col">
      <div className="p-6">
        <div 
          className={cn(
            "transition-opacity duration-150",
            isTransitioning ? "opacity-0" : "opacity-100"
          )}
        >
          {children}
        </div>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>

      {currentStep !== ('company' as WizardStep) && (
        <div className="p-6 bg-gray-50 border-t">
          <div className="flex justify-between items-center max-w-3xl mx-auto">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 'company' || isLoading}
            >
              Previous
            </Button>

            <Button
              onClick={handleNextClick}
              disabled={!isStepComplete(currentStep) || isLoading}
              className="min-w-[100px]"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : currentStep === 'review' ? (
                'Complete'
              ) : (
                'Next'
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
} 