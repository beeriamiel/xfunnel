'use client'

import { useEffect, useState } from 'react'
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
import { fetchAvailableBatches } from '../../service'
import { Skeleton } from '@/components/ui/skeleton'

interface TimeFilterProps {
  className?: string
}

interface Batch {
  analysis_batch_id: string
  created_at: string
}

export function TimeFilter({ className }: TimeFilterProps) {
  const [batches, setBatches] = useState<Batch[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const {
    filterType,
    selectedBatchId,
    selectedTimePeriod,
    setFilterType,
    setSelectedBatchId,
    setSelectedTimePeriod,
  } = useJourneyStore()

  useEffect(() => {
    async function loadBatches() {
      setIsLoading(true)
      try {
        const data = await fetchAvailableBatches(1)
        setBatches(data)
      } catch (error) {
        console.error('Error loading batches:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadBatches()
  }, [])

  if (isLoading) {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="flex items-center space-x-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      <RadioGroup
        value={filterType}
        onValueChange={(value: string) => {
          setFilterType(value as 'batch' | 'time')
          setSelectedBatchId(null)
          setSelectedTimePeriod(null)
        }}
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
            {batches.map((batch: Batch) => (
              <SelectItem key={batch.analysis_batch_id} value={batch.analysis_batch_id}>
                {format(new Date(batch.created_at), 'MMM dd, yyyy')}
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
                disabled={!selectedTimePeriod?.type}
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