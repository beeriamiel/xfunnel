'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AGE_GROUPS,
  INCOME_LEVELS,
  type B2CToB2BMapping,
  mapB2CToB2B
} from '../../../types/b2c-mappings'
import { design } from '../../../lib/design-system'

interface B2CICPFormProps {
  onSubmit: (icpData: any) => void
  isEditing?: boolean
  initialData?: Partial<B2CToB2BMapping>
}

export function B2CICPForm({ onSubmit, isEditing = false, initialData = {} }: B2CICPFormProps) {
  const [formData, setFormData] = useState<Partial<B2CToB2BMapping>>({
    ageGroup: initialData.ageGroup || '',
    incomeLevel: initialData.incomeLevel || '',
    location: initialData.location || '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Map B2C fields to B2B ICP fields
    const b2bData = {
      vertical: formData.ageGroup,
      company_size: formData.incomeLevel,
      region: formData.location,
      personas: [] // Initialize empty personas array
    }
    onSubmit(b2bData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label>Age Group</Label>
          <Select
            value={formData.ageGroup}
            onValueChange={(value) => setFormData({ ...formData, ageGroup: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select age group" />
            </SelectTrigger>
            <SelectContent>
              {AGE_GROUPS.map((age) => (
                <SelectItem key={age} value={age}>
                  {age}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Income Level</Label>
          <Select
            value={formData.incomeLevel}
            onValueChange={(value) => setFormData({ ...formData, incomeLevel: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select income level" />
            </SelectTrigger>
            <SelectContent>
              {INCOME_LEVELS.map((income) => (
                <SelectItem key={income} value={income}>
                  {income}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Location</Label>
          <Input
            placeholder="Enter location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          />
        </div>
      </div>

      <Button
        type="submit"
        className={design.components.button.primary}
        disabled={!formData.ageGroup || !formData.incomeLevel || !formData.location}
      >
        {isEditing ? 'Update' : 'Add'} Consumer Profile
      </Button>
    </form>
  )
} 