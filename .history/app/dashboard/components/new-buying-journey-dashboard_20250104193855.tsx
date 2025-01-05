'use client'

import { useState } from 'react'
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { Globe, Building2, User, Search, ChevronRight } from "lucide-react"
import { useDashboardStore } from '@/app/dashboard/store'

// View Types
type ViewType = 'company' | 'region' | 'vertical' | 'persona' | 'queries'

// Selection Types
interface Selection {
  region?: string
  vertical?: string
  persona?: string
}

// Progress Item Component
function ProgressItem({ 
  label, 
  icon: Icon, 
  isActive, 
  isCompleted,
  onClick 
}: { 
  label: string
  icon: any
  isActive: boolean
  isCompleted: boolean
  onClick: () => void
}) {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all",
        isActive && "bg-primary text-primary-foreground",
        isCompleted && "bg-primary/10 text-primary",
        !isActive && !isCompleted && "text-muted-foreground hover:text-foreground"
      )}
    >
      <Icon className="h-4 w-4" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  )
}

// Progress Navigation Component
function ProgressNavigation({ 
  currentView, 
  selection,
  onNavigate 
}: { 
  currentView: ViewType
  selection: Selection
  onNavigate: (view: ViewType) => void
}) {
  const items = [
    { type: 'company' as const, label: 'Company', icon: Globe },
    { type: 'region' as const, label: selection.region || 'Region', icon: Globe },
    { type: 'vertical' as const, label: selection.vertical || 'Vertical', icon: Building2 },
    { type: 'persona' as const, label: selection.persona || 'Persona', icon: User },
    { type: 'queries' as const, label: 'Queries', icon: Search }
  ]

  const viewIndex = items.findIndex(item => item.type === currentView)

  return (
    <div className="flex items-center gap-2 mb-6 bg-accent/5 p-2 rounded-lg">
      {items.map((item, index) => {
        const isActive = item.type === currentView
        const isCompleted = index < viewIndex
        const isAvailable = index <= viewIndex

        if (!isAvailable) return null

        return (
          <div key={item.type} className="flex items-center">
            <ProgressItem
              label={item.label}
              icon={item.icon}
              isActive={isActive}
              isCompleted={isCompleted}
              onClick={() => isAvailable && onNavigate(item.type)}
            />
            {index < items.length - 1 && index < viewIndex && (
              <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground" />
            )}
          </div>
        )
      })}
    </div>
  )
}

// Main Component
export function NewBuyingJourneyDashboard({ companyId }: { companyId?: number }) {
  const selectedCompanyId = useDashboardStore(state => state.selectedCompanyId)
  const effectiveCompanyId = companyId ?? selectedCompanyId

  const [currentView, setCurrentView] = useState<ViewType>('company')
  const [selection, setSelection] = useState<Selection>({})

  const handleNavigate = (view: ViewType) => {
    setCurrentView(view)
  }

  const handleSelect = (type: keyof Selection, value: string) => {
    setSelection(prev => ({ ...prev, [type]: value }))
    const nextView = {
      region: 'vertical',
      vertical: 'persona',
      persona: 'queries'
    }[type] as ViewType
    setCurrentView(nextView)
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Buying Journey Analysis</h2>
          <p className="text-muted-foreground">Analyze your performance across different stages</p>
        </div>

        <ProgressNavigation
          currentView={currentView}
          selection={selection}
          onNavigate={handleNavigate}
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* View Components will be added here */}
            <div className="min-h-[400px] flex items-center justify-center text-muted-foreground">
              {currentView.charAt(0).toUpperCase() + currentView.slice(1)} View Coming Soon
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </Card>
  )
} 