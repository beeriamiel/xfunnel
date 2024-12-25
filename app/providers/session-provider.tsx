'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'

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
    id: string
    email: string | null
    role: string | null
  } | null
  children: React.ReactNode
}

export function SessionProvider({ 
  initialSession,
  children 
}: SessionProviderProps) {
  const [user, setUser] = useState<User | null>(
    initialSession ? {
      id: initialSession.id,
      email: initialSession.email || '',
      role: initialSession.role || '',
      aud: 'authenticated',
      created_at: '',
    } as User : null
  )
  const [isLoading, setIsLoading] = useState(false)

  return (
    <SessionContext.Provider value={{ user, isLoading }}>
      {children}
    </SessionContext.Provider>
  )
} 