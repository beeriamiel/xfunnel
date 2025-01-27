import { createServerClient } from '@supabase/ssr'
import { CompanySelectorClient } from './client'
import type { Database } from '@/types/supabase'

interface Company {
  id: number
  name: string
  industry: string | null
}

export async function CompanySelectorServer({ accountId }: { accountId: string }) {
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

  // Keep existing data fetching logic
  const { data: companies, error } = await supabase
    .from('companies')
    .select('id, name, industry')
    .eq('account_id', accountId)
    .order('name')

  if (error) {
    console.error('Error fetching companies:', error)
    return null
  }

  return <CompanySelectorClient companies={companies} selectedCompany={null} />
} 