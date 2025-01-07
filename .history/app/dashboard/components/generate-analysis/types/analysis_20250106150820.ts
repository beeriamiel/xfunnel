export interface ICP {
  id: number;
  vertical: string;
  company_size: string;
  region: string;
  personas: Persona[];
}

export interface Persona {
  id: number;
  title: string;
  seniority_level: string;
  department: string;
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