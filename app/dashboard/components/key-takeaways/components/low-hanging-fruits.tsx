"use client"

import { cn } from "@/lib/utils"
import { Lightbulb, ChevronRight, ArrowUpRight, Clock, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { LowHangingFruit } from "../types"
import { useState } from "react"

interface LowHangingFruitsProps {
  opportunities: LowHangingFruit[]
}

export function LowHangingFruits({ opportunities }: LowHangingFruitsProps) {
  const [selectedOpportunity, setSelectedOpportunity] = useState<string | null>(null)

  const getImpactColor = (impact: LowHangingFruit['impact']) => {
    switch (impact) {
      case 'high':
        return 'bg-green-500'
      case 'medium':
        return 'bg-blue-500'
      case 'low':
        return 'bg-yellow-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getImpactTextColor = (impact: LowHangingFruit['impact']) => {
    switch (impact) {
      case 'high':
        return 'border-green-500 text-green-500'
      case 'medium':
        return 'border-blue-500 text-blue-500'
      case 'low':
        return 'border-yellow-500 text-yellow-500'
      default:
        return 'border-gray-500 text-gray-500'
    }
  }

  return (
    <Card className="border-l-4 border-l-green-500">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-green-500" />
          <CardTitle>Low Hanging Fruits</CardTitle>
        </div>
        <CardDescription>Quick wins with high impact potential</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {opportunities.map((opportunity) => (
            <Sheet key={opportunity.id}>
              <Card className="relative group hover:shadow-md transition-all">
                <CardHeader className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className={cn(getImpactTextColor(opportunity.impact))}>
                      {opportunity.impact.charAt(0).toUpperCase() + opportunity.impact.slice(1)} Impact
                    </Badge>
                    <Badge variant="outline" className={cn(
                      "h-2 w-2 rounded-full p-1",
                      getImpactColor(opportunity.impact)
                    )} />
                  </div>
                  <CardTitle className="text-base">{opportunity.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground line-clamp-2">{opportunity.description}</p>
                  <div className="flex gap-2 items-center">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{opportunity.estimatedEffort}</span>
                  </div>
                  {opportunity.metrics && opportunity.metrics.length > 0 && (
                    <div className="grid grid-cols-2 gap-2">
                      {opportunity.metrics.slice(0, 1).map((metric, i) => (
                        <div key={i} className="flex flex-col p-2 bg-muted rounded-lg">
                          <span className="text-xs font-medium">{metric.name}</span>
                          <div className="flex items-center gap-1">
                            <span className="text-sm text-muted-foreground">{metric.value}</span>
                            <Target className="h-3 w-3 text-green-500" />
                            <span className="text-xs text-green-500">{metric.potential}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <SheetTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      size="sm"
                    >
                      <ArrowUpRight className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                  </SheetTrigger>
                </CardContent>
              </Card>
              <SheetContent className="w-[400px] sm:w-[540px]">
                <SheetHeader>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={cn(getImpactTextColor(opportunity.impact))}>
                      {opportunity.impact.charAt(0).toUpperCase() + opportunity.impact.slice(1)} Impact
                    </Badge>
                  </div>
                  <SheetTitle>{opportunity.title}</SheetTitle>
                  <SheetDescription>{opportunity.description}</SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{opportunity.estimatedEffort}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-500">{opportunity.potentialImpact}</span>
                    </div>
                  </div>

                  {opportunity.metrics && opportunity.metrics.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-3">Metrics & Potential</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {opportunity.metrics.map((metric, i) => (
                          <div key={i} className="flex flex-col p-3 bg-muted rounded-lg">
                            <span className="text-sm font-medium">{metric.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">{metric.value}</span>
                              <span className="text-xs text-green-500">→ {metric.potential}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {opportunity.actionItems.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Action Items</h4>
                      <ul className="space-y-2">
                        {opportunity.actionItems.map((item, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <ChevronRight className="h-4 w-4 mt-0.5 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 