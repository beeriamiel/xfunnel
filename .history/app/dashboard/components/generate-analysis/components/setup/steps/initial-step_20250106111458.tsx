'use client'

import { ChangeEvent } from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"

interface InitialStepProps {
  companyName: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onNext: () => void;
}

export function InitialStep({ companyName, onChange, onNext }: InitialStepProps) {
  return (
    <div className="w-full max-w-xl space-y-3">
      <Label className="text-center block">Company Name</Label>
      <div className="relative flex items-center">
        <div className="relative flex-1">
          <Input
            placeholder="Enter company name"
            value={companyName}
            onChange={onChange}
            className="pr-24 h-12 text-lg focus-visible:ring-[#30035e]"
          />
          <Button
            onClick={onNext}
            disabled={!companyName}
            className="absolute right-1 top-1 bottom-1 bg-[#30035e] hover:bg-[#30035e]/90"
            size="sm"
          >
            Next <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
} 