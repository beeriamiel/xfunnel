import "./globals.css"
import { GeistSans } from "geist/font/sans"
import { Metadata } from "next"
import { RootProvider } from "@/components/providers/root-provider"
import AuthButton from "@/components/header-auth"
import Link from "next/link"
import { headers } from 'next/headers'
import { SessionProvider } from "./providers/session-provider"
import { unstable_noStore as noStore } from 'next/cache'
import { createClient } from '@/app/supabase/server'
import { ErrorBoundary } from "@/components/error-boundary"
import { RootErrorBoundary } from '@/components/root-error-boundary'

export const metadata: Metadata = {
  title: "xFunnel",
  description: "Generate ICPs and Questions",
  icons: {
    icon: [
      {
        url: '/Favicon(32x32).png',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        url: '/logo(192x192).png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        url: '/logo(512x512).png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    apple: [
      {
        url: '/logo(192x192).png',
        sizes: '192x192',
        type: 'image/png',
      },
    ],
  },
}

async function getSessionFromHeaders() {
  noStore()
  const headersList = await headers()
  const sessionHeader = headersList.get('x-session-user')
  return sessionHeader ? JSON.parse(sessionHeader) : null
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  console.log('RootLayout auth state:', { user })

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={GeistSans.className}>
        <SessionProvider initialSession={user ? {
          user,
          accessToken: null
        } : null}>
          <RootProvider>
            <RootErrorBoundary>
              {children}
            </RootErrorBoundary>
          </RootProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
