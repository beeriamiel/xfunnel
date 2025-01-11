'use client'

import { ChangeEvent } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { design } from '../../../lib/design-system'
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

type BusinessType = 'b2b' | 'b2c'

interface InitialStepProps {
  companyName: string;
  businessType: BusinessType;
  onCompanyNameChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onBusinessTypeChange: (type: BusinessType) => void;
  onNext: () => void;
}

export function InitialStep({ 
  companyName, 
  businessType,
  onCompanyNameChange, 
  onBusinessTypeChange,
  onNext 
}: InitialStepProps) {
  return (
    <Card className={cn(design.layout.card, design.spacing.card)}>
      <div className={design.layout.container}>
        <div className={design.layout.headerContent}>
          <h3 className={design.typography.title}>Company Setup</h3>
          <p className={design.typography.subtitle}>Enter your company details to get started</p>
        </div>

        <div className="space-y-6">
          <div>
            <Input
              placeholder="Enter company name"
              value={companyName}
              onChange={onCompanyNameChange}
              className={cn(
                design.components.input.base,
                design.typography.input
              )}
            />
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium">Business Type</h4>
            <RadioGroup
              value={businessType}
              onValueChange={onBusinessTypeChange}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="b2b" id="b2b" />
                <label htmlFor="b2b" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  B2B
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="b2c" id="b2c" />
                <label htmlFor="b2c" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  B2C
                </label>
              </div>
            </RadioGroup>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={onNext}
              disabled={!companyName}
              className={cn(
                design.components.button.primary
              )}
              size="sm"
            >
              Next <ChevronRight className={cn("ml-2", design.components.button.iconSize)} />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
} 