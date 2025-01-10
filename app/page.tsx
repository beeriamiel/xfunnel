import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import type { Database } from '@/types/supabase'

export default async function LandingPage() {
  const supabase = createServerComponentClient<Database>({ cookies })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/protected')
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-20 items-center">
      <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
        <div className="w-full max-w-4xl flex justify-between items-center p-3 text-sm">
          <div />
          <Button asChild>
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </nav>

      <div className="animate-in flex-1 flex flex-col gap-20 opacity-0 max-w-4xl px-3">
        <main className="flex-1 flex flex-col gap-6 items-center">
          <h1 className="text-6xl font-bold text-center">
            AI-Powered ICP & Question Generator
          </h1>
          <p className="text-center text-lg text-muted-foreground">
            Generate targeted Ideal Customer Profiles and interview questions using advanced AI
          </p>
          <Button size="lg" asChild>
            <Link href="/login">Get Started</Link>
          </Button>
        </main>
      </div>
    </div>
  )
}
