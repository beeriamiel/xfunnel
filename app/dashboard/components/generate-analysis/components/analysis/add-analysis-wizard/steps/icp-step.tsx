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
import { design } from '../../../../lib/design-system'

interface ICPStepProps {
  existingICPs?: Array<{
    id: number
    region: string
    vertical: string
    company_size: string
  }>
  onComplete: (data: { 
    type: 'existing' | 'new',
    data: {
      id?: number
      region: string
      vertical: string
      company_size: string
    }
  }) => void
}

type Mode = 'select' | 'create'

const REGIONS = [
  'North America',
  'Europe',
  'Asia Pacific',
  'Latin America',
  'Global'
]

const COMPANY_SIZES = [
  '1-10',
  '11-50',
  '51-200',
  '201-1000',
  '1000+'
]

export function ICPStep({ existingICPs = [], onComplete }: ICPStepProps) {
  const [mode, setMode] = useState<Mode>(existingICPs.length > 0 ? 'select' : 'create')
  const [selectedIcpId, setSelectedIcpId] = useState<string>('')
  const [formData, setFormData] = useState({
    region: '',
    vertical: '',
    company_size: ''
  })

  const handleSubmit = () => {
    if (mode === 'select') {
      if (!selectedIcpId) return
      const selectedIcp = existingICPs.find(icp => icp.id.toString() === selectedIcpId)
      if (!selectedIcp) return
      onComplete({
        type: 'existing',
        data: {
          id: selectedIcp.id,
          region: selectedIcp.region,
          vertical: selectedIcp.vertical,
          company_size: selectedIcp.company_size
        }
      })
    } else {
      if (!formData.region || !formData.vertical || !formData.company_size) return
      onComplete({
        type: 'new',
        data: {
          region: formData.region,
          vertical: formData.vertical,
          company_size: formData.company_size
        }
      })
    }
  }

  if (existingICPs.length === 0) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Region</Label>
          <Select
            value={formData.region}
            onValueChange={(value) => setFormData({ ...formData, region: value })}
          >
            <SelectTrigger className={design.components.input.base}>
              <SelectValue placeholder="Select region" />
            </SelectTrigger>
            <SelectContent>
              {REGIONS.map((region) => (
                <SelectItem key={region} value={region}>
                  {region}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Industry/Vertical</Label>
          <Input
            placeholder="e.g. Healthcare, Finance, Technology"
            value={formData.vertical}
            onChange={(e) => setFormData({ ...formData, vertical: e.target.value })}
            className={design.components.input.base}
          />
        </div>

        <div className="space-y-2">
          <Label>Company Size</Label>
          <Select
            value={formData.company_size}
            onValueChange={(value) => setFormData({ ...formData, company_size: value })}
          >
            <SelectTrigger className={design.components.input.base}>
              <SelectValue placeholder="Select company size" />
            </SelectTrigger>
            <SelectContent>
              {COMPANY_SIZES.map((size) => (
                <SelectItem key={size} value={size}>
                  {size} employees
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={!formData.region || !formData.vertical || !formData.company_size}
            className={design.components.button.primary}
          >
            Continue
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Button
          variant={mode === 'select' ? 'default' : 'outline'}
          onClick={() => setMode('select')}
          className="flex-1"
        >
          Select Existing
        </Button>
        <Button
          variant={mode === 'create' ? 'default' : 'outline'}
          onClick={() => setMode('create')}
          className="flex-1"
        >
          Create New
        </Button>
      </div>

      {mode === 'select' ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Select ICP</Label>
            <Select
              value={selectedIcpId}
              onValueChange={setSelectedIcpId}
            >
              <SelectTrigger className={design.components.input.base}>
                <SelectValue placeholder="Choose an ICP" />
              </SelectTrigger>
              <SelectContent>
                {existingICPs.map((icp) => (
                  <SelectItem key={icp.id} value={icp.id.toString()}>
                    <div className="flex flex-col">
                      <span>{icp.vertical}</span>
                      <span className="text-muted-foreground text-sm">
                        {icp.region} · {icp.company_size} employees
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Region</Label>
            <Select
              value={formData.region}
              onValueChange={(value) => setFormData({ ...formData, region: value })}
            >
              <SelectTrigger className={design.components.input.base}>
                <SelectValue placeholder="Select region" />
              </SelectTrigger>
              <SelectContent>
                {REGIONS.map((region) => (
                  <SelectItem key={region} value={region}>
                    {region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Industry/Vertical</Label>
            <Input
              placeholder="e.g. Healthcare, Finance, Technology"
              value={formData.vertical}
              onChange={(e) => setFormData({ ...formData, vertical: e.target.value })}
              className={design.components.input.base}
            />
          </div>

          <div className="space-y-2">
            <Label>Company Size</Label>
            <Select
              value={formData.company_size}
              onValueChange={(value) => setFormData({ ...formData, company_size: value })}
            >
              <SelectTrigger className={design.components.input.base}>
                <SelectValue placeholder="Select company size" />
              </SelectTrigger>
              <SelectContent>
                {COMPANY_SIZES.map((size) => (
                  <SelectItem key={size} value={size}>
                    {size} employees
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={
            mode === 'select' 
              ? !selectedIcpId 
              : (!formData.region || !formData.vertical || !formData.company_size)
          }
          className={design.components.button.primary}
        >
          Continue
        </Button>
      </div>
    </div>
  )
} 