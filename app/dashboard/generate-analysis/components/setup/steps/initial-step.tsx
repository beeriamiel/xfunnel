'use client'

import { ChangeEvent, useState, FormEvent } from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
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
}

export function InitialStep({ accountId, onNext }: InitialStepProps) {
  console.log('🔵 InitialStep Render:', { accountId })

  const form = useForm<InitialFormData>({
    resolver: zodResolver(initialFormSchema),
    defaultValues: {
      companyName: "",
    },
  })

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    console.log('🔵 InitialStep handleSubmit START')
    e.preventDefault()
    
    try {
      console.log('🟡 Validating form...')
      form.handleSubmit(async (data) => {
        console.log('🟡 Submitting:', data)
        await onNext(data.companyName)
        console.log('🟢 InitialStep Submit SUCCESS')
      })(e)
    } catch (error) {
      console.error('🔴 InitialStep Submit ERROR:', error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-4 w-full">
        <Card className={cn(design.layout.card, design.spacing.card, "w-full max-w-none")}>
          <div className={design.layout.container}>
            <div className={design.layout.headerContent}>
              <h3 className={design.typography.title}>Company Name</h3>
              <p className={design.typography.subtitle}>Enter your company name to get started</p>
            </div>

            <div className="min-h-[100px] flex items-center">
              <div className="w-full">
                <div className="relative">
                  <Input
                    placeholder="Enter company name"
                    {...form.register('companyName')}
                    className={cn(
                      "pr-24",
                      design.components.input.base,
                      design.typography.input
                    )}
                  />
                  <Button
                    type="submit"
                    disabled={!form.formState.isValid}
                    className={cn(
                      "absolute right-1 top-1 bottom-1",
                      design.components.button.primary
                    )}
                    size="sm"
                  >
                    Next <ChevronRight className={cn("ml-2", design.components.button.iconSize)} />
                  </Button>
                </div>
                {form.formState.errors.companyName && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.companyName.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        </Card>
      </form>
    </Form>
  )
} 