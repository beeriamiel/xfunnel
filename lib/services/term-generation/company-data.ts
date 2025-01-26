import { createClient } from '@/app/supabase/server'

export interface CompanyData {
  name: string;
  description?: string;
  industry?: string;
  main_products: string[];
  product_category?: string;
  competitors: Array<{
    competitor_name: string;
  }>;
}

export async function getCompanyData(companyId: number, accountId: string): Promise<CompanyData> {
  const supabase = await createClient();
  
  // Fetch company data
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .select(`
      name,
      industry,
      main_products,
      product_category
    `)
    .eq('id', companyId)
    .eq('account_id', accountId)
    .single();

  if (companyError) {
    console.error('Error fetching company data:', companyError);
    throw new Error('Failed to fetch company data');
  }

  if (!company) {
    throw new Error('Company not found');
  }

  // Fetch competitors data
  const { data: competitors, error: competitorsError } = await supabase
    .from('competitors')
    .select('competitor_name')
    .eq('company_id', companyId);

  if (competitorsError) {
    console.error('Error fetching competitors data:', competitorsError);
    throw new Error('Failed to fetch competitors data');
  }

  // Format the response
  return {
    name: company.name,
    industry: company.industry || undefined,
    main_products: company.main_products || [],
    product_category: company.product_category || undefined,
    competitors: competitors || []
  };
} 