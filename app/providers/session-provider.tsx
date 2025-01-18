'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/app/supabase/client'
import type { Database } from '@/types/supabase'

interface SessionContextType {
  user: User | null
  isLoading: boolean
}

const SessionContext = createContext<SessionContextType>({
  user: null,
  isLoading: true
})

export function useSession() {
  return useContext(SessionContext)
}

interface SessionProviderProps {
  initialSession: {
    user: User | null
    accessToken: string | null
  } | null
  children: React.ReactNode
}

export function SessionProvider({ initialSession, children }: SessionProviderProps) {
  console.log('SessionProvider init:', { initialSession })
  const [user, setUser] = useState<User | null>(initialSession?.user ?? null)
  const [isLoading, setIsLoading] = useState(!initialSession)
  const supabase = createClient()

  useEffect(() => {
    console.log('SessionProvider state update:', { user, isLoading })
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('SessionProvider getSession result:', { session })
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('SessionProvider onAuthStateChange:', { session })
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  return (
    <SessionContext.Provider value={{ user, isLoading }}>
      {children}
    </SessionContext.Provider>
  )
} 