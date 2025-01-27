import { redirect } from 'next/navigation'
import { createClient } from '@/app/supabase/server'
import type { Database } from '@/types/supabase'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen flex-col">
      {children}
    </div>
  )
} 