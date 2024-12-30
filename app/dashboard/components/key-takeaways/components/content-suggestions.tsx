"use client"

import { cn } from "@/lib/utils"
import { Lightbulb, ChevronRight, Grid, Route, Users, ArrowUpRight } from "lucide-react"
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
import { ContentSuggestion } from "../types"
import { useState } from "react"

interface ContentSuggestionsProps {
  suggestions: ContentSuggestion[]
}

export function ContentSuggestions({ suggestions }: ContentSuggestionsProps) {
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null)

  const getPriorityColor = (priority: ContentSuggestion['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500'
      case 'medium':
        return 'bg-yellow-500'
      case 'low':
        return 'bg-green-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getCategoryIcon = (category: ContentSuggestion['category']) => {
    switch (category) {
      case 'query-answer-matrix':
        return <Grid className="h-4 w-4" />
      case 'buying-journey':
        return <Route className="h-4 w-4" />
      case 'competitor-analysis':
        return <Users className="h-4 w-4" />
      default:
        return <Lightbulb className="h-4 w-4" />
    }
  }

  const getCategoryLabel = (category: ContentSuggestion['category']) => {
    switch (category) {
      case 'query-answer-matrix':
        return 'Query-Answer Matrix'
      case 'buying-journey':
        return 'Buying Journey'
      case 'competitor-analysis':
        return 'Competitor Analysis'
      default:
        return category
    }
  }

  const getCategoryColor = (category: ContentSuggestion['category']) => {
    switch (category) {
      case 'query-answer-matrix':
        return 'text-blue-500 border-blue-500'
      case 'buying-journey':
        return 'text-purple-500 border-purple-500'
      case 'competitor-analysis':
        return 'text-orange-500 border-orange-500'
      default:
        return 'text-gray-500 border-gray-500'
    }
  }

  return (
    <Card className="border-l-4 border-l-green-500">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-green-500" />
          <CardTitle>Content Suggestions</CardTitle>
        </div>
        <CardDescription>Recommendations for content improvement</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {suggestions.map((suggestion) => (
            <Sheet key={suggestion.id}>
              <Card className="relative group hover:shadow-md transition-all">
                <CardHeader className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className={cn("flex items-center gap-1", getCategoryColor(suggestion.category))}>
                      {getCategoryIcon(suggestion.category)}
                      {getCategoryLabel(suggestion.category)}
                    </Badge>
                    <Badge variant="outline" className={cn(
                      "h-2 w-2 rounded-full p-1",
                      getPriorityColor(suggestion.priority)
                    )} />
                  </div>
                  <CardTitle className="text-base">{suggestion.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground line-clamp-2">{suggestion.description}</p>
                  {suggestion.metrics && (
                    <div className="grid grid-cols-2 gap-2">
                      {suggestion.metrics.slice(0, 1).map((metric, i) => (
                        <div key={i} className="flex flex-col p-2 bg-muted rounded-lg">
                          <span className="text-xs font-medium">{metric.name}</span>
                          <span className="text-sm text-muted-foreground">{metric.value}</span>
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
                    <Badge variant="outline" className={cn("flex items-center gap-1", getCategoryColor(suggestion.category))}>
                      {getCategoryIcon(suggestion.category)}
                      {getCategoryLabel(suggestion.category)}
                    </Badge>
                    <Badge variant="outline" className={cn(
                      suggestion.priority === 'high' && "border-red-500 text-red-500",
                      suggestion.priority === 'medium' && "border-yellow-500 text-yellow-500",
                      suggestion.priority === 'low' && "border-green-500 text-green-500"
                    )}>
                      {suggestion.priority.charAt(0).toUpperCase() + suggestion.priority.slice(1)} Priority
                    </Badge>
                  </div>
                  <SheetTitle>{suggestion.title}</SheetTitle>
                  <SheetDescription>{suggestion.description}</SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-6">
                  {suggestion.metrics && (
                    <div>
                      <h4 className="text-sm font-medium mb-3">Metrics</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {suggestion.metrics.map((metric, i) => (
                          <div key={i} className="flex flex-col p-3 bg-muted rounded-lg">
                            <span className="text-sm font-medium">{metric.name}</span>
                            <div className="flex flex-col gap-1">
                              <span className="text-sm text-muted-foreground">Current: {metric.value}</span>
                              <span className="text-sm text-green-500 font-medium">Potential: {metric.potential}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {suggestion.actionItems.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Action Items</h4>
                      <ul className="space-y-2">
                        {suggestion.actionItems.map((item, i) => (
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