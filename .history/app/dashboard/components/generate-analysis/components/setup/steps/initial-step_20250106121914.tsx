'use client'

import { ChangeEvent } from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import { Card } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface InitialStepProps {
  companyName: string;
  industry: string;
  onCompanyNameChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onIndustryChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onNext: () => void;
}

export function InitialStep({ 
  companyName, 
  industry,
  onCompanyNameChange, 
  onIndustryChange,
  onNext 
}: InitialStepProps) {
  return (
    <Card className="w-full max-w-xl p-4">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-[#30035e]">Company Details</h3>
          <p className="text-sm text-muted-foreground">Enter your company information to get started</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Company Name</Label>
            <div className="relative">
              <Input
                placeholder="Enter company name"
                value={companyName}
                onChange={onCompanyNameChange}
                className="pr-24 focus-visible:ring-[#30035e]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Industry</Label>
            <Input
              placeholder="e.g., SaaS, Healthcare, E-commerce"
              value={industry}
              onChange={onIndustryChange}
              className="focus-visible:ring-[#30035e]"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            onClick={onNext}
            disabled={!companyName || !industry}
            className="bg-[#30035e] hover:bg-[#30035e]/90"
          >
            Continue <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
} 