'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"
import { Building2, Package, Users, Globe2, ChevronDown, ChevronUp, Pencil } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

interface CompanyProfileHeaderProps {
  company: {
    name: string;
    industry: string;
    mainProducts: string[];
    competitors: string[];
  };
  stats: {
    icps: number;
    personas: number;
    products: number;
    competitors: number;
  };
  onEdit: () => void;
}

export function CompanyProfileHeader({ company, stats, onEdit }: CompanyProfileHeaderProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#f6efff] via-[#f9a8c9] to-[#f6efff]" />
      
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <div className="flex items-center justify-between p-6">
          <div className="space-y-1">
            <CardTitle>{company.name}</CardTitle>
            <CardDescription>{company.industry}</CardDescription>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex gap-3">
              <StatBadge 
                icon={Globe2} 
                label="ICPs"
                value={stats.icps}
              />
              <StatBadge 
                icon={Users} 
                label="Personas"
                value={stats.personas}
              />
              <StatBadge 
                icon={Package} 
                label="Products"
                value={stats.products}
              />
              <StatBadge 
                icon={Building2} 
                label="Competitors"
                value={stats.competitors}
              />
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onEdit}
                className="text-[#30035e] border-[#30035e] hover:bg-[#30035e]/10"
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>

              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                >
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <CollapsibleContent asChild>
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <CardContent className="pb-6">
                  <div className="grid grid-cols-2 gap-8">
                    {/* Products */}
                    <div className="space-y-3">
                      <h3 className="font-medium flex items-center gap-2">
                        <Package className="h-4 w-4 text-[#f9a8c9]" />
                        Products
                      </h3>
                      <div className="space-y-2">
                        {company.mainProducts.map((product, i) => (
                          <div
                            key={i}
                            className="p-2 rounded-md bg-[#f6efff]/50 text-sm"
                          >
                            {product}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Competitors */}
                    <div className="space-y-3">
                      <h3 className="font-medium flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-[#f9a8c9]" />
                        Competitors
                      </h3>
                      <div className="space-y-2">
                        {company.competitors.map((competitor, i) => (
                          <div
                            key={i}
                            className="p-2 rounded-md bg-[#f6efff]/50 text-sm"
                          >
                            {competitor}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </motion.div>
            </CollapsibleContent>
          )}
        </AnimatePresence>
      </Collapsible>
    </Card>
  )
}

function StatBadge({ 
  icon: Icon, 
  label, 
  value 
}: { 
  icon: React.ElementType;
  label: string;
  value: number;
}) {
  return (
    <Badge 
      variant="outline" 
      className={cn(
        "py-1 px-2 flex items-center gap-1.5",
        "bg-[#f6efff]/50 hover:bg-[#f6efff] border-[#f9a8c9]/20",
        "transition-colors duration-200"
      )}
    >
      <Icon className="h-3.5 w-3.5 text-[#f9a8c9]" />
      <span className="font-normal text-muted-foreground">{label}</span>
      <span className="font-medium text-[#30035e]">{value}</span>
    </Badge>
  )
} 