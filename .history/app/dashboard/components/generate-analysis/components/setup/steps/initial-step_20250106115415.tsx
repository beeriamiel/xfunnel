'use client'

import { ChangeEvent } from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import { Card } from "@/components/ui/card"

interface InitialStepProps {
  companyName: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onNext: () => void;
}

export function InitialStep({ companyName, onChange, onNext }: InitialStepProps) {
  return (
    <Card className="w-full max-w-2xl p-4">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-[#30035e]">Company Name</h3>
          <p className="text-sm text-muted-foreground">Enter your company name to get started</p>
        </div>

        <div className="min-h-[100px] flex items-center">
          <div className="w-full">
            <div className="relative">
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
      </div>
    </Card>
  )
} 