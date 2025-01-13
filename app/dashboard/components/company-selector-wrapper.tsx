import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
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
    const cookieStore = await cookies()
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value || ''
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )
    
    // RLS will automatically handle access control here
    const { data: companies, error } = await supabase
      .from('companies')
      .select('id, name, industry')
      .eq('account_id', accountId)
      .order('name')

    if (error) {
      console.error('Error fetching companies:', error)
      // Return empty state but don't expose error details to client
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