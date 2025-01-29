import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { createClient } from "@/app/supabase/client"

interface BasicCompany {
  id: number
  name: string
  industry: string | null
  product_category: string | null
}

interface CompanyComboboxProps {
  onSelect: (company: BasicCompany | null) => void
}

export function CompanyCombobox({ onSelect }: CompanyComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [companies, setCompanies] = React.useState<BasicCompany[]>([])
  const [selectedCompany, setSelectedCompany] = React.useState<BasicCompany | null>(null)
  const supabase = createClient()

  React.useEffect(() => {
    async function fetchCompanies() {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name, industry, product_category')
        .order('name')

      if (error) {
        console.error('Error fetching companies:', error)
        return
      }

      setCompanies(data || [])
    }

    fetchCompanies()
  }, [])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedCompany ? selectedCompany.name : "Select company..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search companies..." />
          <CommandEmpty>No company found.</CommandEmpty>
          <CommandGroup className="max-h-64 overflow-auto">
            {companies.map((company) => (
              <CommandItem
                key={company.id}
                value={company.name}
                onSelect={() => {
                  setSelectedCompany(company)
                  onSelect(company)
                  setOpen(false)
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedCompany?.id === company.id ? "opacity-100" : "opacity-0"
                  )}
                />
                {company.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
} 