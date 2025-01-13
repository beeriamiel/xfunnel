"use client"

import { Button } from "@/components/ui/button"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Provider } from "@supabase/supabase-js"
import { Icons } from "@/components/ui/icons"
import { useState } from "react"
import type { Database } from '@/types/supabase'

interface OAuthButtonsProps {
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

export function OAuthButtons({ isLoading, setIsLoading }: OAuthButtonsProps) {
  const [activeProvider, setActiveProvider] = useState<Provider | null>(null)
  const supabase = createClientComponentClient<Database>()
  
  const handleOAuthSignIn = async (provider: Provider) => {
    console.log('Starting OAuth flow:', {
      provider,
      redirectUrl: `${window.location.origin}/auth/callback`,
      timestamp: new Date().toISOString()
    });
    setIsLoading(true)
    setActiveProvider(provider)
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        console.error("OAuth error:", error)
      }
    } catch (error) {
      console.error("OAuth error:", error)
    } finally {
      setIsLoading(false)
      setActiveProvider(null)
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      <Button
        variant="outline"
        onClick={() => handleOAuthSignIn("google")}
        disabled={isLoading}
        className="w-full"
      >
        {isLoading && activeProvider === "google" ? (
          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Icons.google className="mr-2 h-4 w-4" />
        )}
        Continue with Google
      </Button>
    </div>
  )
} 