'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function ClientRedirect({ path }: { path: string }) {
  const router = useRouter()
  
  useEffect(() => {
    router.push(path)
  }, [path, router])

  return null
} 