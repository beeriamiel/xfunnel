"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileText } from "lucide-react"

interface SidebarNavProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarNav({ className, ...props }: SidebarNavProps) {
  const pathname = usePathname()

  return (
    <div className={cn("pb-12", className)} {...props}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Navigation
          </h2>
          <div className="space-y-1">
            <Button
              variant={pathname === "/protected" ? "secondary" : "ghost"}
              className="w-full justify-start"
              asChild
            >
              <Link href="/protected">
                <FileText className="mr-2 h-4 w-4" />
                Reports
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 