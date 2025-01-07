"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { 
  FileText, 
  Menu, 
  ChevronRight, 
  Activity, 
  Route, 
  Link2, 
  Lightbulb,
  UserCircle,
  HelpCircle,
  LayoutDashboard,
  LineChart,
  Target
} from "lucide-react"
import { usePathname, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useState } from "react"
import { useDashboardStore, type DashboardView } from "@/app/dashboard/store"
import { ProBadge } from "@/components/ui/pro-badge"
import { Badge } from "@/components/ui/badge"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

interface NavItem {
  title: string
  href: string
  active: boolean
  icon: React.ReactNode
  view: DashboardView
  badge?: React.ReactNode
}

interface NavSection {
  title: string
  items: NavItem[]
}

const DASHBOARD_LINKS = [
  {
    href: "/dashboard",
    label: "Overview",
    icon: LayoutDashboard,
  },
  {
    href: "/dashboard/engine-metrics",
    label: "Engine Metrics",
    icon: LineChart,
  },
  {
    href: "/dashboard/icp-analysis",
    label: "ICP Analysis",
    icon: Target,
  },
] as const

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

  const nav: NavSection[] = [
    {
      title: "Dashboard",
      items: [
        {
          title: "AI Engine Performance",
          href: getHref("/dashboard"),
          active: isDashboard && activeView === 'engine',
          icon: <Activity className="h-4 w-4" />,
          view: 'engine',
        },
        {
          title: "Buying Journey Analysis",
          href: getHref("/dashboard"),
          active: isDashboard && activeView === 'journey',
          icon: <Route className="h-4 w-4" />,
          view: 'journey',
        },
        {
          title: "ICP Analysis",
          href: getHref("/dashboard"),
          active: isDashboard && activeView === 'icp',
          icon: <Target className="h-4 w-4" />,
          view: 'icp',
        },
        {
          title: "Citation Analysis",
          href: getHref("/dashboard"),
          active: isDashboard && activeView === 'citation',
          icon: <Link2 className="h-4 w-4" />,
          view: 'citation',
          badge: <ProBadge />,
        },
        {
          title: "Key Takeaways",
          href: getHref("/dashboard"),
          active: isDashboard && activeView === 'takeaways',
          icon: <Lightbulb className="h-4 w-4" />,
          view: 'takeaways',
          badge: <ProBadge />,
        },
      ],
    },
    {
      title: "Generate",
      items: [
        {
          title: "Generate Analysis",
          href: getHref("/dashboard"),
          active: isDashboard && activeView === 'response',
          icon: <FileText className="h-4 w-4" />,
          view: 'response',
        },
      ],
    },
    {
      title: "System",
      items: [
        {
          title: "Personal",
          href: getHref("/dashboard"),
          active: isDashboard && activeView === 'personal',
          icon: <UserCircle className="h-4 w-4" />,
          view: 'personal',
        },
        {
          title: "FAQs",
          href: getHref("/dashboard"),
          active: isDashboard && activeView === 'faqs',
          icon: <HelpCircle className="h-4 w-4" />,
          view: 'faqs',
        },
      ],
    },
  ]

  const handleNavigation = (item: NavItem, e: React.MouseEvent) => {
    e.preventDefault()
    setActiveView(item.view)
  }

  const SidebarContent = () => (
    <ScrollArea className="h-full">
      <div className="py-2">
        {nav.map((section) => (
          <div key={section.title} className="px-3 py-2">
            {!isCollapsed && (
              <h2 className="mb-2 px-2 text-sm font-semibold text-muted-foreground">
                {section.title}
              </h2>
            )}
            <div className="space-y-1">
              {section.items.map((item) => (
                <Button
                  key={item.href + item.title}
                  variant={item.active ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    isCollapsed && "justify-center px-2"
                  )}
                  asChild
                >
                  <Link 
                    href={item.href} 
                    onClick={(e) => handleNavigation(item, e)}
                  >
                    {item.icon}
                    {!isCollapsed && (
                      <span className="ml-2 flex items-center">
                        {item.title}
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </Button>
              ))}
            </div>
          </div>
        ))}
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
