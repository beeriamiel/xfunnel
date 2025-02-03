'use client'

import { Building2 } from "lucide-react"

interface StaticCompanyDisplayProps {
  companyName: string
}

export function StaticCompanyDisplay({ companyName }: StaticCompanyDisplayProps) {
  return (
    <div className="flex h-10 w-[180px] items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground">
      <div className="flex items-center gap-2 truncate">
        <Building2 className="h-4 w-4 shrink-0 opacity-50" />
        <span className="truncate">{companyName}</span>
      </div>
    </div>
  )
} 