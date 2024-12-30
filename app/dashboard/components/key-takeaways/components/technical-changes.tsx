"use client"

import { cn } from "@/lib/utils"
import { Code, ChevronRight, ArrowUpRight } from "lucide-react"
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
import { TechnicalChange } from "../types"
import { useState } from "react"

interface TechnicalChangesProps {
  changes: TechnicalChange[]
}

export function TechnicalChanges({ changes }: TechnicalChangesProps) {
  const [selectedChange, setSelectedChange] = useState<string | null>(null)

  const getImpactColor = (impact: TechnicalChange['impact']) => {
    switch (impact) {
      case 'positive':
        return 'bg-green-500'
      case 'negative':
        return 'bg-red-500'
      case 'neutral':
        return 'bg-blue-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getImpactTextColor = (impact: TechnicalChange['impact']) => {
    switch (impact) {
      case 'positive':
        return 'border-green-500 text-green-500'
      case 'negative':
        return 'border-red-500 text-red-500'
      case 'neutral':
        return 'border-blue-500 text-blue-500'
      default:
        return 'border-gray-500 text-gray-500'
    }
  }

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Code className="h-5 w-5 text-blue-500" />
          <CardTitle>Technical Changes</CardTitle>
        </div>
        <CardDescription>Recent technical updates and their impact</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {changes.map((change) => (
            <Sheet key={change.id}>
              <Card className="relative group hover:shadow-md transition-all">
                <CardHeader className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className={cn(getImpactTextColor(change.impact))}>
                      {change.impact.charAt(0).toUpperCase() + change.impact.slice(1)} Impact
                    </Badge>
                    <Badge variant="outline" className={cn(
                      "h-2 w-2 rounded-full p-1",
                      getImpactColor(change.impact)
                    )} />
                  </div>
                  <CardTitle className="text-base">{change.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground line-clamp-2">{change.description}</p>
                  <div className="flex flex-col space-y-1">
                    <span className="text-xs font-medium">Date</span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(change.date).toLocaleDateString()}
                    </span>
                  </div>
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
                    <Badge variant="outline" className={cn(getImpactTextColor(change.impact))}>
                      {change.impact.charAt(0).toUpperCase() + change.impact.slice(1)} Impact
                    </Badge>
                  </div>
                  <SheetTitle>{change.title}</SheetTitle>
                  <SheetDescription>{change.description}</SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-6">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Details</h4>
                    <p className="text-sm text-muted-foreground">{change.details}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">Date</h4>
                    <p className="text-sm text-muted-foreground">
                      {new Date(change.date).toLocaleDateString()}
                    </p>
                  </div>
                  
                  {change.affectedAreas.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Affected Areas</h4>
                      <div className="flex flex-wrap gap-2">
                        {change.affectedAreas.map((area, i) => (
                          <Badge key={i} variant="secondary" className="text-sm">
                            {area}
                          </Badge>
                        ))}
                      </div>
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