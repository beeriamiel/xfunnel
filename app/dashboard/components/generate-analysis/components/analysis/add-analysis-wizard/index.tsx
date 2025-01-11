'use client'

import { useState, useEffect } from 'react'
import { 
  Dialog, 
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { ICPStep } from './steps/icp-step'
import { PersonaStep } from './steps/persona-step'

type WizardStep = 'icp' | 'persona'

interface AddAnalysisWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplete: () => void
  companyId: number
  existingICPs: Array<{
    id: number
    region: string
    vertical: string
    company_size: string
  }>
  existingPersonas: Array<{
    id: number
    title: string
    department: string
    seniority_level: string
    icp_id: number
  }>
}

interface FormData {
  icp: {
    type: 'existing' | 'new'
    data: {
      id?: number
      region: string
      vertical: string
      company_size: string
    }
  }
  persona: {
    type: 'existing' | 'new'
    data: {
      id?: number
      title: string
      department: string
      seniority_level: string
    }
  }
}

const initialFormData: FormData = {
  icp: {
    type: 'new',
    data: {
      region: '',
      vertical: '',
      company_size: ''
    }
  },
  persona: {
    type: 'new',
    data: {
      title: '',
      department: '',
      seniority_level: ''
    }
  }
}

export function AddAnalysisWizard({ 
  open, 
  onOpenChange,
  onComplete,
  companyId,
  existingICPs = [],
  existingPersonas = []
}: AddAnalysisWizardProps) {
  const [step, setStep] = useState<WizardStep>('icp')
  const [formData, setFormData] = useState<FormData>(initialFormData)

  // Reset states when dialog opens
  useEffect(() => {
    if (open) {
      setStep('icp')
      setFormData(initialFormData)
    }
  }, [open])

  const handleStepComplete = (stepData: any) => {
    setFormData(prev => ({
      ...prev,
      [step]: stepData
    }))

    // Move to next step
    if (step === 'icp') {
      setStep('persona')
    } else {
      handleComplete()
    }
  }

  const handleComplete = () => {
    // TODO: Submit the complete form data
    onComplete()
    onOpenChange(false)
  }

  const getStepTitle = (): string => {
    switch (step) {
      case 'icp':
        return 'Ideal Customer Profile'
      case 'persona':
        return 'Buyer Persona'
      default:
        return ''
    }
  }

  const getStepDescription = (): string => {
    switch (step) {
      case 'icp':
        return 'Define your target customer segment'
      case 'persona':
        return 'Create a buyer persona for your ICP'
      default:
        return ''
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{getStepTitle()}</DialogTitle>
          <DialogDescription>{getStepDescription()}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {step === 'icp' && (
            <ICPStep 
              existingICPs={existingICPs}
              onComplete={handleStepComplete} 
            />
          )}
          {step === 'persona' && (
            <PersonaStep 
              existingPersonas={existingPersonas}
              selectedIcpId={formData.icp?.type === 'existing' ? formData.icp.data.id : undefined}
              onComplete={handleStepComplete} 
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 