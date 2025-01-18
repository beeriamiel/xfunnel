export type MarketRegion = 'north_america' | 'europe' | 'asia_pacific' | 'middle_east' | 'latin_america';

export interface Company {
  id: number;
  name: string;
  industry: string | null;
  created_at: string | null;
  main_products: string[] | null;
  product_category: string | null;
  number_of_employees: number | null;
  annual_revenue: string | null;
  markets_operating_in: string[] | null;
}

export interface CompanyState {
  data: Company | null;
  isLoading: boolean;
  error: string | null;
} 