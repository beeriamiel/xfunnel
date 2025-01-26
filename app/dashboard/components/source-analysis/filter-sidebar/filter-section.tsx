import * as React from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface Option {
  label: string
  value: string
}

interface FilterSectionProps {
  title: string
  options: Option[]
  values: string[]
  onChange: (values: string[]) => void
}

export function FilterSection({
  title,
  options,
  values,
  onChange,
}: FilterSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-medium text-sm">{title}</h3>
      <div className="space-y-3">
        {options.map((option) => (
          <div key={option.value} className="flex items-center space-x-2">
            <Checkbox
              id={option.value}
              checked={values.includes(option.value)}
              onCheckedChange={(checked) => {
                if (checked) {
                  onChange([...values, option.value])
                } else {
                  onChange(values.filter((v) => v !== option.value))
                }
              }}
            />
            <Label
              htmlFor={option.value}
              className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {option.label}
            </Label>
          </div>
        ))}
      </div>
    </div>
  )
} 