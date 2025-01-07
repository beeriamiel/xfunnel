export interface ICP {
  id: number;
  vertical: string;
  company_size: string;
  region: string;
  created_at: string | null;
  icp_batch_id: string | null;
  created_by_batch: boolean | null;
  company_id: number | null;
  personas: Persona[];
}

export interface Persona {
  id: number;
  title: string;
  seniority_level: string;
  department: string;
  created_at: string | null;
  icp_id: number | null;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
}

export interface Competitor {
  id: string;
  name: string;
  description?: string;
}

export interface CompanyProfile {
  icps: ICP[];
  personas: Persona[];
  products: Product[];
  competitors: Competitor[];
} 