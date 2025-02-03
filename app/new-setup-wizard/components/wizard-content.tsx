'use client'

import { useRef, forwardRef } from 'react'
import { useWizard } from '../context'
import { CompanyStep } from './steps/company-step'
import { ProductStep } from './steps/product-step'
import { CompetitorsStep } from './steps/competitors-step'
import { ICPStep } from './steps/icp-step'
import { PersonasStep } from './steps/personas-step'
import { ReviewStep } from './steps/review-step'

interface WizardContentProps {
  accountId: string
  ref?: React.RefObject<{ handleSubmit: () => Promise<void> }>
}

export const WizardContent = forwardRef<{ handleSubmit: () => Promise<void> }, WizardContentProps>(
  function WizardContent({ accountId }, ref) {
    const { currentStep } = useWizard()

    switch (currentStep) {
      case 'company':
        return <CompanyStep accountId={accountId} />
      case 'products':
        return <ProductStep />
      case 'competitors':
        return <CompetitorsStep />
      case 'icps':
        return <ICPStep />
      case 'personas':
        return <PersonasStep />
      case 'review':
        return <ReviewStep ref={ref} accountId={accountId} />
      default:
        return null
    }
  }
) 