'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BasicCompany {
  id: number;
  name: string;
  industry: string | null;
  product_category: string | null;
  annual_revenue: string | null;
  markets_operating_in: string[];
  number_of_employees: number | null;
  main_products: string[];
  created_at: string;
}

interface SimpleCompanySelectorProps {
  selectedCompany: BasicCompany | null;
  companies: BasicCompany[];
  onCompanySelect: (company: BasicCompany | null) => void;
  disabled?: boolean;
}

export function SimpleCompanySelector({
  selectedCompany,
  companies,
  onCompanySelect,
  disabled = false
}: SimpleCompanySelectorProps) {
  // Sort companies by name
  const sortedCompanies = [...companies].sort((a, b) => 
    a.name.localeCompare(b.name)
  );

  return (
    <Select
      value={selectedCompany?.name}
      onValueChange={(value) => {
        const company = companies.find(c => c.name === value) || null;
        onCompanySelect(company);
      }}
      disabled={disabled}
    >
      <SelectTrigger className="w-[280px]">
        <SelectValue placeholder="Select a company to view" />
      </SelectTrigger>
      <SelectContent>
        {sortedCompanies.map((company) => (
          <SelectItem key={company.id} value={company.name}>
            {company.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
} 