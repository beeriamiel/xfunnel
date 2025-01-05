import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export function LoadingSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  )
}

export function StepLoadingSpinner({ message, className }: { message?: string, className?: string }) {
  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center py-4",
        className
      )}
      role="alert"
      aria-busy="true"
      aria-label={message || "Loading"}
    >
      <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-[#f6efff] border border-[#f9a8c9]">
        <Loader2 className="h-4 w-4 animate-spin text-[#30035e]" />
        {message && (
          <p className="text-sm text-[#30035e]">
            {message}
          </p>
        )}
      </div>
    </div>
  )
} 