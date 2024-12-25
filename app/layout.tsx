import "./globals.css"
import { GeistSans } from "geist/font/sans"
import { Metadata } from "next"
import { RootProvider } from "@/components/providers/root-provider"
import AuthButton from "@/components/header-auth"
import Link from "next/link"
import { headers } from 'next/headers'
import { SessionProvider } from "./providers/session-provider"
import { unstable_noStore as noStore } from 'next/cache'

export const metadata: Metadata = {
  title: "xFunnel",
  description: "Generate ICPs and Questions",
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
  // Get session from headers
  const session = await getSessionFromHeaders()

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${GeistSans.className} antialiased min-h-screen bg-background`}>
        <SessionProvider initialSession={session}>
          <RootProvider>
            <header className="flex items-center justify-between w-full px-6 py-3 border-b">
              <Link href="/" className="text-xl font-bold">
                xFunnel
              </Link>
              <AuthButton />
            </header>
            {children}
          </RootProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
