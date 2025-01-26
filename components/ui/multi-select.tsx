import * as React from "react"
import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export type Option = {
  label: string
  value: string
}

interface MultiSelectProps {
  options: Option[]
  value: string[]
  onValueChange: (values: string[]) => void
  label?: string
  placeholder?: string
  disabled?: boolean
}

export function MultiSelect({
  options,
  value,
  onValueChange,
  label,
  placeholder = "Select...",
  disabled = false,
}: MultiSelectProps) {
  const handleValueChange = (selectedValue: string) => {
    if (value.includes(selectedValue)) {
      onValueChange(value.filter(v => v !== selectedValue))
    } else {
      onValueChange([...value, selectedValue])
    }
  }

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <div className="flex items-center gap-2">
        {value.map(v => {
          const option = options.find(opt => opt.value === v)
          if (!option) return null
          return (
            <Badge
              key={v}
              variant="secondary"
              className="text-xs"
              onClick={() => onValueChange(value.filter(val => val !== v))}
            >
              {option.label}
              <X className="ml-1 h-3 w-3" />
            </Badge>
          )
        })}
        <Select
          value={placeholder}
          onValueChange={handleValueChange}
          disabled={disabled}
        >
          <SelectTrigger className="h-8">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
} 