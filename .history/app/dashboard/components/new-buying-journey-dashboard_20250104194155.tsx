'use client'

import { useState, useEffect } from 'react'
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { Globe, Building2, User, Search, ChevronRight } from "lucide-react"
import { useDashboardStore } from '@/app/dashboard/store'
import { CompanyView, VerticalView, PersonaView } from './buying-journey-views'
import { QueriesSection } from './new-buying-journey-analysis'
import { createClient } from '@/app/supabase/client'

// View Types
type ViewType = 'company' | 'region' | 'vertical' | 'persona' | 'queries'

// Selection Types
interface Selection {
  region?: string
  vertical?: string
  persona?: string
}

interface Query {
  id: number;
  text: string;
  buyerJourneyPhase: string;
  engineResults: {
    [engine: string]: {
      rank: number | 'n/a';
      rankList?: string | null;
      responseText?: string;
      recommended?: boolean;
      citations?: string[];
      solutionAnalysis?: {
        has_feature: 'YES' | 'NO' | 'N/A';
      };
      companyMentioned?: boolean;
      mentioned_companies?: string[];
    }
  };
  companyMentioned: boolean;
  companyMentionRate: number;
  companyName?: string;
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
  const [queries, setQueries] = useState<Query[]>([])
  const [isLoadingQueries, setIsLoadingQueries] = useState(false)

  // Fetch queries when needed
  useEffect(() => {
    async function fetchQueries() {
      if (currentView !== 'queries' || !selection.region || !selection.vertical || !selection.persona) {
        return
      }

      try {
        setIsLoadingQueries(true)
        const supabase = createClient()

        // First get all query IDs for the selected filters
        const { data: queryData, error: queryError } = await supabase
          .from('response_analysis')
          .select('query_id, query_text, buying_journey_stage, company_name')
          .eq('company_id', effectiveCompanyId)
          .eq('geographic_region', selection.region)
          .eq('icp_vertical', selection.vertical)
          .eq('buyer_persona', selection.persona)
          .not('query_id', 'is', null)

        if (queryError) throw queryError

        // Get unique query IDs
        const queryIds = Array.from(new Set((queryData || []).map(q => q.query_id)))
        
        if (queryIds.length === 0) {
          setQueries([])
          return
        }

        // Get all responses for these queries
        const { data: responseData, error: responseError } = await supabase
          .from('response_analysis')
          .select(`
            sentiment_score,
            ranking_position,
            company_mentioned,
            solution_analysis,
            buyer_persona,
            query_id,
            buying_journey_stage,
            answer_engine,
            rank_list,
            response_text,
            citations_parsed,
            recommended,
            mentioned_companies
          `)
          .eq('company_id', effectiveCompanyId)
          .eq('geographic_region', selection.region)
          .eq('icp_vertical', selection.vertical)
          .eq('buyer_persona', selection.persona)
          .in('query_id', queryIds)

        if (responseError) throw responseError

        // Process the data into the Query format
        const processedQueries = queryData.map(queryInfo => {
          const queryResponses = responseData.filter(r => r.query_id === queryInfo.query_id)
          const engineResults: Query['engineResults'] = {}

          queryResponses.forEach(response => {
            if (response.answer_engine) {
              let solutionAnalysis
              if (response.solution_analysis && response.buying_journey_stage === 'solution_evaluation') {
                try {
                  const parsedAnalysis = typeof response.solution_analysis === 'string'
                    ? JSON.parse(response.solution_analysis)
                    : response.solution_analysis
                  
                  solutionAnalysis = {
                    has_feature: parsedAnalysis.has_feature
                  }
                } catch (e) {
                  console.warn('Failed to parse solution analysis:', e)
                  solutionAnalysis = {
                    has_feature: 'N/A'
                  }
                }
              }

              engineResults[response.answer_engine] = {
                rank: response.ranking_position || 'n/a',
                rankList: response.rank_list || undefined,
                responseText: response.response_text || undefined,
                recommended: response.recommended || false,
                citations: response.citations_parsed?.urls,
                solutionAnalysis,
                companyMentioned: response.company_mentioned || false,
                mentioned_companies: response.mentioned_companies || []
              }
            }
          })

          // Calculate company mention rate
          const engineCount = Object.keys(engineResults).length
          const mentionCount = Object.values(engineResults)
            .filter(result => result.companyMentioned).length
          const companyMentionRate = engineCount > 0 ? (mentionCount / engineCount) * 100 : 0

          return {
            id: queryInfo.query_id,
            text: queryInfo.query_text,
            buyerJourneyPhase: queryInfo.buying_journey_stage,
            engineResults,
            companyMentioned: companyMentionRate > 0,
            companyMentionRate,
            companyName: queryInfo.company_name
          }
        })

        setQueries(processedQueries)
      } catch (error) {
        console.error('Error fetching queries:', error)
      } finally {
        setIsLoadingQueries(false)
      }
    }

    fetchQueries()
  }, [effectiveCompanyId, currentView, selection])

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
            {currentView === 'company' && (
              <CompanyView
                companyId={effectiveCompanyId}
                onSelectRegion={(region) => handleSelect('region', region)}
                selectedRegion={selection.region}
              />
            )}

            {currentView === 'vertical' && selection.region && (
              <VerticalView
                companyId={effectiveCompanyId}
                region={selection.region}
                onSelectVertical={(vertical) => handleSelect('vertical', vertical)}
                selectedVertical={selection.vertical}
              />
            )}

            {currentView === 'persona' && selection.region && selection.vertical && (
              <PersonaView
                companyId={effectiveCompanyId}
                region={selection.region}
                vertical={selection.vertical}
                onSelectPersona={(persona) => handleSelect('persona', persona)}
                selectedPersona={selection.persona}
              />
            )}

            {currentView === 'queries' && selection.region && selection.vertical && selection.persona && (
              <QueriesSection
                region={selection.region}
                vertical={selection.vertical}
                persona={selection.persona}
                queries={queries}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </Card>
  )
} 