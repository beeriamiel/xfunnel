import { cookies } from 'next/headers'
import { CompanySelectorClient } from './client'

export async function CompanySelectorServer({ accountId }: { accountId: string }) {
  const supabase = createServerComponentClient({ cookies })
  // Fetch data...
  return <CompanySelectorClient companies={companies} selectedCompany={selectedCompany} />
} 