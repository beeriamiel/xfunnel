"use client"

import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip"

interface ProBadgeProps {
  className?: string
}

export function ProBadge({ className }: ProBadgeProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              "ml-2 inline-flex items-center rounded-full px-1.5 py-0.5 text-xs font-medium",
              "bg-gradient-to-r from-indigo-500/80 to-indigo-600/80",
              "text-white shadow-sm ring-1 ring-inset ring-white/20",
              "transition-all duration-200 ease-in-out",
              "hover:from-indigo-500 hover:to-indigo-600",
              "hover:ring-white/30 hover:shadow-md",
              className
            )}
            aria-label="Premium feature"
          >
            PRO
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">Premium feature</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
} 