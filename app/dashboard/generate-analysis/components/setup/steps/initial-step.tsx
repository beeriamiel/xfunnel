'use client'

import { FormEvent, useState } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ChevronRight, Loader2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { design } from '../../../lib/design-system'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { initialFormSchema, type InitialFormData } from './schemas'
import { Form } from "@/components/ui/form"

interface InitialStepProps {
  accountId: string;
  onNext: (companyName: string) => void;
  onProgress?: (step: string) => void;
}

export function InitialStep({ accountId, onNext, onProgress }: InitialStepProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<InitialFormData>({
    resolver: zodResolver(initialFormSchema),
    defaultValues: {
      companyName: "",
    },
  })

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    form.handleSubmit(async (data) => {
      try {
        setIsLoading(true)
        setError(null)
        
        try {
          await onNext(data.companyName)
        } catch (error) {
          console.error('Error during company setup:', error)
          setError(error instanceof Error ? error.message : 'An error occurred during setup')
          throw error
        }
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setIsLoading(false)
      }
    })(e)
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-4 w-full">
        <Card className={cn(design.layout.card, design.spacing.card, "w-full max-w-none")}>
          <div className={cn(design.layout.container, "relative")}>
            {isLoading && (
              <div className="absolute inset-0 bg-card/95 backdrop-blur-sm flex items-center justify-center z-10">
                <div className="flex flex-col items-center space-y-6 p-4">
                  <div className="flex flex-col items-center justify-center min-h-[200px] space-y-4">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-700" />
                    <p className="text-sm text-muted-foreground">
                      {error ? (
                        <span className="text-destructive">{error}</span>
                      ) : (
                        'Collecting company information...'
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}
            <div className={design.layout.headerContent}>
              <h3 className={design.typography.title}>Company Name</h3>
              <p className={design.typography.subtitle}>Enter your company name to get started</p>
            </div>

            <div className="min-h-[100px] flex items-center">
              <div className="w-full">
                <Input
                  {...form.register('companyName')}
                  placeholder="Enter company name"
                  className="w-full"
                  disabled={isLoading}
                />
                {form.formState.errors.companyName && (
                  <p className="text-sm text-destructive mt-2">
                    {form.formState.errors.companyName.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      </form>
    </Form>
  )
} 