'use client'

import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from "@/components/ui/form"
import { Question, QuestionFormData } from "./types"

interface QuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question?: Question;
  combinationId: string;
  onSave: (data: QuestionFormData, questionId?: string) => void;
}

export function QuestionDialog({
  open,
  onOpenChange,
  question,
  combinationId,
  onSave
}: QuestionDialogProps) {
  const form = useForm<QuestionFormData>({
    defaultValues: {
      text: question?.text || ''
    }
  })

  const onSubmit = (data: QuestionFormData) => {
    onSave(data, question?.id)
    form.reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{question ? 'Edit' : 'Add'} Question</DialogTitle>
          <DialogDescription>
            {question ? 'Edit the question below.' : 'Add a new question for this ICP and persona.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem>
                  <Label>Question Text</Label>
                  <FormControl>
                    <Input 
                      placeholder="Enter your question"
                      {...field}
                      className="h-20"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button 
                type="submit"
                className="bg-[#30035e] hover:bg-[#30035e]/90"
              >
                {question ? 'Update' : 'Add'} Question
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 