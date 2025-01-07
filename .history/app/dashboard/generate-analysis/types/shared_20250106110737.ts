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