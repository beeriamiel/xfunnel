export interface ICP {
  id: number;
  region: string;
  vertical: string;
  companySize: string;
}

export interface Persona {
  id: number;
  title: string;
  seniority: string;
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
}

export interface CompanyProfile {
  name: string;
  industry: string;
  mainProducts: string[];
  competitors: string[];
}

export interface ProfileStats {
  icps: number;
  personas: number;
  products: number;
  competitors: number;
} 