'use client'

import * as React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Plus, ChevronDown, ChevronRight, Loader2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { QueryRow } from './query-row'
import { ExpandedQueryRow } from './expanded-query-row'
import type { ICP, QueryAction } from '@/app/dashboard/generate-analysis/types/analysis'
import { fetchPersonaStats, type StatsMap } from '@/lib/services/persona-stats'
import { AddICPDialog } from './add-icp-dialog'
import { AddPersonaDialog } from './add-persona-dialog'
import { toast } from "sonner"
import { createICP, createPersona } from '../../utils/db-operations'
import { useDashboardStore } from '@/app/dashboard/store'
import { getCompanyProfile } from '../../utils/actions'
import type { CompanyProfile } from '../../types/analysis'
import { generateResponsesAction, type EngineSelection } from '@/app/company-actions'
import { generateQuestionsAction } from '@/app/company-actions'
import { Database } from '@/types/supabase'
import { useQueryStore } from '@/app/dashboard/generate-analysis/store/query-store'
import { createClient } from '@/app/supabase/client'
import { Badge } from "@/components/ui/badge"

interface QueryRowData {
  id: number;
  query_text: string;
  responses: {
    id: number;
    response_batch_id: string | null;
  }[];
  buyer_journey_phase?: string[] | null;
  created_at?: string | null;
  prompt_id?: number | null;
  persona_id?: number | null;
  company_id?: number | null;
  user_id?: string | null;
  query_batch_id?: string | null;
  created_by_batch?: boolean | null;
  lastResponseDate?: string | null;
  productId: number;
}

interface ResponseTableProps {
  icps: ICP[]
  companyId: number
  companyName: string
  accountId: string
  onGenerateQuestions?: (selectedIds: string[]) => Promise<void>
  onGenerateResponses?: (selectedIds: string[]) => Promise<void>
  productId?: number
}

export function ResponseTable({ 
  icps,
  companyId,
  companyName,
  accountId,
  onGenerateQuestions,
  onGenerateResponses,
  productId
}: ResponseTableProps) {
  const [expandedPersonaId, setExpandedPersonaId] = React.useState<number | null>(null)
  const [isLoadingStats, setIsLoadingStats] = React.useState(true)
  const [stats, setStats] = React.useState<StatsMap>({})
  const [localICPs, setLocalICPs] = React.useState(icps)
  const [showAddICPDialog, setShowAddICPDialog] = React.useState(false)
  const [showAddPersonaDialog, setShowAddPersonaDialog] = React.useState(false)
  const [isGeneratingResponses, setIsGeneratingResponses] = React.useState<number | null>(null)
  const [productIdError, setProductIdError] = React.useState<string | null>(null)
  
  // Get selected product from store
  const selectedProductId = useDashboardStore(state => state.selectedProductId)
  
  // Remove filtering since ICPs are company-wide
  const filteredICPs = localICPs

  // Function to safely convert product ID to number
  const getEffectiveProductId = React.useCallback((): number | null => {
    // First try the prop if it's a valid number
    if (typeof productId === 'number' && !isNaN(productId) && productId > 0) {
      console.log('✅ Using prop product ID:', productId);
      return productId;
    }
    
    // Then try the store value - convert string to number
    if (selectedProductId) {
      const parsed = parseInt(selectedProductId, 10);
      if (!isNaN(parsed) && parsed > 0) {
        console.log('✅ Using store product ID:', parsed);
        return parsed;
      }
      console.log('❌ Invalid store product ID:', selectedProductId);
    }
    
    // If neither is valid, return null
    console.log('❌ No valid product ID found');
    return null;
  }, [productId, selectedProductId]);

  // Effect to validate product ID on mount and changes
  React.useEffect(() => {
    const effectiveId = getEffectiveProductId();
    console.log('🔍 Product ID validation:', {
      propId: productId,
      storeId: selectedProductId,
      effectiveId,
      isValid: effectiveId !== null
    });
    
    if (effectiveId === null) {
      setProductIdError('Please select a product to continue');
    } else {
      setProductIdError(null);
    }
  }, [getEffectiveProductId, productId, selectedProductId]);

  // Effect to load stats with product ID
  React.useEffect(() => {
    async function loadStats() {
      if (!companyId) return;
      
      try {
        const effectiveProductId = getEffectiveProductId();
        const supabase = createClient();
        
        console.log('🔄 Loading stats:', { 
          companyId, 
          effectiveProductId,
          propId: productId,
          storeId: selectedProductId 
        });
        
        // Only fetch if we have a valid product ID
        if (effectiveProductId !== null) {
          const [statsData, queryData] = await Promise.all([
            fetchPersonaStats(companyId, effectiveProductId),
            // Fetch raw query data to get the full queries
            supabase
              .from('personas')
              .select(`
                id,
                icp_id,
                queries!left (
                  id,
                  query_text,
                  responses!left (
                    id,
                    response_batch_id
                  )
                )
              `)
              .in('icp_id', icps.map(icp => icp.id))
              .eq('queries.product_id', effectiveProductId)
              .eq('queries.company_id', companyId)
              .throwOnError()
          ]);

          if (!queryData.data) {
            console.error('No query data returned');
            throw new Error('Failed to fetch queries');
          }

          // Update stats
          setStats(statsData);
          
          // Debug log raw query data
          console.log('🔵 Raw persona query data:', {
            data: queryData.data,
            personaCount: queryData.data?.length,
            firstPersonaQueries: queryData.data?.[0]?.queries
          });

          // Create a map of persona queries for easier lookup
          const personaQueriesMap = new Map(
            queryData.data.map(p => [p.id, Array.isArray(p.queries) ? p.queries : []]) || []
          );

          // Update ICPs with fetched queries
          const updatedICPs = icps.map(icp => ({
            ...icp,
            personas: icp.personas.map(persona => {
              // Get queries for this persona from our map
              const personaQueries = personaQueriesMap.get(persona.id) || [];
              
              console.log('🔍 Mapping persona queries:', {
                personaId: persona.id,
                queriesFound: personaQueries.length,
                firstQuery: personaQueries[0]
              });

              return {
                ...persona,
                queries: personaQueries
              };
            })
          }));

          console.log('🟢 Updated ICPs with queries:', {
            icpCount: updatedICPs.length,
            firstICP: updatedICPs[0]?.id,
            firstPersona: updatedICPs[0]?.personas[0]?.id,
            firstPersonaQueries: updatedICPs[0]?.personas[0]?.queries?.length
          });

          setLocalICPs(updatedICPs);
        }
      } catch (error) {
        console.error('Error loading stats:', error);
        toast.error('Failed to load persona stats');
      } finally {
        setIsLoadingStats(false);
      }
    }

    loadStats();
  }, [companyId, getEffectiveProductId, productId, selectedProductId, icps]);

  // Add logging before mapping personas
  console.log('🔍 Pre-render ICPs state:', {
    icpsCount: localICPs.length,
    firstICP: localICPs[0],
    firstPersona: localICPs[0]?.personas[0],
    firstPersonaQueries: localICPs[0]?.personas[0]?.queries
  });

  const handleAction = async (action: QueryAction, personaId: number) => {
    const effectiveProductId = getEffectiveProductId();
    
    if (action === 'generate_queries') {
      if (!effectiveProductId) {
        toast.error('Please select a product before generating questions');
        return;
      }

      try {
        setIsGeneratingResponses(personaId);  // Set loading state at the start
        
        console.log('🔍 Starting query generation:', {
          companyName,
          personaId,
          accountId,
          effectiveProductId,
          productId,
          selectedProductId
        });

        const engines: EngineSelection = {
          perplexity: false,
          gemini: false,
          claude: false,
          openai: false,
          google_search: false
        };

        const result = await generateQuestionsAction(
          companyName,
          engines,
          "Questions v1.13- system",
          "Questions v1.13- user",
          'claude-3.5-sonnet',
          accountId,
          String(personaId),
          effectiveProductId
        );

        console.log('✅ Generate questions completed, refreshing data');

        // Refresh stats with the same product ID we used for generation
        const newStats = await fetchPersonaStats(companyId, effectiveProductId);
        setStats(newStats);
        
        // Refresh the company profile to get the new queries
        const updatedProfile = await getCompanyProfile(companyId, accountId);
        if (updatedProfile?.ideal_customer_profiles) {
          const updatedICP = updatedProfile.ideal_customer_profiles.find(
            (icp: { personas: { id: number }[] }) => 
              icp.personas.some((p: { id: number }) => p.id === personaId)
          );
          const updatedPersona = updatedICP?.personas.find(
            (p: { id: number; queries?: any[] }) => p.id === personaId
          );
          
          if (updatedPersona?.queries?.length) {
            // Update the local state instead of reloading
            setExpandedPersonaId(personaId);
            
            // Find and update the ICP in our local state
            const updatedICPs = localICPs.map(icp => {
              if (icp.personas.some(p => p.id === personaId)) {
                return {
                  ...icp,
                  personas: icp.personas.map(p => 
                    p.id === personaId 
                      ? { 
                          ...p, 
                          queries: updatedPersona.queries.map(q => ({
                            ...q,
                            responses: [] // Initialize with empty responses array to match Query type
                          }))
                        }
                      : p
                  )
                };
              }
              return icp;
            });

            // Update local state with new ICPs
            setLocalICPs(updatedICPs);

            // Update the query store to show "generate analysis" action
            const { setQueryState } = useQueryStore.getState();
            setQueryState(String(personaId), {
              isLoading: false,
              status: 'completed',
              availableActions: ['generate_response', 'view_queries'],
              queryList: updatedPersona.queries.map(q => ({
                id: q.id.toString(),
                text: q.query_text
              }))
            });
          }
        }
      } catch (error) {
        console.error('Error generating queries:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to generate queries');
      } finally {
        setIsGeneratingResponses(null);  // Clear loading state whether success or failure
      }
    } else if (action === 'generate_response') {
      await handleGenerateResponse(personaId);
    } else if (action === 'view_queries') {
      setExpandedPersonaId(expandedPersonaId === personaId ? null : personaId);
    }
  };

  const handleAddICP = async (values: any) => {
    try {
      const newICP = await createICP({
        region: values.region,
        vertical: values.vertical,
        company_size: values.company_size,
        product_id: Number(values.product_id)
      }, companyId, accountId);
      toast.success("ICP created successfully");
      window.location.reload();
    } catch (error) {
      console.error('Failed to create ICP:', error);
      toast.error("Failed to create ICP");
    }
  };

  const handleAddPersona = async (values: any) => {
    try {
      const newPersona = await createPersona({
        title: values.title,
        seniority_level: 'manager_level',
        department: 'general',
      }, parseInt(values.icpId), accountId);
      toast.success("Persona created successfully");
      window.location.reload();
    } catch (error) {
      console.error('Failed to create Persona:', error);
      toast.error("Failed to create Persona");
    }
  };

  const handleGenerateResponse = async (personaId: number) => {
    setIsGeneratingResponses(personaId);
    try {
      const engines: EngineSelection = {
        perplexity: true,
        gemini: true,
        claude: true,
        openai: true,
        google_search: true
      };

      await generateResponsesAction(
        companyId,
        [personaId],
        engines,
        'gpt-4-turbo-preview',
        accountId
      );

      toast.success('Successfully generated responses');
      const newStats = await fetchPersonaStats(companyId);
      setStats(newStats);
    } catch (error) {
      console.error('Error generating responses:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate responses');
    } finally {
      setIsGeneratingResponses(null);
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between w-full">
        <h3 className="text-lg font-semibold">ICPs and Personas</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddICPDialog(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add ICP
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddPersonaDialog(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Persona
          </Button>
        </div>
      </div>
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                {/* Expansion column */}
              </TableHead>
              <TableHead>Region</TableHead>
              <TableHead>Vertical</TableHead>
              <TableHead>Company Size</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Queries</TableHead>
              <TableHead>Last Run</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredICPs.map((icp) => (
              <React.Fragment key={`icp-${icp.id}`}>
                {icp.personas?.map((persona) => (
                  persona && (
                    <React.Fragment key={`persona-${persona.id}`}>
                      <TableRow 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setExpandedPersonaId(
                          expandedPersonaId === persona.id ? null : persona.id
                        )}
                      >
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-0 h-auto"
                          >
                            {expandedPersonaId === persona.id ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell>{icp.region}</TableCell>
                        <TableCell>{icp.vertical}</TableCell>
                        <TableCell>{icp.company_size}</TableCell>
                        <TableCell>
                          <span>{persona.title}</span>
                        </TableCell>
                        <TableCell>
                          {persona.queries && persona.queries.length > 0 ? (
                            <Badge variant="secondary" className="font-normal">
                              {persona.queries.length} {persona.queries.length === 1 ? 'Query' : 'Queries'}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">No queries</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {stats[`${icp.id}-${persona.id}`]?.lastBatchDate
                            ? new Date(stats[`${icp.id}-${persona.id}`].lastBatchDate!).toLocaleDateString()
                            : 'Never'}
                        </TableCell>
                        <TableCell className="text-right">
                          {!persona.queries || persona.queries.length === 0 ? (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAction('generate_queries', persona.id);
                              }}
                              disabled={isGeneratingResponses === persona.id}
                            >
                              {isGeneratingResponses === persona.id ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Generating...
                                </>
                              ) : (
                                <>
                                  <Plus className="h-4 w-4 mr-2" />
                                  Generate Queries (Free)
                                </>
                              )}
                            </Button>
                          ) : (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAction('generate_response', persona.id);
                              }}
                              disabled={isGeneratingResponses === persona.id}
                              className="bg-[#800020] hover:bg-[#800020]/90 text-white"
                            >
                              {isGeneratingResponses === persona.id ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Generating Analysis...
                                </>
                              ) : (
                                <>
                                  <Plus className="h-4 w-4 mr-2" />
                                  Generate Analysis
                                </>
                              )}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                      {expandedPersonaId === persona.id && persona.queries && (
                        <TableRow>
                          <TableCell colSpan={7} className="p-0">
                            <div className="bg-muted/50 border-t">
                              <div className="p-4 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                  {persona.queries.map((query) => (
                                    <div 
                                      key={query.id}
                                      className="bg-background rounded-lg border p-4 hover:border-primary/50 transition-colors"
                                    >
                                      <p className="text-sm text-muted-foreground">{query.query_text}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  )
                ))}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </div>

      <AddICPDialog
        open={showAddICPDialog}
        onOpenChange={setShowAddICPDialog}
        onSubmit={handleAddICP}
      />

      <AddPersonaDialog
        open={showAddPersonaDialog}
        onOpenChange={setShowAddPersonaDialog}
        onSubmit={handleAddPersona}
        icps={icps}
      />
    </div>
  );
}