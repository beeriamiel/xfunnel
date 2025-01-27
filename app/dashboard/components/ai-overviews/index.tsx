'use client'

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { type AIOverviewsProps } from "./types"
import { KeywordManagement } from "./components/keyword-management"
import { AIOAnalysis } from "./components/aio-analysis"
import { HistoricalTracking } from "./components/historical-tracking"
import { useDashboardStore } from "@/app/dashboard/store"

export function AIOverviews({ companyId, accountId }: AIOverviewsProps) {
  const [activeTab, setActiveTab] = useState<string>('keywords')
  const isSuperAdmin = useDashboardStore(state => state.isSuperAdmin)

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <h2 className="text-2xl font-semibold tracking-tight mb-4">
          AI Overview Analysis
        </h2>
        
        <Tabs defaultValue="keywords" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="keywords">Keywords Management</TabsTrigger>
            <TabsTrigger value="analysis">AIO Analysis</TabsTrigger>
            <TabsTrigger value="tracking">Historical Tracking</TabsTrigger>
          </TabsList>

          <TabsContent value="keywords" className="mt-6">
            <KeywordManagement 
              companyId={companyId}
              accountId={accountId}
              isSuperAdmin={isSuperAdmin}
            />
          </TabsContent>

          <TabsContent value="analysis" className="mt-6">
            <AIOAnalysis
              companyId={companyId}
              accountId={accountId}
              isSuperAdmin={isSuperAdmin}
            />
          </TabsContent>

          <TabsContent value="tracking" className="mt-6">
            <HistoricalTracking
              companyId={companyId}
              accountId={accountId}
              isSuperAdmin={isSuperAdmin}
            />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
} 