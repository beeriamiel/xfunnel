import type { LucideIcon } from 'lucide-react'

export interface CompanyData {
  name: string;
  industry: string;
  mainProducts: string[];
  category: string;
  employees: string;
  revenue: string;
  markets: string[];
}

export interface SelectableCardProps {
  isSelected: boolean;
  onClick: () => void;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  className?: string;
}

export interface CompletedStep {
  type: 'company' | 'product' | 'data' | 'icps' | 'personas';
  title: string;
  summary: string;
}

export type StepId = 'initial' | 'product' | 'companyData' | 'icps' | 'personas' | 'complete' 