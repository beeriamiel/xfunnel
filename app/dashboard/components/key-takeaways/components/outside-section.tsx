"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { KeyTakeawaysData } from "../types"
import { cn } from "@/lib/utils"

interface OutsideSectionProps {
  data: KeyTakeawaysData["outside"]
}

export function OutsideSection({ data }: OutsideSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Outside Sources</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Affiliate Content */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Affiliate Content</h3>
          <div className="grid gap-4">
            {data.affiliateContent.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{item.title}</CardTitle>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="capitalize">
                        {item.type}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={cn(
                          "capitalize",
                          item.priority === "high"
                            ? "border-red-500 text-red-500"
                            : item.priority === "medium"
                            ? "border-yellow-500 text-yellow-500"
                            : "border-green-500 text-green-500"
                        )}
                      >
                        {item.priority} Priority
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-6">
                  <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
                  {item.metrics && (
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      {item.metrics.map((metric, index) => (
                        <div key={index} className="space-y-1">
                          <p className="text-sm font-medium">{metric.name}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Current: {metric.value}</span>
                            <span className="text-sm text-muted-foreground">→</span>
                            <span className="text-sm text-green-500">Potential: {metric.potential}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Action Items:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {item.actionItems.map((action, index) => (
                        <li key={index} className="text-sm text-muted-foreground">
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* UGC Content */}
        <div>
          <h3 className="text-lg font-semibold mb-4">User Generated Content</h3>
          <div className="grid gap-4">
            {data.ugcContent.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{item.title}</CardTitle>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="capitalize">
                        {item.type}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={cn(
                          "capitalize",
                          item.priority === "high"
                            ? "border-red-500 text-red-500"
                            : item.priority === "medium"
                            ? "border-yellow-500 text-yellow-500"
                            : "border-green-500 text-green-500"
                        )}
                      >
                        {item.priority} Priority
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-6">
                  <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
                  {item.metrics && (
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      {item.metrics.map((metric, index) => (
                        <div key={index} className="space-y-1">
                          <p className="text-sm font-medium">{metric.name}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Current: {metric.value}</span>
                            <span className="text-sm text-muted-foreground">→</span>
                            <span className="text-sm text-green-500">Potential: {metric.potential}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Action Items:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {item.actionItems.map((action, index) => (
                        <li key={index} className="text-sm text-muted-foreground">
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 