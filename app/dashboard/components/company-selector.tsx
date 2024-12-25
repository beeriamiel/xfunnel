'use client'

import { useCallback, useMemo, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useToast } from "@/components/hooks/use-toast"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Company {
  id: number
  name: string
  industry: string | null
}

interface CompanySelectorProps {
  selectedCompany: Company | null
  companies: Company[]
}

export function CompanySelector({ selectedCompany, companies }: CompanySelectorProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()

  // Memoize the current value to prevent unnecessary re-renders
  const currentValue = useMemo(() => 
    selectedCompany?.name ?? 'all'
  , [selectedCompany?.name])

  // Memoize companies to prevent unnecessary re-renders
  const sortedCompanies = useMemo(() => 
    [...companies].sort((a, b) => a.name.localeCompare(b.name))
  , [companies])

  // Handle URL updates when company changes
  const handleCompanyChange = useCallback((companyName: string) => {
    if (isPending) return; // Prevent multiple transitions

    startTransition(() => {
      try {
        const params = new URLSearchParams(searchParams.toString())
        
        if (companyName !== 'all') {
          params.set('company', companyName)
        } else {
          params.delete('company')
        }

        router.push(`/dashboard?${params.toString()}`)
      } catch (error) {
        console.error('Error updating company:', error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to update company selection. Please try again.",
        })
      }
    })
  }, [router, searchParams, toast, isPending])

  return (
    <Select
      value={currentValue}
      onValueChange={handleCompanyChange}
      disabled={isPending}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select company" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Companies</SelectItem>
        {sortedCompanies.map((company) => (
          <SelectItem key={company.id} value={company.name}>
            {company.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
} 