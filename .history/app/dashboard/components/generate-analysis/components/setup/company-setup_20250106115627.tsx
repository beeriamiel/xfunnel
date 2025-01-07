'use client'

import { useState } from 'react'
import { Card } from "@/components/ui/card"
import { StepIndicator } from './step-indicator'
import { InitialStep } from './steps/initial-step'
import { ProductStep } from './steps/product-step'
import { CompetitorStep } from './steps/competitor-step'
import { ICPStep } from './steps/icp-step'
import { PersonaStep } from './steps/persona-step'
import type { CompanySetupProps, Product, Competitor } from '../../types/setup'
import type { ICP, Persona } from '../../types/analysis'

export function CompanySetup({ onComplete, onTransitionStart }: CompanySetupProps) {
  const [step, setStep] = useState<'initial' | 'product' | 'companyData' | 'icps' | 'personas'>('initial')
  const [isLoading, setIsLoading] = useState(false)
  const [companyName, setCompanyName] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [competitors, setCompetitors] = useState<Competitor[]>([])
  const [icps, setICPs] = useState<ICP[]>([])
  const [personas, setPersonas] = useState<Persona[]>([])

  const handleComplete = () => {
    onTransitionStart()
    onComplete(icps, personas)
  }

  const handleAddProduct = (product: Omit<Product, 'id'>) => {
    setProducts([...products, { 
      ...product, 
      id: crypto.randomUUID()
    }])
  }

  const handleEditProduct = (product: Product) => {
    setProducts(products.map(p => 
      p.id === product.id ? product : p
    ))
  }

  const handleDeleteProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id))
  }

  const handleAddCompetitors = (newCompetitors: Omit<Competitor, 'id'>[]) => {
    const competitorsWithIds = newCompetitors.map(competitor => ({
      ...competitor,
      id: crypto.randomUUID()
    }))
    setCompetitors([...competitors, ...competitorsWithIds])
  }

  return (
    <div className="flex flex-col items-center w-full space-y-6">
      <StepIndicator currentStep={step} isLoading={isLoading} />
      
      {step === 'initial' && (
        <InitialStep
          companyName={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          onNext={() => setStep('product')}
        />
      )}

      {step === 'product' && (
        <ProductStep
          products={products}
          onAddProduct={handleAddProduct}
          onEditProduct={handleEditProduct}
          onDeleteProduct={handleDeleteProduct}
          onNext={() => setStep('companyData')}
        />
      )}

      {step === 'companyData' && (
        <CompetitorStep
          competitors={competitors}
          onAddCompetitors={handleAddCompetitors}
          onNext={() => setStep('icps')}
        />
      )}

      {step === 'icps' && (
        <ICPStep
          icps={icps}
          onAddICP={(icp) => setICPs([...icps, { ...icp, id: crypto.randomUUID(), personas: [] }])}
          onEditICP={(icp) => setICPs(icps.map(i => i.id === icp.id ? icp : i))}
          onDeleteICP={(id) => setICPs(icps.filter(i => i.id !== id))}
          onNext={() => setStep('personas')}
        />
      )}

      {step === 'personas' && (
        <PersonaStep
          personas={personas}
          onAddPersona={(persona) => setPersonas([...personas, { ...persona, id: crypto.randomUUID() }])}
          onEditPersona={(persona) => setPersonas(personas.map(p => p.id === persona.id ? persona : p))}
          onDeletePersona={(id) => setPersonas(personas.filter(p => p.id !== id))}
          onComplete={handleComplete}
        />
      )}
    </div>
  )
} 