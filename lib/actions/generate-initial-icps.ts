// Will contain simplified version of generate-icps.ts
// Only handles company info and ICP generation
// No question generation 

import { createAdminClient } from "@/app/supabase/server";
import { updateGenerationProgress } from "@/lib/services/progress-tracking";
import { parsePrompt } from "@/lib/prompts/prompt-parser";
import { AIModelType } from "@/lib/services/ai/types";
import { AIServiceFactory } from "@/lib/services/ai/factory";
import { SupabaseBatchTrackingService } from "@/lib/services/batch-tracking";
import { updateCompanySetupCompletion } from "@/lib/services/company";

// Keep existing interfaces
interface Persona {
  title: string;
  seniority_level: string;
  department: string;
}

interface ICP {
  vertical: string;
  company_size: string;
  region: string;
  personas: Persona[];
}

interface Product {
  name: string;
  product_category: string;
  description: string;
}

interface CompanyInformation {
  name: string;
  industry: string;
  products: Product[];
  number_of_employees: number;
  annual_revenue: string;
  markets_operating_in: string[];
}

export interface ICPResponse {
  company_information: CompanyInformation;
  main_competitors: string[];
  ideal_customer_profiles: ICP[];
}

// Keep validation constants
const VALID_SENIORITY_LEVELS = ["c_level", "vp_level", "director_level", "manager_level"] as const;
const VALID_COMPANY_SIZES = ["smb_under_500", "mid_market_500_1000", "enterprise_1000_5000", "large_enterprise_5000_plus"] as const;
const VALID_REGIONS = ["north_america", "europe", "asia_pacific", "middle_east", "latin_america"] as const;
const VALID_MARKETS = VALID_REGIONS;

// Keep validation function
function validateICPResponse(response: any): ICPResponse {
  if (!response.company_information) {
    throw new Error('Missing company_information object');
  }

  const companyInfo = response.company_information;
  if (!companyInfo.name || typeof companyInfo.name !== 'string') {
    throw new Error('Invalid or missing company name');
  }
  if (!companyInfo.industry || typeof companyInfo.industry !== 'string') {
    throw new Error('Invalid or missing industry');
  }
  if (!Array.isArray(companyInfo.products) || companyInfo.products.length === 0) {
    throw new Error('Invalid or empty products array');
  }

  // Validate each product
  companyInfo.products.forEach((product: any, index: number) => {
    if (!product.name || typeof product.name !== 'string') {
      throw new Error(`Invalid or missing name for product at index ${index}`);
    }
    if (!product.product_category || typeof product.product_category !== 'string') {
      throw new Error(`Invalid or missing product_category for product at index ${index}`);
    }
    if (!product.description || typeof product.description !== 'string') {
      throw new Error(`Invalid or missing description for product at index ${index}`);
    }
  });

  if (typeof companyInfo.number_of_employees !== 'number' || companyInfo.number_of_employees <= 0) {
    throw new Error('Invalid number_of_employees');
  }
  if (!companyInfo.annual_revenue || typeof companyInfo.annual_revenue !== 'string') {
    throw new Error('Invalid or missing annual_revenue');
  }
  if (!Array.isArray(companyInfo.markets_operating_in) || companyInfo.markets_operating_in.length === 0) {
    throw new Error('Invalid or empty markets_operating_in array');
  }
  companyInfo.markets_operating_in.forEach((market: string) => {
    if (!VALID_MARKETS.includes(market.toLowerCase() as typeof VALID_MARKETS[number])) {
      throw new Error(`Invalid market: ${market}`);
    }
  });

  if (!Array.isArray(response.main_competitors) || response.main_competitors.length === 0) {
    throw new Error('Invalid or empty main_competitors array');
  }
  response.main_competitors.forEach((competitor: any) => {
    if (typeof competitor !== 'string' || competitor.trim().length === 0) {
      throw new Error('Invalid competitor name');
    }
  });

  if (!response.ideal_customer_profiles || !Array.isArray(response.ideal_customer_profiles)) {
    throw new Error('Invalid response format: missing ideal_customer_profiles array');
  }

  response.ideal_customer_profiles.forEach((icp: any, icpIndex: number) => {
    if (!VALID_COMPANY_SIZES.includes(icp.company_size)) {
      throw new Error(`Invalid company_size in ICP ${icpIndex}: ${icp.company_size}`);
    }
    if (!VALID_REGIONS.includes(icp.region)) {
      throw new Error(`Invalid region in ICP ${icpIndex}: ${icp.region}`);
    }
    if (!icp.vertical || typeof icp.vertical !== 'string') {
      throw new Error(`Invalid vertical in ICP ${icpIndex}`);
    }

    if (!icp.personas || !Array.isArray(icp.personas)) {
      throw new Error(`Missing personas array in ICP ${icpIndex}`);
    }
    if (icp.personas.length < 1 || icp.personas.length > 3) {
      throw new Error(`ICP ${icpIndex} must have 1-3 personas`);
    }

    icp.personas.forEach((persona: any, personaIndex: number) => {
      if (!VALID_SENIORITY_LEVELS.includes(persona.seniority_level)) {
        throw new Error(`Invalid seniority_level in persona ${personaIndex} of ICP ${icpIndex}`);
      }
      if (!persona.title || typeof persona.title !== 'string') {
        throw new Error(`Invalid title in persona ${personaIndex} of ICP ${icpIndex}`);
      }
      if (!persona.department || typeof persona.department !== 'string') {
        throw new Error(`Invalid department in persona ${personaIndex} of ICP ${icpIndex}`);
      }
    });
  });

  return response as ICPResponse;
}

// Default configuration
const DEFAULT_CONFIG = {
  model: 'claude-3.5-sonnet' as AIModelType,
  systemPrompt: 'ICP gen - v.4 - system',
  userPrompt: 'ICP gen - v4 - user'
}

export async function generateInitialICPs(
  companyName: string,
  accountId: string
) {
  const adminClient = await createAdminClient();
  const batchTracker = await SupabaseBatchTrackingService.initialize();
  let companyId: number | undefined;
  let batchId: string | undefined;
  
  try {
    console.log('Starting Initial ICP generation:', {
      model: DEFAULT_CONFIG.model,
      companyName,
      systemPrompt: DEFAULT_CONFIG.systemPrompt,
      userPrompt: DEFAULT_CONFIG.userPrompt
    });

    // Get company ID
    const { data: existingCompany, error: selectError } = await adminClient
      .from('companies')
      .select('id')
      .eq('name', companyName)
      .single();

    if (selectError && selectError.code !== 'PGRST116') {
      throw new Error(`Failed to check company existence: ${selectError.message}`);
    }

    companyId = existingCompany?.id;
    if (!companyId) {
      throw new Error('Company ID not found');
    }

    // Create batch and start progress tracking
    batchId = await batchTracker.createBatch('icp', companyId, accountId, {
      model: DEFAULT_CONFIG.model,
      systemPromptName: DEFAULT_CONFIG.systemPrompt,
      userPromptName: DEFAULT_CONFIG.userPrompt
    });
    
    await batchTracker.updateBatchStatus(batchId, 'in_progress');
    await updateGenerationProgress(companyId, accountId, 'generating_icps', 0);

    // Fetch prompts
    const { data: prompts, error: promptError } = await adminClient
      .from('prompts')
      .select('*')
      .in('name', [DEFAULT_CONFIG.systemPrompt, DEFAULT_CONFIG.userPrompt])
      .eq('is_active', true);

    if (promptError || !prompts || prompts.length !== 2) {
      throw new Error(`Failed to fetch ICP generation prompts: ${
        promptError?.message || 
        `Expected 2 prompts, got ${prompts?.length || 0}`
      }`);
    }

    const systemPrompt = prompts.find(p => p.name === DEFAULT_CONFIG.systemPrompt)?.prompt_text;
    const userPrompt = prompts.find(p => p.name === DEFAULT_CONFIG.userPrompt)?.prompt_text;

    if (!systemPrompt || !userPrompt) {
      throw new Error('Missing required prompts for ICP generation');
    }

    await updateGenerationProgress(companyId, accountId, 'generating_icps', 20, 'Analyzing company data...');

    // Create context and generate ICPs
    const context = {
      company: {
        name: companyName
      }
    };

    const parsedSystemPrompt = parsePrompt(systemPrompt, context);
    const parsedUserPrompt = parsePrompt(userPrompt, context);

    const aiService = AIServiceFactory.getInstance().getService(DEFAULT_CONFIG.model);
    
    await updateGenerationProgress(companyId, accountId, 'generating_icps', 40, 'Generating ICPs...');
    
    const response = await aiService.generateICPs(
      parsedSystemPrompt,
      parsedUserPrompt,
      context
    );

    await updateGenerationProgress(companyId, accountId, 'generating_icps', 60, 'Processing company information...');

    // Parse and validate the response
    const parsedResponse = validateICPResponse(response);

    await updateGenerationProgress(companyId, accountId, 'generating_icps', 40);

    // Update company with metadata from the response
    const { error: updateError } = await adminClient
      .from('companies')
      .update({
        industry: parsedResponse.company_information.industry,
        number_of_employees: parsedResponse.company_information.number_of_employees,
        annual_revenue: parsedResponse.company_information.annual_revenue,
        markets_operating_in: parsedResponse.company_information.markets_operating_in.map(m => m.toLowerCase())
      })
      .eq('id', companyId);

    if (updateError) {
      console.error('Company metadata update error:', updateError);
    }

    // Insert products
    console.log('Inserting products:', parsedResponse.company_information.products);
    
    if (typeof companyId === 'undefined') {
      throw new Error('Company ID is undefined');
    }

    // First delete existing products
    const { error: deleteProductsError } = await adminClient
      .from('products')
      .delete()
      .eq('company_id', companyId);

    if (deleteProductsError) {
      console.error('Error deleting existing products:', deleteProductsError);
    }

    // Insert new products
    const { error: productsError } = await adminClient
      .from('products')
      .insert(
        parsedResponse.company_information.products.map(product => ({
          company_id: companyId as number,
          name: product.name,
          product_category: product.product_category,
          account_id: accountId
        }))
      );

    if (productsError) {
      console.error('Products insertion error:', productsError);
      // Continue despite product insertion error - we'll handle this in error monitoring
    }

    await updateGenerationProgress(companyId, accountId, 'generating_icps', 50);

    await updateGenerationProgress(companyId, accountId, 'generating_icps', 80, 'Setting up competitors...');

    // Handle competitors
    await adminClient
      .from('competitors')
      .delete()
      .eq('company_id', companyId);

    const { error: competitorsError } = await adminClient
      .from('competitors')
      .insert(
        parsedResponse.main_competitors.map(competitor => ({
          company_id: companyId as number,
          competitor_name: competitor,
          account_id: accountId
        }))
      );

    if (competitorsError) {
      console.error('Competitors insertion error:', competitorsError);
    }

    await updateGenerationProgress(companyId, accountId, 'generating_icps', 90, 'Finalizing setup...');

    // Store ICPs and Personas
    for (const icp of parsedResponse.ideal_customer_profiles) {
      const { data: insertedICP, error: icpError } = await adminClient
        .from('ideal_customer_profiles')
        .insert([{
          company_id: companyId,
          vertical: icp.vertical,
          company_size: icp.company_size,
          region: icp.region,
          icp_batch_id: batchId,
          created_by_batch: true,
          account_id: accountId
        }])
        .select('id')
        .single();

      if (icpError || !insertedICP) {
        console.error('ICP insertion error:', icpError);
        continue;
      }

      // Insert Personas
      const { error: personasError } = await adminClient
        .from('personas')
        .insert(
          icp.personas.map(persona => ({
            icp_id: insertedICP.id,
            title: persona.title,
            seniority_level: persona.seniority_level,
            department: persona.department,
            account_id: accountId
          }))
        );

      if (personasError) {
        console.error('Personas insertion error:', personasError);
      }
    }

    await updateGenerationProgress(companyId, accountId, 'generating_icps', 100, 'Setup complete');
    await batchTracker.completeBatch(batchId);
    await updateCompanySetupCompletion(companyId);

    return {
      ...parsedResponse,
      batchId
    };

  } catch (error) {
    console.error('Initial ICP generation failed:', error);
    if (companyId) {
      await updateGenerationProgress(
        companyId,
        accountId,
        'failed',
        0,
        error instanceof Error ? error.message : 'Unknown error during ICP generation'
      );
    }
    if (batchId) {
      await batchTracker.updateBatchStatus(
        batchId,
        'failed',
        error instanceof Error ? error.message : 'Unknown error during ICP generation'
      );
    }
    throw error;
  }
} 