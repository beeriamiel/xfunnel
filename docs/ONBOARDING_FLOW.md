# Onboarding Flow

## Overview
The onboarding flow guides new users through setting up their company profile and initial analysis. The flow is managed through a step-based interface that collects necessary information.

## Components
- CompanySetup: Main component handling the setup process
- Step components for each part of the setup:
  - InitialStep: Company details
  - ProductStep: Product information
  - CompetitorStep: Competitor analysis
  - ICPStep: Ideal Customer Profile setup
  - PersonaStep: Persona creation

## State Management
The setup process uses local state management with React's useState hook:
- currentStep: Current step in the setup process
- companyId: ID of the company being set up
- Various form data states (products, competitors, ICPs, personas)

## Navigation
- URL-based navigation using searchParams
- Step transitions handled by local state
- Progress tracked through completed sections

## Data Flow
1. Initial company creation
2. Product definition
3. Competitor analysis
4. ICP creation
5. Persona setup
6. Setup completion

## Validation
- Each step has its own validation rules
- Progress only allowed when current step is valid
- Data saved to database at each step

## Completion
- Setup marked as complete when all required data is provided
- Company profile updated with setup_completed_at timestamp
- User redirected to main dashboard

## Error Handling
- Form validation errors shown inline
- API/Database errors handled with user feedback
- State preserved on error for retry

## Technical Notes
- Uses Next.js App Router
- Server components for initial data loading
- Client components for interactive parts
- Supabase for data persistence 