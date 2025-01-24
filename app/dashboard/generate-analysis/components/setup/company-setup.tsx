'use client'

import { createClient } from '@/app/supabase/client'
import { useState, ChangeEvent, FormEvent, useEffect } from 'react'
import { Card } from "@/components/ui/card"
import { CompletedStepChip } from './completed-step-chip'
import { InitialStep } from './steps/initial-step'
import { ProductStep } from './steps/product-step'
import { CompetitorStep } from './steps/competitor-step'
import { ICPStep } from './steps/icp-step'
import { PersonaStep } from './steps/persona-step'
import type { CompanySetupProps, Product, InitialFormData, ICPBase } from '../../types/setup'
import type { ICP, Persona } from '../../types/analysis'
import type { CompletedStep } from '../../types/shared'
import { useSearchParams, useRouter } from 'next/navigation'
import { type Step } from '../../types/setup'
import { useDashboardStore } from '@/app/dashboard/store'
import { generateInitialICPsAction } from "@/app/company-actions"

// Add type definitions at the top
type ProductChip = {
  id: string
  name: string
  businessModel: "B2B" | "B2C"
}

type CompetitorChip = {
  id: string
  name: string
}

type ICPChip = ICPBase

type PersonaChip = {
  id: number
  title: string
  icp_id: number
  seniority_level: string
  department: string
}

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
  const [productChips, setProductChips] = useState<ProductChip[]>([])
  const [competitorChips, setCompetitorChips] = useState<CompetitorChip[]>([])
  const [icpChips, setICPChips] = useState<ICPChip[]>([])
  const [personaChips, setPersonaChips] = useState<PersonaChip[]>([])

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const urlCompanyId = searchParams.get('companyId')
  const [companyId, setCompanyId] = useState<number | null>(() => 
    urlCompanyId ? parseInt(urlCompanyId, 10) : null
  )

  // Log state changes for chips
  useEffect(() => {
    console.log('🟡 CompanySetup chips state changed:', {
      productChips,
      competitorChips,
      icpChips,
      personaChips
    })
  }, [productChips, competitorChips, icpChips, personaChips])

  // Log step changes
  useEffect(() => {
    console.log('🟡 CompanySetup step changed:', {
      currentWizardStep,
      completedSteps
    })
  }, [currentWizardStep, completedSteps])

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
      
      // Add ICP Generation
      console.log('🟡 Generating initial ICPs...')
      await generateInitialICPsAction(companyName, accountId)
      console.log('🟢 Initial ICPs generated')
      
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
    console.log('🟡 CompanySetup handleStepComplete:', { completedStep, nextStep })
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
    console.log('🟢 CompanySetup step completed:', { completedStep, nextStep })
  }

  const handleComplete = () => {
    completeStep('personas', 'personas')
    onTransitionStart()
    onComplete()
  }

  const handleAddProduct = async (product: Product) => {
    if (!companyId) {
      console.error('🔴 No companyId found')
      return
    }

    console.log('🟡 CompanySetup handleAddProduct:', product)
    try {
      setProductChips(prev => {
        const newChips = [...prev, { 
          id: product.id,
          name: product.name,
          businessModel: product.businessModel
        }]
        console.log('🟢 CompanySetup updated productChips:', newChips)
        return newChips
      })
    } catch (error) {
      console.error('🔴 handleAddProduct ERROR:', error)
      throw error
    }
  }

  const handleEditProduct = async (product: Product) => {
    if (!companyId) return
    setProductChips(chips => 
      chips.map(p => p.id === product.id ? { 
        id: product.id, 
        name: product.name,
        businessModel: product.businessModel 
      } : p)
    )
  }

  const handleDeleteProduct = async (id: string) => {
    if (!companyId) return
    setProductChips(chips => chips.filter(p => p.id !== id))
  }

  const handleAddCompetitor = async (competitor: { id?: string; name: string }) => {
    if (!companyId) return;
    
    console.log('🟡 CompanySetup handleAddCompetitor:', competitor)
    try {
      const existingCompetitor = competitorChips.find(c => c.id === competitor.id)
      if (existingCompetitor) {
        console.log('🟡 Competitor already exists:', competitor)
        return
      }

      setCompetitorChips(prev => {
        const newChips = [...prev, { 
          id: competitor.id!,
          name: competitor.name 
        }]
        console.log('🟢 CompanySetup updated competitorChips:', newChips)
        return newChips
      })
    } catch (error) {
      console.error('🔴 handleAddCompetitor ERROR:', error)
      throw error
    }
  }

  const handleEditCompetitor = async (competitor: { id: string; name: string }) => {
    if (!companyId) return
    setCompetitorChips(chips => 
      chips.map(c => c.id === competitor.id ? { 
        id: competitor.id, 
        name: competitor.name 
      } : c)
    )
  }

  const handleDeleteCompetitor = async (id: string) => {
    if (!companyId) return
    setCompetitorChips(chips => chips.filter(c => c.id !== id))
  }

  const handleAddICP = async (icp: ICPBase) => {
    if (!companyId) return;
    
    console.log('🟡 CompanySetup handleAddICP:', icp)
    try {
      setICPChips(prev => {
        const newChips = [...prev, { 
          id: icp.id,
          vertical: icp.vertical,
          region: icp.region,
          company_size: icp.company_size,
          personas: []
        }]
        console.log('🟢 CompanySetup updated icpChips:', newChips)
        return newChips
      })
    } catch (error) {
      console.error('🔴 handleAddICP ERROR:', error)
      throw error
    }
  }

  const handleEditICP = async (icp: ICPBase) => {
    if (!companyId) return
    setICPChips(chips => 
      chips.map(i => i.id === icp.id ? {
        id: icp.id,
        vertical: icp.vertical,
        region: icp.region,
        company_size: icp.company_size,
        personas: i.personas
      } : i)
    )
  }

  const handleDeleteICP = async (id: number) => {
    if (!companyId) return
    setICPChips(chips => chips.filter(i => i.id !== id))
  }

  const handleAddPersona = async (persona: Omit<Persona, 'id'>, icpId: string) => {
    if (!companyId) return
    
    try {
      const newPersona: PersonaChip = {
        id: Date.now(),
        title: persona.title,
        icp_id: parseInt(icpId, 10),
        seniority_level: persona.seniority_level,
        department: persona.department
      }
      setPersonaChips(prev => [...prev, newPersona])
      
      // Update ICP's personas
      setICPChips(chips => 
        chips.map(icp => 
          icp.id === parseInt(icpId, 10)
            ? { ...icp, personas: [...icp.personas, newPersona] }
            : icp
        )
      )
    } catch (error) {
      console.error('🔴 handleAddPersona ERROR:', error)
      throw error
    }
  }

  const handleEditPersona = async (persona: Persona) => {
    if (!companyId || !persona.icp_id) return
    
    const updatedPersona: PersonaChip = {
      id: persona.id,
      title: persona.title,
      icp_id: persona.icp_id,
      seniority_level: persona.seniority_level,
      department: persona.department
    }
    
    setPersonaChips(chips => 
      chips.map(p => p.id === persona.id ? updatedPersona : p)
    )
    
    // Update persona in ICPs
    setICPChips(chips => 
      chips.map(icp => ({
        ...icp,
        personas: icp.personas.map(p => 
          p.id === persona.id ? updatedPersona : p
        )
      }))
    )
  }

  const handleDeletePersona = async (id: number) => {
    if (!companyId) return
    setPersonaChips(chips => chips.filter(p => p.id !== id))
  }

  useEffect(() => {
    console.log('CompanyId changed to:', companyId)
  }, [companyId])

  return (
    <div className="flex flex-col items-center w-full space-y-6">
      {companyId && (
        <div className="flex flex-wrap gap-2">
          <CompletedStepChip 
            step={{
              type: 'initial',
              title: companyName,
              summary: 'Company details'
            }}
            onEdit={() => setWizardStep('initial')}
          />
          {currentWizardStep !== 'initial' && (
            <CompletedStepChip
              step={{
                type: 'product',
                title: `${productChips.length} Products`,
                summary: productChips.map(p => p.name).join(', ')
              }}
              onEdit={() => setWizardStep('product')}
            />
          )}
          {currentWizardStep === 'personas' && (
            <>
              <CompletedStepChip
                step={{
                  type: 'competitors',
                  title: `${competitorChips.length} Competitors`,
                  summary: competitorChips.map(c => c.name).join(', ')
                }}
                onEdit={() => setWizardStep('competitors')}
              />
              <CompletedStepChip
                step={{
                  type: 'icps',
                  title: `${icpChips.length} ICPs`,
                  summary: icpChips.map(icp => icp.vertical).join(', ')
                }}
                onEdit={() => setWizardStep('icps')}
              />
            </>
          )}
        </div>
      )}
      
      {!companyId ? (
        <InitialStep
          accountId={accountId}
          onNext={handleInitialSubmit}
        />
      ) : (
        <>
          {currentWizardStep === 'product' && (
            <ProductStep
              products={productChips}
              onAddProduct={handleAddProduct}
              onEditProduct={handleEditProduct}
              onDeleteProduct={handleDeleteProduct}
              onNext={() => handleStepComplete('product', 'competitors')}
            />
          )}

          {currentWizardStep === 'competitors' && (
            <CompetitorStep
              companyName={companyName}
              products={productChips}
              competitors={competitorChips}
              onAddCompetitor={handleAddCompetitor}
              onEditCompetitor={handleEditCompetitor}
              onDeleteCompetitor={handleDeleteCompetitor}
              onNext={() => handleStepComplete('competitors', 'icps')}
              accountId={accountId}
            />
          )}

          {currentWizardStep === 'icps' && (
            <ICPStep
              industry={industry}
              products={productChips}
              icps={icpChips}
              onAddICP={handleAddICP}
              onEditICP={handleEditICP}
              onDeleteICP={handleDeleteICP}
              onNext={() => handleStepComplete('icps', 'personas')}
              accountId={accountId}
            />
          )}

          {currentWizardStep === 'personas' && (
            <PersonaStep
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