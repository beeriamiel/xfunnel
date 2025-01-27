'use client'

import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import type { ICP } from '../../types/analysis'

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  icpId: z.string().min(1, "ICP is required"),
})

type FormValues = z.infer<typeof formSchema>

interface AddPersonaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: FormValues) => Promise<void>
  icps: ICP[]
}

export function AddPersonaDialog({ 
  open, 
  onOpenChange, 
  onSubmit,
  icps 
}: AddPersonaDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      icpId: '',
    },
  })

  const handleSubmit = async (values: FormValues) => {
    try {
      await onSubmit(values)
      form.reset()
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to create Persona:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Persona</DialogTitle>
          <DialogDescription>
            Create a new Persona for your selected ICP.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="icpId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ICP</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an ICP" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {icps.map((icp) => (
                        <SelectItem key={icp.id} value={icp.id.toString()}>
                          {icp.region} - {icp.vertical} - {icp.company_size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. VP of Marketing" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Persona</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 