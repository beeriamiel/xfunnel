"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { FileText, Menu, ChevronRight, Activity, Route, Link2 } from "lucide-react"
import { usePathname, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useState } from "react"
import { useDashboardStore } from "@/app/dashboard/store"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function AppSidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { activeView, setActiveView } = useDashboardStore()
  const isDashboard = pathname === "/dashboard"

  const getHref = (basePath: string) => {
    const params = new URLSearchParams(searchParams.toString())
    return `${basePath}${params.toString() ? `?${params.toString()}` : ''}`
  }

  const nav = [
    {
      items: [
        {
          title: "Generate Report",
          href: "/protected",
          active: pathname === "/protected",
          icon: <FileText className="h-4 w-4" />,
        },
        {
          title: "AI Engine Performance",
          href: getHref("/dashboard"),
          active: isDashboard && activeView === 'engine',
          icon: <Activity className="h-4 w-4" />,
          onClick: () => setActiveView('engine'),
        },
        {
          title: "Buying Journey Analysis",
          href: getHref("/dashboard"),
          active: isDashboard && activeView === 'journey',
          icon: <Route className="h-4 w-4" />,
          onClick: () => setActiveView('journey'),
        },
        {
          title: "Citation Analysis",
          href: getHref("/dashboard"),
          active: isDashboard && activeView === 'citation',
          icon: <Link2 className="h-4 w-4" />,
          onClick: () => setActiveView('citation'),
        },
      ],
    },
  ]

  const SidebarContent = () => (
    <ScrollArea className="h-full">
      <div className="py-2">
        <div className="px-3">
          <div className="space-y-1">
            {nav.map((section) => (
              <div key="main">
                {section.items.map((item) => (
                  <Button
                    key={item.href + item.title}
                    variant={item.active ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start",
                      isCollapsed && "justify-center px-2"
                    )}
                    asChild
                    onClick={item.onClick}
                  >
                    <Link href={item.href}>
                      {item.icon}
                      {!isCollapsed && <span className="ml-2">{item.title}</span>}
                    </Link>
                  </Button>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </ScrollArea>
  )

  return (
    <>
      {/* Mobile Sheet */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="md:hidden absolute left-4 top-3">
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[240px] p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "relative border-r",
          isCollapsed ? "w-[70px]" : "w-[240px]",
          className
        )}
      >
        <Button
          variant="ghost"
          size="sm"
          className="absolute -right-3 top-3 z-10 h-6 w-6 rounded-full bg-background"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <ChevronRight className={cn("h-3 w-3", isCollapsed && "rotate-180")} />
        </Button>
        <SidebarContent />
      </aside>
    </>
  )
}
