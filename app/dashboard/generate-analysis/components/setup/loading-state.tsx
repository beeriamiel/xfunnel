import { Card } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { design } from '../../lib/design-system'

export function GenerationLoadingState() {
  return (
    <Card className={cn(design.layout.card, design.spacing.card)}>
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-[#30035e]" />
        <div className="space-y-2 text-center">
          <h3 className={design.typography.title}>
            Generating Company Profile
          </h3>
          <p className={design.typography.subtitle}>
            Creating your ICPs, competitors, and personas...
          </p>
        </div>
      </div>
    </Card>
  )
} 