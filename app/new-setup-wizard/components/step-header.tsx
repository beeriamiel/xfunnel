import { cn } from '@/lib/utils'

interface StepHeaderProps {
  title: string
  description: string
  className?: string
}

const stepDescriptions = {
  company: "Let's start with your company details",
  products: "What products or services do you offer?",
  competitors: "Who are your main competitors?",
  icps: "Define your ideal customer profiles",
  personas: "Who are the key decision makers?",
  review: "Review and confirm your setup"
}

export function StepHeader({ title, description, className }: StepHeaderProps) {
  return (
    <div className={cn("mb-6", className)}>
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      <p className="text-sm text-muted-foreground mt-1">{description}</p>
    </div>
  )
} 