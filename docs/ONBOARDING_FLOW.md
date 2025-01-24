# Onboarding Flow Fix Plan

## Overview
This document outlines the plan to fix the onboarding flow issues, including step progression, data loading, and app-wide protection.

## Current Issues
1. Onboarding flow skips steps and shows response table on refresh
2. Initial data from `initial-step.tsx` and `generate-initial-icps.ts` isn't loading properly
3. Onboarding needs to be enforced app-wide
4. Multiple overlapping step trackers causing confusion
5. Unclear ownership of step progression
6. URL and store state synchronization issues

## Cleanup Plan

### 1. Consolidate Step State
```typescript
// REMOVE redundant state:
- currentStep
- currentOnboardingStep
- currentWizardStep

// KEEP single source of truth:
- currentStep: Step
- completedSteps: Step[]
- isOnboarding: boolean
```

### 2. Define Clear State Flow
```
URL Change → Store Update → Component Render

A. Initial Load:
- URL step param read in page.tsx
- Initialize store with step
- Components react to store state

B. Step Navigation:
- Store action triggers step change
- URL updates to reflect store
- Never directly manipulate URL
```

### 3. Background Process Integration
```
Company Creation → Data Generation → Step State

A. Initial Step:
- Create company
- Start data generation
- Set hasData=false for all steps
- Wait for generation

B. Data Generation Complete:
- Update relevant step hasData
- Don't auto-progress
- Allow user review
```

### 4. Clean Up Flow Control
```typescript
// Single pattern for step changes:
1. Check if can access step
2. Validate current step completion
3. Update store state
4. Update URL
5. Update UI

// Remove/consolidate:
- startOnboarding()
- completeOnboarding()
- setCurrentStep()
- setCurrentOnboardingStep()

// Replace with:
- initiateOnboarding()
- completeStep()
- navigateToStep()
```

### 5. Implementation Order
```
1. Clean up existing state
2. Implement new state structure
3. Update URL handling
4. Add step validation
5. Integrate background processes
6. Update components
```

## Implementation Plan

### 1. Store Enhancement
- Add step tracking to store:
  - `currentStep` (company | product | competitors | icps | personas)
  - `completedSteps` (array/object of completed steps)
  - `isStepComplete(step)` helper
  - `canAccessStep(step)` helper
  - `setStepComplete(step)` action

### 2. URL and Step Synchronization
- On initial load:
  - Parse URL step parameter
  - Check if step is accessible based on completedSteps
  - Redirect to earliest incomplete step if needed
  - Update store's currentStep

- On step change:
  - Update URL with new step
  - Update store's currentStep
  - Prevent direct URL navigation to locked steps

### 3. Step Component Logic
- Wrap step components with validation:
  - Check if previous steps are complete
  - Check if current step data exists
  - Show loading states during transitions
  - Prevent progression until step requirements met

- Step Completion Requirements:
  - company: name and basic info saved
  - product: main products defined
  - competitors: at least one competitor
  - icps: initial ICPs generated and saved
  - personas: at least one persona

### 4. Data Flow Control
- After company creation:
  - Wait for initial data generation
  - Mark company step complete
  - Navigate to product step
  - Update URL

- Between steps:
  - Verify data exists
  - Save progress
  - Update completedSteps
  - Update URL
  - Load next step's data

### 5. Response Table Access
- Only show if:
  - All steps complete OR
  - Dev mode enabled
- Otherwise redirect to appropriate step

## Implementation Order
1. Fix onboarding flow and step progression
2. Ensure data is properly created and loaded between steps
3. Expand to app-wide protection

## App-wide Protection Notes
- Protection should be at company level
- Show disabled nav items during onboarding (not hidden)
- Add layout-level protection
- Handle redirects for protected routes 