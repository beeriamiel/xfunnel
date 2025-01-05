import { ViewType, ViewMetrics } from './progress-header'

export interface Selection {
  region?: string;
  vertical?: string;
  persona?: string;
}

export interface TimeSegment {
  id: string;
  type: 'BATCH' | 'WEEK' | 'MONTH';
  startDate: string;
  endDate: string;
  displayName: string;
}

export interface ViewProps {
  companyId: number;
  timeSegment: TimeSegment;
  onSelect: (id: string) => void;
  metrics?: ViewMetrics;
}

export interface ViewCard {
  id: string;
  title: string;
  metrics: ViewMetrics;
  subtitle?: string;
  description?: string;
}

export interface CompanyViewProps extends ViewProps {
  // Future company-specific props
}

export interface RegionViewProps extends ViewProps {
  regions: Array<ViewCard & {
    code: string;
  }>;
}

export interface VerticalViewProps extends ViewProps {
  region: string;
  verticals: Array<ViewCard & {
    icon?: string;
  }>;
}

export interface PersonaViewProps extends ViewProps {
  region: string;
  vertical: string;
  personas: Array<ViewCard & {
    role: string;
    department: string;
    seniority: string;
  }>;
}

export interface QueriesViewProps extends ViewProps {
  region: string;
  vertical: string;
  persona: string;
  queries: Array<{
    id: number;
    text: string;
    phase: string;
    metrics: ViewMetrics;
    engineResults: Record<string, {
      rank: number | 'n/a';
      responseText?: string;
      citations?: string[];
    }>;
  }>;
}

export interface BuyingJourneyState {
  currentView: ViewType;
  selection: Selection;
  timeSegment: TimeSegment | null;
  metrics: Record<string, ViewMetrics>;
} 