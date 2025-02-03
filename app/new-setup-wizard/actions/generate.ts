'use server'

import { createAdminClient } from "@/app/supabase/server"
import { AIServiceFactory } from "@/lib/services/ai/factory"
import { parsePrompt } from "@/lib/prompts/prompt-parser"
import { AIModelType } from "@/lib/services/ai/types"
import type { GeneratedData } from '../types'

// Define the AI response structure
interface AIProduct {
  name: string
  product_category: string
  description: string
}

interface AIResponse {
  company_information: {
    name: string
    industry: string
    products: AIProduct[]
    number_of_employees: number
    annual_revenue: string
    markets_operating_in: string[]
  }
  main_competitors: string[]
  ideal_customer_profiles: Array<{
    vertical: string
    company_size: string
    region: string
    personas: Array<{
      title: string
      seniority_level: string
      department: string
    }>
  }>
}

// Default configuration from generate-initial-icps
const DEFAULT_CONFIG = {
  model: 'claude-3.5-sonnet' as AIModelType,
  systemPrompt: 'ICP gen - v.4 - system',
  userPrompt: 'ICP gen - v4 - user'
}

export async function generateWizardData(companyName: string, accountId: string): Promise<GeneratedData> {
  try {
    // Get the prompts from the database
    const adminClient = await createAdminClient()
    const { data: prompts, error: promptError } = await adminClient
      .from('prompts')
      .select('*')
      .in('name', [DEFAULT_CONFIG.systemPrompt, DEFAULT_CONFIG.userPrompt])
      .eq('is_active', true)

    if (promptError || !prompts || prompts.length !== 2) {
      throw new Error(`Failed to fetch ICP generation prompts: ${
        promptError?.message || 
        `Expected 2 prompts, got ${prompts?.length || 0}`
      }`)
    }

    const systemPrompt = prompts.find(p => p.name === DEFAULT_CONFIG.systemPrompt)?.prompt_text
    const userPrompt = prompts.find(p => p.name === DEFAULT_CONFIG.userPrompt)?.prompt_text

    if (!systemPrompt || !userPrompt) {
      throw new Error('Missing required prompts for ICP generation')
    }

    // Create context for prompt parsing
    const context = {
      company: {
        name: companyName
      }
    }

    // Parse prompts with context
    const parsedSystemPrompt = parsePrompt(systemPrompt, context)
    const parsedUserPrompt = parsePrompt(userPrompt, context)

    // Get AI service and generate data
    const aiService = AIServiceFactory.getInstance().getService(DEFAULT_CONFIG.model)
    const response = await aiService.generateICPs(
      parsedSystemPrompt,
      parsedUserPrompt,
      context
    ) as AIResponse

    // Map the AI response to our wizard's data structure
    return {
      companyInfo: {
        industry: response.company_information.industry,
        number_of_employees: response.company_information.number_of_employees,
        annual_revenue: response.company_information.annual_revenue,
        markets_operating_in: response.company_information.markets_operating_in
      },
      products: response.company_information.products.map(product => ({
        name: product.name,
        description: product.description
      })),
      competitors: response.main_competitors.map(name => ({
        name,
        description: '' // We'll let users add descriptions later
      })),
      icps: response.ideal_customer_profiles
    }
  } catch (error) {
    console.error('Wizard data generation failed:', error)
    throw error
  }
} 