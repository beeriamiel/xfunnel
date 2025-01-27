'use client'

import { useCallback, useMemo, useTransition, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useToast } from "@/components/hooks/use-toast"
import { useDashboardStore } from "@/app/dashboard/store"
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
  const setSelectedCompanyId = useDashboardStore(state => state.setSelectedCompanyId)

  // Sync with URL on mount and URL changes
  useEffect(() => {
    const urlCompanyId = searchParams.get('company')
    if (urlCompanyId) {
      const id = parseInt(urlCompanyId)
      if (!isNaN(id) && companies.some(c => c.id === id)) {
        setSelectedCompanyId(id)
      }
    }
  }, [searchParams, companies, setSelectedCompanyId])

  // Memoize the current value to prevent unnecessary re-renders
  const currentValue = useMemo(() => 
    selectedCompany?.id?.toString() ?? 'all'
  , [selectedCompany?.id])

  // Memoize companies to prevent unnecessary re-renders
  const sortedCompanies = useMemo(() => 
    [...companies].sort((a, b) => a.name.localeCompare(b.name))
  , [companies])

  // Handle URL updates when company changes
  const handleCompanyChange = useCallback((companyId: string) => {
    if (isPending) return; // Prevent multiple transitions

    startTransition(() => {
      try {
        const params = new URLSearchParams(searchParams.toString())
        
        if (companyId !== 'all') {
          params.set('company', companyId)
          // Update store with the ID directly
          const id = parseInt(companyId)
          if (!isNaN(id)) {
            setSelectedCompanyId(id)
          }
        } else {
          params.delete('company')
          setSelectedCompanyId(null)
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
  }, [router, searchParams, toast, isPending, setSelectedCompanyId])

  return (
    <Select
      value={currentValue}
      onValueChange={handleCompanyChange}
      disabled={isPending}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select company">
          {selectedCompany?.name ?? 'All Companies'}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Companies</SelectItem>
        {sortedCompanies.map((company) => (
          <SelectItem key={company.id} value={company.id.toString()}>
            {company.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
} 