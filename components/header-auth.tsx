'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { Button } from './ui/button'
import Link from 'next/link'
import { useSession } from '@/app/providers/session-provider'
import { Skeleton } from './ui/skeleton'
import type { Database } from '@/types/supabase'
import { useEffect, useState } from 'react'
import type { User } from '@supabase/auth-helpers-nextjs'

interface AccountInfo {
  name: string
  account_type: string
  plan_type: string
}

interface ExtendedUser extends User {
  accountId?: string;
  accountRole?: string;
  hasCompanies?: boolean;
}

export default function AuthButton() {
  const router = useRouter()
  const { user, isLoading } = useSession() as { 
    user: ExtendedUser | null; 
    isLoading: boolean 
  }
  const supabase = createClientComponentClient<Database>()
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null)
  const [isLoadingAccount, setIsLoadingAccount] = useState(false)

  // Fetch account info when user is available
  useEffect(() => {
    async function fetchAccountInfo() {
      if (!user?.accountId) return
      
      setIsLoadingAccount(true)
      try {
        const { data: account } = await supabase
          .from('accounts')
          .select('name, account_type, plan_type')
          .eq('id', user.accountId)
          .single()

        if (account) {
          setAccountInfo(account)
        }
      } catch (error) {
        console.error('Error fetching account info:', error)
      } finally {
        setIsLoadingAccount(false)
      }
    }

    fetchAccountInfo()
  }, [user?.accountId])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
    router.push('/login')
  }

  if (isLoading || isLoadingAccount) {
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
      {accountInfo && (
        <div className="flex flex-col items-end">
          <span className="text-sm font-medium">{accountInfo.name}</span>
          <span className="text-xs text-muted-foreground">
            {accountInfo.plan_type} plan
          </span>
        </div>
      )}
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