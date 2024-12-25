'use client'

import { createContext, useContext, useState, useCallback } from 'react'

interface Company {
  id: number
  name: string
  industry: string | null
}

interface CompanyContextType {
  selectedCompany: Company | null
  setSelectedCompany: (company: Company | null) => void
  clearSelectedCompany: () => void
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined)

export function CompanyProvider({ children }: { children: React.ReactNode }) {
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)

  const clearSelectedCompany = useCallback(() => {
    setSelectedCompany(null)
  }, [])

  return (
    <CompanyContext.Provider 
      value={{ 
        selectedCompany, 
        setSelectedCompany, 
        clearSelectedCompany 
      }}
    >
      {children}
    </CompanyContext.Provider>
  )
}

export function useCompany() {
  const context = useContext(CompanyContext)
  if (context === undefined) {
    throw new Error('useCompany must be used within a CompanyProvider')
  }
  return context
} 