'use client'

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Globe, Building2, User } from "lucide-react"
import { motion } from "framer-motion"
import { createClient } from '@/app/supabase/client'
import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"

// Reuse types from existing dashboard
interface TimeSegment {
  id: string
  type: 'BATCH' | 'WEEK' | 'MONTH'
  startDate: string
  endDate: string
  displayName: string
}

interface Metrics {
  avgSentiment?: number
  avgPosition?: number | null
  companyMentioned?: number
  featureScore?: number
  totalQueries?: number
}

// Base Card Component for all views
interface BaseCardProps {
  title: string
  subtitle: string
  icon: any
  metrics: Metrics
  totalQueries?: number
  onClick: () => void
  isSelected?: boolean
}

function BaseCard({
  title,
  subtitle,
  icon: Icon,
  metrics,
  totalQueries,
  onClick,
  isSelected
}: BaseCardProps) {
  return (
    <Card 
      className={cn(
        "p-4 hover:bg-accent/10 cursor-pointer transition-all duration-200 border-[0.5px] border-border/40",
        isSelected && "shadow-[0_0_15px_rgba(147,51,234,0.15)] border-purple-500/30 bg-purple-50/30"
      )}
      onClick={onClick}
    >
      <div className="space-y-3">
        <div className="flex items-start gap-3 mb-3">
          <div className="p-2 rounded-lg bg-primary/10 shrink-0 mt-0.5">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-medium line-clamp-2">{title}</h3>
            <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{subtitle}</p>
          </div>
        </div>

        {totalQueries !== undefined && (
          <div className="flex items-center justify-between">
            <div className="px-2 py-0.5 bg-primary/10 rounded-full flex items-center gap-1.5">
              <span className="text-xs font-medium">{metrics.totalQueries || 0}</span>
              <span className="text-xs text-muted-foreground">/</span>
              <span className="text-xs text-muted-foreground">{totalQueries}</span>
              <span className="text-xs text-muted-foreground">queries</span>
            </div>
            <div className="h-1.5 w-32 bg-primary/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${((metrics.totalQueries || 0) / totalQueries) * 100}%` }}
              />
            </div>
          </div>
        )}

        <div className="space-y-1 mt-4">
          <MetricItem 
            label="Company Mentioned" 
            value={metrics.companyMentioned}
            metricType="mentions"
          />
          <MetricItem 
            label="Average Position" 
            value={metrics.avgPosition}
            metricType="position"
          />
          <MetricItem 
            label="Feature Score" 
            value={metrics.featureScore}
            metricType="features"
          />
          <MetricItem 
            label="Average Sentiment" 
            value={metrics.avgSentiment ? metrics.avgSentiment * 100 : undefined}
            metricType="sentiment"
          />
        </div>
      </div>
    </Card>
  )
}

// Metric Item Component (reused from existing dashboard)
function MetricItem({ 
  label, 
  value, 
  metricType 
}: { 
  label: string
  value: number | null | undefined
  metricType?: 'sentiment' | 'position' | 'mentions' | 'features'
}) {
  function formatMetricValue(value: number | null | undefined): string {
    if (value === null || value === undefined) return 'N/A'
    return `${Math.round(value)}%`
  }

  function getMetricStatus(value: number | null | undefined, type: 'sentiment' | 'position' | 'mentions' | 'features') {
    if (value === null || value === undefined) return { color: 'red', icon: '🔴' }
    
    switch (type) {
      case 'mentions':
        return value >= 40 ? { color: 'green', icon: '🟢' } :
               value >= 15 ? { color: 'yellow', icon: '🟡' } :
               { color: 'red', icon: '🔴' }
      case 'position':
        return value < 3 ? { color: 'green', icon: '🟢' } :
               value <= 5 ? { color: 'yellow', icon: '🟡' } :
               { color: 'red', icon: '🔴' }
      case 'features':
        return value >= 60 ? { color: 'green', icon: '🟢' } :
               value >= 40 ? { color: 'yellow', icon: '🟡' } :
               { color: 'red', icon: '🔴' }
      case 'sentiment':
        return value >= 50 ? { color: 'green', icon: '🟢' } :
               value >= 30 ? { color: 'yellow', icon: '🟡' } :
               { color: 'red', icon: '🔴' }
    }
  }

  const status = metricType ? getMetricStatus(value, metricType) : null
  const formattedValue = formatMetricValue(value)

  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">{formattedValue}</span>
        {status && (
          <span className="text-sm" title={`Status: ${status.color}`}>
            {status.icon}
          </span>
        )}
      </div>
    </div>
  )
}

// Company View (shows regions)
export function CompanyView({ 
  companyId,
  onSelectRegion,
  selectedRegion
}: { 
  companyId: number
  onSelectRegion: (region: string) => void
  selectedRegion?: string
}) {
  const [regions, setRegions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchRegions() {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('response_analysis')
          .select('geographic_region, sentiment_score, ranking_position, company_mentioned')
          .eq('company_id', companyId)
          .not('geographic_region', 'is', null)

        if (error) throw error

        // Process regions data
        const regionMap = new Map()
        data?.forEach(item => {
          const region = item.geographic_region
          if (!regionMap.has(region)) {
            regionMap.set(region, {
              name: region,
              metrics: {
                sentimentScores: [],
                positions: [],
                mentions: 0,
                total: 0
              }
            })
          }

          const regionData = regionMap.get(region)
          if (item.sentiment_score !== null) {
            regionData.metrics.sentimentScores.push(item.sentiment_score)
          }
          if (item.ranking_position !== null) {
            regionData.metrics.positions.push(item.ranking_position)
          }
          if (item.company_mentioned) {
            regionData.metrics.mentions++
          }
          regionData.metrics.total++
        })

        // Convert to final format
        const processedRegions = Array.from(regionMap.entries()).map(([name, data]: [string, any]) => ({
          name,
          metrics: {
            avgSentiment: data.metrics.sentimentScores.length > 0
              ? data.metrics.sentimentScores.reduce((a: number, b: number) => a + b, 0) / data.metrics.sentimentScores.length
              : 0,
            avgPosition: data.metrics.positions.length > 0
              ? data.metrics.positions.reduce((a: number, b: number) => a + b, 0) / data.metrics.positions.length
              : null,
            companyMentioned: (data.metrics.mentions / data.metrics.total) * 100,
            totalQueries: data.metrics.total
          }
        }))

        setRegions(processedRegions)
      } catch (error) {
        console.error('Error fetching regions:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRegions()
  }, [companyId])

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </Card>
        ))}
      </div>
    )
  }

  const totalQueries = regions.reduce((sum, region) => sum + (region.metrics.totalQueries || 0), 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="grid grid-cols-1 md:grid-cols-3 gap-4"
    >
      {regions.map((region) => (
        <BaseCard
          key={region.name}
          title={region.name}
          subtitle="Regional Overview"
          icon={Globe}
          metrics={region.metrics}
          totalQueries={totalQueries}
          onClick={() => onSelectRegion(region.name)}
          isSelected={selectedRegion === region.name}
        />
      ))}
    </motion.div>
  )
}

// Vertical View (shows verticals for selected region)
export function VerticalView({ 
  companyId,
  region,
  onSelectVertical,
  selectedVertical
}: { 
  companyId: number
  region: string
  onSelectVertical: (vertical: string) => void
  selectedVertical?: string
}) {
  const [verticals, setVerticals] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchVerticals() {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('response_analysis')
          .select('icp_vertical, sentiment_score, ranking_position, company_mentioned')
          .eq('company_id', companyId)
          .eq('geographic_region', region)
          .not('icp_vertical', 'is', null)

        if (error) throw error

        // Process verticals data (similar to regions)
        const verticalMap = new Map()
        data?.forEach(item => {
          const vertical = item.icp_vertical
          if (!verticalMap.has(vertical)) {
            verticalMap.set(vertical, {
              name: vertical,
              metrics: {
                sentimentScores: [],
                positions: [],
                mentions: 0,
                total: 0
              }
            })
          }

          const verticalData = verticalMap.get(vertical)
          if (item.sentiment_score !== null) {
            verticalData.metrics.sentimentScores.push(item.sentiment_score)
          }
          if (item.ranking_position !== null) {
            verticalData.metrics.positions.push(item.ranking_position)
          }
          if (item.company_mentioned) {
            verticalData.metrics.mentions++
          }
          verticalData.metrics.total++
        })

        // Convert to final format
        const processedVerticals = Array.from(verticalMap.entries()).map(([name, data]: [string, any]) => ({
          name,
          metrics: {
            avgSentiment: data.metrics.sentimentScores.length > 0
              ? data.metrics.sentimentScores.reduce((a: number, b: number) => a + b, 0) / data.metrics.sentimentScores.length
              : 0,
            avgPosition: data.metrics.positions.length > 0
              ? data.metrics.positions.reduce((a: number, b: number) => a + b, 0) / data.metrics.positions.length
              : null,
            companyMentioned: (data.metrics.mentions / data.metrics.total) * 100,
            totalQueries: data.metrics.total
          }
        }))

        setVerticals(processedVerticals)
      } catch (error) {
        console.error('Error fetching verticals:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchVerticals()
  }, [companyId, region])

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </Card>
        ))}
      </div>
    )
  }

  const totalQueries = verticals.reduce((sum, vertical) => sum + (vertical.metrics.totalQueries || 0), 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="grid grid-cols-1 md:grid-cols-3 gap-4"
    >
      {verticals.map((vertical) => (
        <BaseCard
          key={vertical.name}
          title={vertical.name}
          subtitle="Industry Analysis"
          icon={Building2}
          metrics={vertical.metrics}
          totalQueries={totalQueries}
          onClick={() => onSelectVertical(vertical.name)}
          isSelected={selectedVertical === vertical.name}
        />
      ))}
    </motion.div>
  )
}

// Persona View (shows personas for selected vertical)
export function PersonaView({ 
  companyId,
  region,
  vertical,
  onSelectPersona,
  selectedPersona
}: { 
  companyId: number
  region: string
  vertical: string
  onSelectPersona: (persona: string) => void
  selectedPersona?: string
}) {
  const [personas, setPersonas] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchPersonas() {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('response_analysis')
          .select('buyer_persona, sentiment_score, ranking_position, company_mentioned')
          .eq('company_id', companyId)
          .eq('geographic_region', region)
          .eq('icp_vertical', vertical)
          .not('buyer_persona', 'is', null)

        if (error) throw error

        // Process personas data (similar to regions and verticals)
        const personaMap = new Map()
        data?.forEach(item => {
          const persona = item.buyer_persona
          if (!personaMap.has(persona)) {
            personaMap.set(persona, {
              name: persona,
              metrics: {
                sentimentScores: [],
                positions: [],
                mentions: 0,
                total: 0
              }
            })
          }

          const personaData = personaMap.get(persona)
          if (item.sentiment_score !== null) {
            personaData.metrics.sentimentScores.push(item.sentiment_score)
          }
          if (item.ranking_position !== null) {
            personaData.metrics.positions.push(item.ranking_position)
          }
          if (item.company_mentioned) {
            personaData.metrics.mentions++
          }
          personaData.metrics.total++
        })

        // Convert to final format
        const processedPersonas = Array.from(personaMap.entries()).map(([name, data]: [string, any]) => ({
          name,
          metrics: {
            avgSentiment: data.metrics.sentimentScores.length > 0
              ? data.metrics.sentimentScores.reduce((a: number, b: number) => a + b, 0) / data.metrics.sentimentScores.length
              : 0,
            avgPosition: data.metrics.positions.length > 0
              ? data.metrics.positions.reduce((a: number, b: number) => a + b, 0) / data.metrics.positions.length
              : null,
            companyMentioned: (data.metrics.mentions / data.metrics.total) * 100,
            totalQueries: data.metrics.total
          }
        }))

        setPersonas(processedPersonas)
      } catch (error) {
        console.error('Error fetching personas:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPersonas()
  }, [companyId, region, vertical])

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </Card>
        ))}
      </div>
    )
  }

  const totalQueries = personas.reduce((sum, persona) => sum + (persona.metrics.totalQueries || 0), 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="grid grid-cols-1 md:grid-cols-3 gap-4"
    >
      {personas.map((persona) => (
        <BaseCard
          key={persona.name}
          title={persona.name}
          subtitle="Buyer Persona"
          icon={User}
          metrics={persona.metrics}
          totalQueries={totalQueries}
          onClick={() => onSelectPersona(persona.name)}
          isSelected={selectedPersona === persona.name}
        />
      ))}
    </motion.div>
  )
} 