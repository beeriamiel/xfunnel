'use client'

import { forwardRef, useImperativeHandle } from 'react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useWizard } from '../../context'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/app/supabase/client'
import { StepHeader } from '../step-header'
import ConfirmationMessage from '@/components/animata/feature-cards/confirmation-message'

interface ReviewStepProps {
  accountId: string
}

export type ReviewStepRef = {
  handleSubmit: () => Promise<void>
}

export const ReviewStep = forwardRef<ReviewStepRef, ReviewStepProps>(function ReviewStep({ accountId }, ref) {
  const router = useRouter()
  const { companyName, products, competitors, icps, dispatch, isLoading } = useWizard()
  const [showConfirmation, setShowConfirmation] = useState(false)

  const handleSubmit = async () => {
    dispatch({ type: 'SET_LOADING', payload: true })
    dispatch({ type: 'SET_ERROR', payload: null })

    try {
      const supabase = createClient()

      // Create company
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert([{ 
          name: companyName, 
          account_id: accountId,
          setup_completed_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (companyError) throw companyError

      // Add products
      if (products.length > 0) {
        const { error: productsError } = await supabase
          .from('products')
          .insert(products.map(product => ({
            name: product.name,
            description: product.description,
            company_id: company.id,
            account_id: accountId
          })))

        if (productsError) throw productsError
      }

      // Add competitors
      if (competitors.length > 0) {
        const { error: competitorsError } = await supabase
          .from('competitors')
          .insert(competitors.map(competitor => ({
            competitor_name: competitor.name,
            description: competitor.description,
            company_id: company.id,
            account_id: accountId
          })))

        if (competitorsError) throw competitorsError
      }

      // Add ICPs and their personas
      for (const icp of icps) {
        const { data: icpData, error: icpError } = await supabase
          .from('ideal_customer_profiles')
          .insert([{
            vertical: icp.vertical,
            company_size: icp.company_size,
            region: icp.region,
            company_id: company.id,
            account_id: accountId
          }])
          .select()
          .single()

        if (icpError) throw icpError

        if (icp.personas.length > 0) {
          const { error: personasError } = await supabase
            .from('personas')
            .insert(icp.personas.map(persona => ({
              title: persona.title,
              seniority_level: persona.seniority_level,
              department: persona.department,
              icp_id: icpData.id,
              account_id: accountId
            })))

          if (personasError) throw personasError
        }
      }

      // Show confirmation message
      setShowConfirmation(true)
      
      // Wait for animation to complete before redirecting
      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 2500)

    } catch (error) {
      console.error('Error:', error)
      dispatch({ 
        type: 'SET_ERROR', 
        payload: 'Failed to complete setup. Please try again.' 
      })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  // Expose handleSubmit method through ref
  useImperativeHandle(ref, () => ({
    handleSubmit
  }))

  if (showConfirmation) {
    return (
      <ConfirmationMessage
        successMessage="Setup Complete!"
        labelName={companyName}
        labelMessage="Your company profile has been created. Redirecting to dashboard..."
      />
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <StepHeader 
          title="Review Your Company Profile"
          description="Don't worry, you can change these details at any time"
        />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-24 w-full" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <StepHeader 
        title="Review Your Company Profile"
        description="Don't worry, you can change these details at any time"
      />

      <Card className="p-6">
        <h3 className="font-medium mb-4">Company Information</h3>
        <p className="text-lg font-medium">{companyName}</p>
      </Card>

      {products.length > 0 && (
        <Card className="p-6">
          <h3 className="font-medium mb-4">Products</h3>
          <div className="space-y-4">
            {products.map((product, index) => (
              <div key={index} className="space-y-1">
                <p className="font-medium">{product.name}</p>
                <p className="text-sm text-muted-foreground">{product.description}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {competitors.length > 0 && (
        <Card className="p-6">
          <h3 className="font-medium mb-4">Competitors</h3>
          <div className="space-y-4">
            {competitors.map((competitor, index) => (
              <div key={index} className="space-y-1">
                <p className="font-medium">{competitor.name}</p>
                <p className="text-sm text-muted-foreground">{competitor.description}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {icps.length > 0 && (
        <Card className="p-6">
          <h3 className="font-medium mb-4">Ideal Customer Profiles</h3>
          <div className="space-y-6">
            {icps.map((icp, index) => (
              <div key={index} className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{icp.vertical}</p>
                    <Badge variant="secondary">{icp.company_size}</Badge>
                    <Badge variant="outline">{icp.region}</Badge>
                  </div>
                  {icp.personas.length > 0 && (
                    <div className="pl-4 border-l-2 border-muted space-y-3">
                      {icp.personas.map((persona, personaIndex) => (
                        <div key={personaIndex} className="space-y-1">
                          <p className="font-medium">{persona.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {persona.seniority_level} • {persona.department}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}) 