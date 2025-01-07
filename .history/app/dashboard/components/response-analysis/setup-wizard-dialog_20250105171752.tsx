'use client'

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { CompanySetup } from "./company-setup"
import type { ICP, Persona } from "./types"

interface SetupWizardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (completedICPs: ICP[], completedPersonas: Persona[]) => void;
}

export function SetupWizardDialog({ 
  open, 
  onOpenChange,
  onComplete 
}: SetupWizardDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[80vh] flex flex-col p-0">
        <div className="flex-1 overflow-y-auto p-6">
          <CompanySetup 
            onComplete={(icps, personas) => {
              onComplete(icps, personas)
              onOpenChange(false)
            }} 
          />
        </div>
      </DialogContent>
    </Dialog>
  )
} 