'use client'

import { cn } from "@/lib/utils"

interface SourcesOverviewProps {
  links?: Array<{ url: string; source?: string }>
  companyName?: string
}

function extractDomain(url: string): string {
  try {
    const domain = new URL(url).hostname.replace('www.', '')
    return domain.split('.')[0].split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  } catch {
    return 'Unknown'
  }
}

function isCompanySource(source: string, companyName?: string): boolean {
  if (!companyName) return false
  const normalizedSource = source.toLowerCase()
  const normalizedCompany = companyName.toLowerCase()
  return normalizedSource.includes(normalizedCompany) || normalizedCompany.includes(normalizedSource)
}

export function SourcesOverview({ links, companyName }: SourcesOverviewProps) {
  if (!links?.length) return null

  // Get unique sources
  const uniqueSources = Array.from(new Set(
    links.map(link => link.source || extractDomain(link.url))
  )).sort()

  if (!uniqueSources.length) return null

  return (
    <div className="mb-4">
      <p className="text-sm font-medium text-muted-foreground mb-2">Sources:</p>
      <div className="flex flex-wrap gap-2">
        {uniqueSources.map((source, index) => {
          const isCompany = isCompanySource(source, companyName)
          return (
            <span
              key={index}
              className={cn(
                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                isCompany
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {source}
              {isCompany && (
                <svg
                  className="ml-1 h-3 w-3 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                </svg>
              )}
            </span>
          )
        })}
      </div>
    </div>
  )
} 