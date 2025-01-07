'use client'

import { useState } from 'react'
import { Card } from "@/components/ui/card"
import { StepIndicator } from './step-indicator'
import { InitialStep } from './steps/initial-step'
import { ProductStep } from './steps/product-step'
import { CompetitorStep } from './steps/competitor-step'
import { ICPStep } from './steps/icp-step'
import { PersonaStep } from './steps/persona-step'
import type { CompanySetupProps } from '../../types/setup'
import type { ICP, Persona } from '../../types/analysis'

export function CompanySetup({ onComplete, onTransitionStart }: CompanySetupProps) {
  const [step, setStep] = useState<'initial' | 'product' | 'competitors' | 'icps' | 'personas'>('initial')
  const [companyName, setCompanyName] = useState('')
  const [industry, setIndustry] = useState('')
  const [products, setProducts] = useState<Array<{ id: string; name: string }>>([])
  const [competitors, setCompetitors] = useState<Array<{ id: string; name: string; website?: string; description?: string }>>([])
  const [icps, setICPs] = useState<ICP[]>([])
  const [personas, setPersonas] = useState<Persona[]>([])

  const handleComplete = () => {
    onTransitionStart()
    onComplete(icps, personas)
  }

  const handleAddProduct = (product: Omit<{ id: string; name: string }, 'id'>) => {
    setProducts([...products, { 
      ...product, 
      id: crypto.randomUUID()
    }])
  }

  const handleEditProduct = (product: { id: string; name: string }) => {
    setProducts(products.map(p => 
      p.id === product.id ? product : p
    ))
  }

  const handleDeleteProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id))
  }

  const handleAddCompetitor = (competitor: Omit<{ id: string; name: string; website?: string; description?: string }, 'id'>) => {
    setCompetitors([...competitors, { 
      ...competitor, 
      id: crypto.randomUUID()
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
    setICPs([...icps, { 
      ...icp, 
      id: crypto.randomUUID()
    }])
  }

  const handleEditICP = (icp: ICP) => {
    setICPs(icps.map(i => 
      i.id === icp.id ? icp : i
    ))
  }

  const handleDeleteICP = (id: string) => {
    setICPs(icps.filter(i => i.id !== id))
    // Remove personas associated with this ICP
    setPersonas(personas.filter(p => !icps.find(i => i.id === id)?.personas.some(ip => ip.id === p.id)))
  }

  const handleAddPersona = (persona: Omit<Persona, 'id'>, icpId: string) => {
    const newPersona = { 
      ...persona, 
      id: crypto.randomUUID()
    }
    setPersonas([...personas, newPersona])
    
    // Add persona to ICP
    setICPs(icps.map(icp => 
      icp.id === icpId 
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

  const handleDeletePersona = (id: string) => {
    setPersonas(personas.filter(p => p.id !== id))
    
    // Remove persona from ICPs
    setICPs(icps.map(icp => ({
      ...icp,
      personas: icp.personas.filter(p => p.id !== id)
    })))
  }

  return (
    <div className="flex flex-col items-center w-full space-y-6">
      <StepIndicator currentStep={step} />
      
      {step === 'initial' && (
        <InitialStep
          companyName={companyName}
          industry={industry}
          onCompanyNameChange={(e) => setCompanyName(e.target.value)}
          onIndustryChange={(e) => setIndustry(e.target.value)}
          onNext={() => setStep('product')}
        />
      )}

      {step === 'product' && (
        <ProductStep
          products={products}
          onAddProduct={handleAddProduct}
          onEditProduct={handleEditProduct}
          onDeleteProduct={handleDeleteProduct}
          onNext={() => setStep('competitors')}
        />
      )}

      {step === 'competitors' && (
        <CompetitorStep
          companyName={companyName}
          products={products}
          competitors={competitors}
          onAddCompetitor={handleAddCompetitor}
          onEditCompetitor={handleEditCompetitor}
          onDeleteCompetitor={handleDeleteCompetitor}
          onNext={() => setStep('icps')}
        />
      )}

      {step === 'icps' && (
        <ICPStep
          industry={industry}
          products={products}
          icps={icps}
          onAddICP={handleAddICP}
          onEditICP={handleEditICP}
          onDeleteICP={handleDeleteICP}
          onNext={() => setStep('personas')}
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