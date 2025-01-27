'use client'

export function CompanySelectorClient({ 
  selectedCompany,
  companies 
}: { 
  selectedCompany: Company | null
  companies: Company[]
}) {
  return <CompanySelector selectedCompany={selectedCompany} companies={companies} />
} 