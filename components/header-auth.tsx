'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { Button } from './ui/button'
import Link from 'next/link'
import { useSession } from '@/app/providers/session-provider'
import { Skeleton } from './ui/skeleton'
import type { Database } from '@/types/supabase'

export default function AuthButton() {
  const router = useRouter()
  const { user, isLoading } = useSession()
  const supabase = createClientComponentClient<Database>()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
    router.push('/login')
  }

  if (isLoading) {
    return <Skeleton className="h-10 w-[100px]" />
  }

  if (!user) {
    return (
      <div className="flex items-center gap-4">
        <Link href="/login">
          <Button variant="outline">Sign in</Button>
        </Link>
        <Link href="/signup">
          <Button>Sign up</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm text-muted-foreground">
        {user.email}
      </span>
      <Button
        variant="outline"
        onClick={handleSignOut}
        className="py-2 px-4 rounded-md"
      >
        Sign out
      </Button>
    </div>
  )
} 