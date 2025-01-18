'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/app/supabase/client'
import type { Database } from '@/types/supabase'
import { SimpleCompanySelector } from './simple-company-selector';
import { CompanyDetails, DetailedCompany } from './company-details';
import { CompanyICPsTable } from './company-icps-table';

interface BasicCompany {
  id: number;
  name: string;
  industry: string | null;
}

interface Competitor {
  competitor_name: string;
}

interface Persona {
  id: number;
  title: string;
  seniority_level: string;
  department: string;
}

interface ICP {
  id: number;
  vertical: string;
  company_size: string;
  region: string;
  personas: Persona[];
}

interface CompanyViewerProps {
  accountId: string;
}

export function CompanyViewer({ accountId }: CompanyViewerProps) {
  const [companies, setCompanies] = useState<BasicCompany[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<DetailedCompany | null>(null);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [icps, setIcps] = useState<ICP[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const supabase = createClient();

  // Fetch basic company data on mount
  useEffect(() => {
    async function fetchCompanies() {
      try {
        const { data, error } = await supabase
          .from('companies')
          .select('id, name, industry')
          .eq('account_id', accountId)
          .order('name');

        if (!error && data) {
          setCompanies(data);
        }
      } catch (error) {
        console.error('Error fetching companies:', error);
      } finally {
        setIsInitialLoading(false);
      }
    }

    fetchCompanies();
  }, [accountId]);

  // Fetch detailed company data when selected
  useEffect(() => {
    async function fetchCompanyData(companyId: number) {
      console.log('Fetching company data for ID:', companyId); // Debug
      setIsDetailsLoading(true);
      
      try {
        const { data: companyData } = await supabase
          .from('companies')
          .select('*')
          .eq('id', companyId)
          .eq('account_id', accountId)
          .single();

        console.log('Fetched company data:', companyData); // Debug
        
        // Fetch competitors
        const { data: competitorsData } = await supabase
          .from('competitors')
          .select('competitor_name')
          .eq('company_id', companyId);

        // Fetch ICPs and their personas
        const { data: icpsData } = await supabase
          .from('ideal_customer_profiles')
          .select(`
            id,
            vertical,
            company_size,
            region,
            personas (
              id,
              title,
              seniority_level,
              department
            )
          `)
          .eq('company_id', companyId);

        if (competitorsData) setCompetitors(competitorsData);
        if (icpsData) setIcps(icpsData);
        setSelectedCompany(companyData as unknown as DetailedCompany);

      } catch (error) {
        console.error('Error fetching company data:', error);
        setSelectedCompany(null);
      } finally {
        setIsDetailsLoading(false);
      }
    }

    if (selectedCompanyId) {
      fetchCompanyData(selectedCompanyId);
    } else {
      setSelectedCompany(null);
      setCompetitors([]);
      setIcps([]);
    }
  }, [selectedCompanyId, accountId]);

  console.log('Selected Company:', {
    id: selectedCompany?.id,
    type: typeof selectedCompany?.id
  });

  // Add debug logging
  useEffect(() => {
    console.log('Selected Company ID:', selectedCompanyId);
    console.log('Selected Company:', selectedCompany);
  }, [selectedCompanyId, selectedCompany]);

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-4">
        <SimpleCompanySelector
          selectedCompany={companies.find(c => c.id === selectedCompanyId) || null}
          companies={companies}
          onCompanySelect={(company) => setSelectedCompanyId(company?.id || null)}
          disabled={isInitialLoading}
        />
        {isInitialLoading && (
          <span className="text-sm text-muted-foreground">Loading companies...</span>
        )}
      </div>

      {selectedCompany?.id && !isDetailsLoading && (
        <>
          <CompanyDetails
            company={selectedCompany}
            competitors={competitors}
          />
          <CompanyICPsTable 
            icps={icps} 
            companyId={selectedCompany.id}
            companyName={selectedCompany.name}
            companyIndustry={selectedCompany.industry}
            companyProductCategory={selectedCompany.product_category}
            competitors={competitors}
            selectedEngines={{
              perplexity: true,
              claude: true,
              gemini: true,
              openai: true,
              google_search: true
            }}
            selectedModel="gpt-4-turbo-preview"
            selectedPrompts={{
              systemPromptName: "default",
              userPromptName: "default"
            }}
          />
        </>
      )}

      {isDetailsLoading && (
        <div className="text-sm text-muted-foreground">Loading company details...</div>
      )}
    </div>
  );
} 