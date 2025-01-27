import * as React from "react"
import { X } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"

interface FilterSidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
  onApply: () => void
  onReset: () => void
}

export function FilterSidebar({
  open,
  onOpenChange,
  children,
  onApply,
  onReset,
}: FilterSidebarProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange} modal>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader className="space-y-2.5">
          <div className="flex items-center justify-between">
            <SheetTitle>Filter & Sort</SheetTitle>
          </div>
          <Separator />
        </SheetHeader>
        
        <ScrollArea className="h-[calc(100vh-10rem)] pr-4">
          <div className="space-y-6 py-6">
            {children}
          </div>
        </ScrollArea>

        <div className="flex items-center gap-2 pt-6">
          <Button
            variant="default"
            className="flex-1"
            onClick={() => {
              onApply()
              onOpenChange(false)
            }}
          >
            Apply Filters
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              onReset()
              onOpenChange(false)
            }}
          >
            Reset
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
} 