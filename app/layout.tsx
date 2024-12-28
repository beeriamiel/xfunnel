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
  // Get session from headers
  const session = await getSessionFromHeaders()

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${GeistSans.className} antialiased min-h-screen bg-background`}>
        <SessionProvider initialSession={session}>
          <RootProvider>
            <header className="flex items-center justify-between w-full px-6 py-3 border-b">
              <Link href="/" className="flex items-center">
                <img 
                  src="/logo(320x80).png" 
                  alt="xFunnel" 
                  className="h-8 w-auto"
                />
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
