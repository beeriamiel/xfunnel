import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { hasEnvVars } from "@/utils/supabase/check-env-vars"
import { GenerateICPsButton } from "@/components/generate-icps-button"
import { Card } from "@/components/ui/card"
import { AppSidebar } from "@/components/app-sidebar"
import type { Database } from '@/types/supabase'
import { createClient } from '../supabase/server'

export default async function ProtectedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="flex">
      <AppSidebar />
      <main className="flex-1 overflow-hidden p-6">
        <div className="flex flex-col space-y-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Reports</h2>
            <p className="text-muted-foreground">
              Generate ICPs and interview questions using AI
            </p>
          </div>

          {hasEnvVars ? (
            <div className="space-y-8">
              {/* Primary Option */}
              <section>
                <h3 className="text-lg font-medium mb-4">Generate ICPs and Questions</h3>
                <Card className="p-6">
                  <div className="space-y-6">
                    <p className="text-sm text-muted-foreground">
                      Recommended: Generate Ideal Customer Profiles (ICPs) first, then automatically create targeted questions for each persona.
                    </p>
                    <GenerateICPsButton />
                  </div>
                </Card>
              </section>
            </div>
          ) : (
            <div className="text-muted-foreground">
              Please update your environment variables to continue
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
