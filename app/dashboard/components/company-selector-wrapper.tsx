import { createServerClient } from '@supabase/ssr'
import { CompanySelector } from './company-selector'
import { ClientWrapper } from './client-wrapper'
import type { Database } from '@/types/supabase'
import { Skeleton } from "@/components/ui/skeleton"

interface Company {
  id: number
  name: string
  industry: string | null
}

interface CompanySelectorWrapperProps {
  selectedCompany: Company | null
  accountId: string
}

function CompanySelectorFallback() {
  return (
    <ClientWrapper>
      <div className="flex items-center space-x-2">
        <Skeleton className="h-10 w-[180px]" />
      </div>
    </ClientWrapper>
  )
}

export async function CompanySelectorWrapper({ 
  selectedCompany, 
  accountId 
}: CompanySelectorWrapperProps) {
  try {
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return null // Let middleware handle auth
          },
          set(name: string, value: string) {},
          remove(name: string) {}
        }
      }
    )
    
    // Keep RLS and data fetching logic
    const { data: companies, error } = await supabase
      .from('companies')
      .select('id, name, industry')
      .eq('account_id', accountId)
      .order('name')

    if (error) {
      console.error('Error fetching companies:', error)
      return <CompanySelectorFallback />
    }

    return (
      <ClientWrapper>
        <CompanySelector 
          selectedCompany={selectedCompany} 
          companies={companies || []} 
        />
      </ClientWrapper>
    )
  } catch (error) {
    console.error('Error in CompanySelectorWrapper:', error)
    return <CompanySelectorFallback />
  }
} 