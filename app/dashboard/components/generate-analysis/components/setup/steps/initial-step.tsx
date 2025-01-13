'use client'

import { ChangeEvent, useState } from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { design } from '../../../lib/design-system'

interface InitialStepProps {
  accountId: string;
  onNext: (companyName: string) => void;
}

export function InitialStep({ accountId, onNext }: InitialStepProps) {
  const [companyName, setCompanyName] = useState('')

  const handleCompanyNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCompanyName(e.target.value)
  }

  const handleNext = () => {
    if (companyName) {
      onNext(companyName)
    }
  }

  return (
    <Card className={cn(design.layout.card, design.spacing.card)}>
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
                value={companyName}
                onChange={handleCompanyNameChange}
                className={cn(
                  "pr-24",
                  design.components.input.base,
                  design.typography.input
                )}
              />
              <Button
                onClick={handleNext}
                disabled={!companyName}
                className={cn(
                  "absolute right-1 top-1 bottom-1",
                  design.components.button.primary
                )}
                size="sm"
              >
                Next <ChevronRight className={cn("ml-2", design.components.button.iconSize)} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
} 