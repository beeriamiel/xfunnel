'use client'

import { useState, ChangeEvent } from 'react'
import { Card } from "@/components/ui/card"
import { StepIndicator } from './step-indicator'
import { InitialStep } from './steps/initial-step'
import { CompetitorStep } from './steps/competitor-step'
import { ICPStep } from './steps/icp-step'
import { PersonaStep } from './steps/persona-step'
import type { CompanySetupProps } from '../../types/setup'
import type { ICP, Persona } from '../../types/analysis'

type Step = 'initial' | 'competitors' | 'icps' | 'personas'
type BusinessType = 'b2b' | 'b2c'

export function CompanySetup({ onComplete, onTransitionStart }: CompanySetupProps) {
  const [step, setStep] = useState<Step>('initial')
  const [companyName, setCompanyName] = useState('')
  const [businessType, setBusinessType] = useState<BusinessType>('b2b')
  const [competitors, setCompetitors] = useState<Array<{ id: string; name: string; website?: string; description?: string }>>([])
  const [icps, setICPs] = useState<ICP[]>([])
  const [personas, setPersonas] = useState<Persona[]>([])

  // Track completed steps using an array instead of Set for better compatibility
  const [completedSteps, setCompletedSteps] = useState<Step[]>([])

  const handleStepComplete = (completedStep: Step, nextStep: Step) => {
    setCompletedSteps(prev => [...prev, completedStep])
    setStep(nextStep)
  }

  const handleStepClick = (selectedStep: Step) => {
    const stepOrder: Step[] = ['initial', 'competitors', 'icps', 'personas']
    const currentStepIndex = stepOrder.indexOf(step)
    const selectedStepIndex = stepOrder.indexOf(selectedStep)

    // Only allow navigation to completed steps or current step
    if (selectedStepIndex <= currentStepIndex) {
      setStep(selectedStep)
    }
  }

  const handleComplete = () => {
    onTransitionStart()
    onComplete(icps, personas)
  }

  const handleAddCompetitor = (competitor: Omit<{ id: string; name: string; website?: string; description?: string }, 'id'>) => {
    setCompetitors([...competitors, { 
      ...competitor, 
      id: Math.random().toString()
    }])
  }

  const handleEditCompetitor = (competitor: { id: string; name: string; website?: string; description?: string }) => {
    setCompetitors(competitors.map(c => 
      c.id === competitor.id ? competitor : c
    ))
  }

  const handleDeleteCompetitor = (id: string) => {
    setCompetitors(competitors.filter(c => c.id !== id))
  }

  const handleAddICP = (icp: Omit<ICP, 'id'>) => {
    const newId = Date.now()
    setICPs([...icps, { 
      ...icp, 
      id: newId
    }])
  }

  const handleEditICP = (icp: ICP) => {
    setICPs(icps.map(i => 
      i.id === icp.id ? icp : i
    ))
  }

  const handleDeleteICP = (id: number) => {
    setICPs(icps.filter(i => i.id !== id))
    // Remove personas associated with this ICP
    setPersonas(personas.filter(p => !icps.find(i => i.id === id)?.personas.some(ip => ip.id === p.id)))
  }

  const handleAddPersona = (persona: Omit<Persona, 'id'>, icpId: string) => {
    const newId = Date.now()
    const newPersona: Persona = { 
      ...persona, 
      id: newId
    }
    setPersonas([...personas, newPersona])
    
    // Add persona to ICP
    setICPs(icps.map(icp => 
      icp.id === parseInt(icpId, 10)
        ? { ...icp, personas: [...icp.personas, newPersona] }
        : icp
    ))
  }

  const handleEditPersona = (persona: Persona) => {
    setPersonas(personas.map(p => 
      p.id === persona.id ? persona : p
    ))
    
    // Update persona in ICPs
    setICPs(icps.map(icp => ({
      ...icp,
      personas: icp.personas.map(p => 
        p.id === persona.id ? persona : p
      )
    })))
  }

  const handleDeletePersona = (id: number) => {
    setPersonas(personas.filter(p => p.id !== id))
    
    // Remove persona from ICPs
    setICPs(icps.map(icp => ({
      ...icp,
      personas: icp.personas.filter(p => p.id !== id)
    })))
  }

  return (
    <div className="flex flex-col items-center w-full space-y-6">
      <StepIndicator 
        currentStep={step} 
        onStepClick={handleStepClick}
      />
      
      {step === 'initial' && (
        <InitialStep
          companyName={companyName}
          businessType={businessType}
          onCompanyNameChange={(e: ChangeEvent<HTMLInputElement>) => setCompanyName(e.target.value)}
          onBusinessTypeChange={setBusinessType}
          onNext={() => handleStepComplete('initial', 'competitors')}
        />
      )}

      {step === 'competitors' && (
        <CompetitorStep
          companyName={companyName}
          competitors={competitors}
          onAddCompetitor={handleAddCompetitor}
          onDeleteCompetitor={handleDeleteCompetitor}
          onNext={() => handleStepComplete('competitors', 'icps')}
        />
      )}

      {step === 'icps' && (
        <ICPStep
          businessType={businessType}
          icps={icps}
          onAddICP={handleAddICP}
          onEditICP={handleEditICP}
          onDeleteICP={handleDeleteICP}
          onNext={() => handleStepComplete('icps', 'personas')}
        />
      )}

      {step === 'personas' && (
        <PersonaStep
          icps={icps}
          personas={personas}
          onAddPersona={handleAddPersona}
          onEditPersona={handleEditPersona}
          onDeletePersona={handleDeletePersona}
          onComplete={handleComplete}
        />
      )}
    </div>
  )
} 