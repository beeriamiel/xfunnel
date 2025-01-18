'use client'

import { createClient } from '@/app/supabase/client'
import { useState, ChangeEvent, FormEvent, useEffect } from 'react'
import { Card } from "@/components/ui/card"
import { StepIndicator } from './step-indicator'
import { InitialStep } from './steps/initial-step'
import { ProductStep } from './steps/product-step'
import { CompetitorStep } from './steps/competitor-step'
import { ICPStep } from './steps/icp-step'
import { PersonaStep } from './steps/persona-step'
import type { CompanySetupProps, Product, InitialFormData } from '../../types/setup'
import type { ICP, Persona } from '../../types/analysis'
import { useSearchParams, useRouter } from 'next/navigation'
import { type Step } from '../../types/setup'
import { useDashboardStore } from '@/app/dashboard/store'

export function CompanySetup({ 
  accountId,
  onCompanyCreate,
  onComplete,
  onTransitionStart 
}: CompanySetupProps) {
  const supabase = createClient()
  const searchParams = useSearchParams()
  const router = useRouter()

  console.log('🔵 CompanySetup Render:', {
    accountId,
    currentWizardStep: useDashboardStore.getState().currentWizardStep,
    completedSteps: useDashboardStore.getState().completedSteps,
    searchParams: Object.fromEntries(searchParams?.entries() || [])
  })

  const { 
    currentWizardStep,
    completedSteps,
    setWizardStep,
    completeStep,
    setSelectedCompanyId
  } = useDashboardStore()

  const [companyName, setCompanyName] = useState('')
  const [industry, setIndustry] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [competitors, setCompetitors] = useState<Array<{ id: string; name: string; website?: string; description?: string }>>([])
  const [icps, setICPs] = useState<ICP[]>([])
  const [personas, setPersonas] = useState<Persona[]>([])

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const urlCompanyId = searchParams.get('companyId')
  const [companyId, setCompanyId] = useState<number | null>(() => 
    urlCompanyId ? parseInt(urlCompanyId, 10) : null
  )

  useEffect(() => {
    const stepFromUrl = searchParams.get('step') as Step
    const urlCompanyId = searchParams.get('companyId')
    
    // If we have a companyId in URL but not in state, fetch it
    if (urlCompanyId && !companyId) {
      const fetchCompany = async () => {
        const { data: company } = await supabase
          .from('companies')
          .select('*')
          .eq('id', urlCompanyId)
          .single()
        
        if (company) {
          setCompanyId(parseInt(urlCompanyId, 10))
          setCompanyName(company.name)
          setWizardStep(stepFromUrl || 'initial')
        }
      }
      fetchCompany()
    }
    // Only update step if we have companyId and a step in URL
    else if (stepFromUrl && companyId) {
      setWizardStep(stepFromUrl)
    }
    // Force initial step if no company
    else if (!companyId) {
      setWizardStep('initial')
    }
  }, [searchParams, companyId, setWizardStep])

  useEffect(() => {
    async function fetchExistingCompany() {
      const { data: companies, error } = await supabase
        .from('companies')
        .select('id, name')
        .eq('account_id', accountId)
        .limit(1)
        .single()

      if (companies && !error) {
        console.log('Found existing company:', companies)
        setCompanyId(companies.id)
        setCompanyName(companies.name)
      }
    }

    if (accountId && !companyId) {
      fetchExistingCompany()
    }
  }, [accountId, companyId])

  const handleInitialSubmit = async (companyName: string) => {
    console.log('🔵 handleInitialSubmit START:', { companyName })
    setIsLoading(true)
    try {
      console.log('🟡 Creating company...')
      const company = await onCompanyCreate(companyName)
      console.log('🟢 Company created:', company)
      
      // Update all state synchronously
      setCompanyName(companyName)
      setCompanyId(company.id)
      setSelectedCompanyId(company.id)
      setWizardStep('product')
      
      // Then update URL
      const params = new URLSearchParams()
      params.set('step', 'product')
      params.set('companyId', company.id.toString())
      await router.push(`/dashboard/generate-analysis?${params.toString()}`)
      
      // Finally complete the step
      completeStep('initial', 'product')

      console.log('🟢 All state updated:', {
        companyId: company.id,
        step: 'product',
        storeState: useDashboardStore.getState()
      })
    } catch (error) {
      console.error('🔴 handleInitialSubmit ERROR:', error)
      setError(error instanceof Error ? error.message : 'Failed to create company')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStepComplete = (completedStep: Step, nextStep: Step) => {
    if (!companyId && nextStep !== 'initial') {
      console.error('Cannot proceed without company ID')
      return
    }
    
    completeStep(completedStep, nextStep)
    const params = new URLSearchParams(searchParams.toString())
    params.set('step', nextStep)
    params.set('companyId', companyId!.toString())
    router.push(`/dashboard/generate-analysis?${params.toString()}`, {
      scroll: false
    })
  }

  const handleComplete = () => {
    completeStep('personas', 'personas')
    onComplete()
  }

  const handleAddProduct = async (product: Omit<Product, "id">) => {
    console.log('🔵 handleAddProduct START:', { product, companyId })
    
    if (!companyId) {
      console.error('🔴 No companyId found')
      return
    }

    try {
      // First get the company to check if it exists
      const { data: company, error: selectError } = await supabase
        .from('companies')
        .select('*')  // Change to select specific fields we need
        .eq('id', companyId)
        .eq('account_id', accountId) // Add this to ensure ownership
        .single()
      
      console.log('🟡 Current company data:', { company, selectError })

      if (selectError) {
        console.error('🔴 Error fetching company:', selectError)
        return
      }

      // Create new product with ID
      const newProduct = { 
        id: Date.now().toString(),
        name: product.name,
        businessModel: product.businessModel,
        description: product.description || ''
      }

      // Update local state first for optimistic UI
      setProducts(prev => [...prev, newProduct])
      
      // Prepare the update payload
      const mainProducts = company.main_products || []
      const updatedMainProducts = [...mainProducts, newProduct]
      
      console.log('🟡 Updating with:', { updatedMainProducts })
      
      const { error: updateError } = await supabase
        .from('companies')
        .update({ main_products: updatedMainProducts })
        .eq('id', companyId)
        .eq('account_id', accountId) // Add this to ensure ownership

      if (updateError) {
        console.error('🔴 Failed to save product:', updateError)
        // Rollback local state if save failed
        setProducts(prev => prev.filter(p => p.id !== newProduct.id))
        return
      }
      
      console.log('🟢 Product added successfully:', newProduct)
    } catch (error) {
      console.error('🔴 handleAddProduct ERROR:', error)
      throw error
    }
  }

  const handleEditProduct = async (product: Product) => {
    if (!companyId) return
    const { data: company } = await supabase
      .from('companies')
      .select('main_products')
      .eq('id', companyId)
      .single()

    if (company) {
      const updatedProducts = company.main_products?.map(p => 
        p === product.id ? product.name : p
      ) ?? []
      
      const { error } = await supabase
        .from('companies')
        .update({ main_products: updatedProducts })
        .eq('id', companyId)

      if (!error) {
        setProducts(products.map(p => p.id === product.id ? product : p))
      }
    }
  }

  const handleDeleteProduct = async (id: string) => {
    if (!companyId) return
    const { data: company } = await supabase
      .from('companies')
      .select('main_products')
      .eq('id', companyId)
      .single()

    if (company) {
      const updatedProducts = company.main_products?.filter(p => p !== id) ?? []
      const { error } = await supabase
        .from('companies')
        .update({ main_products: updatedProducts })
        .eq('id', companyId)

      if (!error) {
        setProducts(products.filter(p => p.id !== id))
      }
    }
  }

  const handleAddCompetitor = async (competitor: { name: string }) => {
    if (!companyId) return;
    
    const { data: newCompetitor, error } = await supabase
      .from('competitors')
      .insert({
        company_id: companyId,
        competitor_name: competitor.name
      })
      .select()
      .single()

    if (!error) {
      setCompetitors([...competitors, { 
        id: newCompetitor.id.toString(),
        name: competitor.name 
      }])
    }
  }

  const handleEditCompetitor = async (competitor: { id: string; name: string }) => {
    if (!companyId) return
    const { error } = await supabase
      .from('competitors')
      .update({ competitor_name: competitor.name })
      .eq('company_id', companyId)
      .eq('id', competitor.id)

    if (!error) {
      setCompetitors(competitors.map(c => 
        c.id === competitor.id ? competitor : c
      ))
    }
  }

  const handleDeleteCompetitor = async (id: string) => {
    if (!companyId) return
    const { error } = await supabase
      .from('competitors')
      .delete()
      .eq('id', id)
      .eq('company_id', companyId)

    if (!error) {
      setCompetitors(competitors.filter(c => c.id !== id))
    }
  }

  const handleAddICP = async (icp: Omit<ICP, "id">) => {
    const { data: newICP, error } = await supabase
      .from('ideal_customer_profiles')
      .insert({
        company_id: companyId,
        account_id: accountId,
        vertical: icp.vertical,
        region: icp.region,
        company_size: icp.company_size
      })
      .select()
      .single()

    if (!error) {
      setICPs([...icps, { ...icp, id: newICP.id }])
    }
  }

  const handleEditICP = async (icp: ICP) => {
    if (!companyId) return
    const { error } = await supabase
      .from('ideal_customer_profiles')
      .update({
        vertical: icp.vertical,
        region: icp.region,
        company_size: icp.company_size
      })
      .eq('id', icp.id)
      .eq('company_id', companyId)

    if (!error) {
      setICPs(icps.map(i => i.id === icp.id ? icp : i))
    }
  }

  const handleDeleteICP = async (id: number) => {
    if (!companyId) return
    const { error } = await supabase
      .from('ideal_customer_profiles')
      .delete()
      .eq('id', id)
      .eq('company_id', companyId)

    if (!error) {
      setICPs(icps.filter(i => i.id !== id))
      // Keep existing persona cleanup
      setPersonas(personas.filter(p => !icps.find(i => i.id === id)?.personas.some(ip => ip.id === p.id)))
    }
  }

  const handleAddPersona = async (persona: Omit<Persona, 'id'>, icpId: string) => {
    if (!companyId) return
    
    const { data: newPersona, error } = await supabase
      .from('personas')
      .insert({
        title: persona.title,
        icp_id: parseInt(icpId, 10),
        account_id: accountId,
        seniority_level: persona.seniority_level,
        department: persona.department
      })
      .select()
      .single()

    if (!error && newPersona) {
      const personaWithId: Persona = { 
        ...persona, 
        id: newPersona.id
      }
      setPersonas([...personas, personaWithId])
      
      // Add persona to ICP
      setICPs(icps.map(icp => 
        icp.id === parseInt(icpId, 10)
          ? { ...icp, personas: [...icp.personas, personaWithId] }
          : icp
      ))
    }
  }

  const handleEditPersona = async (persona: Persona) => {
    if (!companyId) return
    
    const { error } = await supabase
      .from('personas')
      .update({
        title: persona.title,
        seniority_level: persona.seniority_level,
        department: persona.department
      })
      .eq('id', persona.id)

    if (!error) {
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
  }

  const handleDeletePersona = async (id: number) => {
    if (!companyId) return
    
    const { error } = await supabase
      .from('personas')
      .delete()
      .eq('id', id)

    if (!error) {
      setPersonas(personas.filter(p => p.id !== id))
      
      // Remove persona from ICPs
      setICPs(icps.map(icp => ({
        ...icp,
        personas: icp.personas.filter(p => p.id !== id)
      })))
    }
  }

  useEffect(() => {
    console.log('CompanyId changed to:', companyId)
  }, [companyId])

  return (
    <div className="flex flex-col items-center w-full space-y-6">
      <StepIndicator 
        currentStep={currentWizardStep}
        completedSteps={completedSteps}
        onStepClick={(step) => {
          if (!companyId && step !== 'initial') return
          setWizardStep(step)
        }}
      />
      
      {!companyId ? (
        <InitialStep
          accountId={accountId}
          onNext={handleInitialSubmit}
        />
      ) : (
        <>
          {currentWizardStep === 'product' && (
            <ProductStep
              products={products}
              onAddProduct={handleAddProduct}
              onEditProduct={handleEditProduct}
              onDeleteProduct={handleDeleteProduct}
              onNext={() => handleStepComplete('product', 'competitors')}
            />
          )}

          {currentWizardStep === 'competitors' && (
            <CompetitorStep
              companyName={companyName}
              products={products}
              competitors={competitors}
              onAddCompetitor={handleAddCompetitor}
              onDeleteCompetitor={handleDeleteCompetitor}
              onNext={() => handleStepComplete('competitors', 'icps')}
            />
          )}

          {currentWizardStep === 'icps' && (
            <ICPStep
              industry={industry}
              products={products}
              icps={icps}
              onAddICP={handleAddICP}
              onEditICP={handleEditICP}
              onDeleteICP={handleDeleteICP}
              onNext={() => handleStepComplete('icps', 'personas')}
            />
          )}

          {currentWizardStep === 'personas' && (
            <PersonaStep
              icps={icps}
              personas={personas}
              onAddPersona={handleAddPersona}
              onEditPersona={handleEditPersona}
              onDeletePersona={handleDeletePersona}
              onComplete={handleComplete}
            />
          )}
        </>
      )}
    </div>
  )
} 