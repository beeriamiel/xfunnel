'use client'

import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { useJourneyStore } from '../../store'
import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

interface TimeFilterProps {
  className?: string
}

export function TimeFilter({ className }: TimeFilterProps) {
  const {
    filterType,
    selectedBatchId,
    selectedTimePeriod,
    setFilterType,
    setSelectedBatchId,
    setSelectedTimePeriod,
  } = useJourneyStore()

  // This will be replaced with real data fetching
  const mockBatches = [
    { id: 'batch-1', date: '2024-01-15' },
    { id: 'batch-2', date: '2024-01-14' },
    { id: 'batch-3', date: '2024-01-13' },
  ]

  return (
    <div className={cn('space-y-4', className)}>
      <RadioGroup
        value={filterType}
        onValueChange={(value) => setFilterType(value as 'batch' | 'time')}
        className="flex items-center space-x-4"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="batch" id="batch" />
          <Label htmlFor="batch">Batch Analysis</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="time" id="time" />
          <Label htmlFor="time">Time Period</Label>
        </div>
      </RadioGroup>

      {filterType === 'batch' ? (
        <Select
          value={selectedBatchId || ''}
          onValueChange={setSelectedBatchId}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select batch" />
          </SelectTrigger>
          <SelectContent>
            {mockBatches.map((batch) => (
              <SelectItem key={batch.id} value={batch.id}>
                {format(new Date(batch.date), 'MMM dd, yyyy')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <div className="flex items-center space-x-4">
          <Select
            value={selectedTimePeriod?.type || ''}
            onValueChange={(value) =>
              setSelectedTimePeriod(
                value ? { type: value as 'week' | 'month', value: '' } : null
              )
            }
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Weekly</SelectItem>
              <SelectItem value="month">Monthly</SelectItem>
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-[240px] justify-start text-left font-normal',
                  !selectedTimePeriod?.value && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedTimePeriod?.value ? (
                  selectedTimePeriod.type === 'week' ? (
                    format(new Date(selectedTimePeriod.value), "'Week of' MMM d")
                  ) : (
                    format(new Date(selectedTimePeriod.value), 'MMMM yyyy')
                  )
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={
                  selectedTimePeriod?.value
                    ? new Date(selectedTimePeriod.value)
                    : undefined
                }
                onSelect={(date) =>
                  setSelectedTimePeriod(
                    date
                      ? {
                          type: selectedTimePeriod?.type || 'week',
                          value: date.toISOString(),
                        }
                      : null
                  )
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      )}
    </div>
  )
} 