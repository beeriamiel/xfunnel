import * as z from 'zod'

export const initialFormSchema = z.object({
  companyName: z.string().min(1, "Company name is required")
})

export type InitialFormData = z.infer<typeof initialFormSchema> 