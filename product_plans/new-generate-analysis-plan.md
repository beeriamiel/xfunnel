I'll help you plan the refactoring of the `response-analysis` component into a more organized structure. Here's the plan:

### 1. Backup Strategy
First, let's create a backup:
1. Create a new directory `_backup` in the root
2. Copy the current files there:
   - `response-analysis.tsx`
   - `company-profile-header.tsx`
   - `types.ts`

### 2. New Structure Plan
Create a new directory structure:
```
app/
└── dashboard/
    └── generate-analysis/
        ├── components/
        │   ├── setup/
        │   │   ├── company-setup.tsx
        │   │   ├── step-indicator.tsx
        │   │   ├── completed-step-chip.tsx
        │   │   └── steps/
        │   │       ├── initial-step.tsx
        │   │       ├── product-step.tsx
        │   │       ├── competitor-step.tsx
        │   │       ├── icp-step.tsx
        │   │       └── persona-step.tsx
        │   ├── cards/
        │   │   ├── product-card.tsx
        │   │   ├── competitor-card.tsx
        │   │   ├── icp-card.tsx
        │   │   └── persona-card.tsx
        │   ├── analysis/
        │   │   ├── response-table.tsx
        │   │   └── query-section.tsx
        │   └── shared/
        │       ├── selectable-card.tsx
        │       └── success-animation.tsx
        ├── types/
        │   ├── setup.ts
        │   ├── analysis.ts
        │   └── shared.ts
        ├── utils/
        │   ├── generators.ts
        │   └── formatters.ts
        └── page.tsx
```

### 3. Component Split Plan
Break down the current monolithic component into:

1. **Main Container (`page.tsx`)**
   - Handles main state and routing between setup/analysis
   - Contains the AnimatePresence logic

2. **Setup Components**
   - `company-setup.tsx`: Main setup wizard
   - `step-indicator.tsx`: Progress indicator
   - `completed-step-chip.tsx`: Completed step display
   - Individual step components in `steps/`

3. **Card Components**
   - Separate reusable card components for products, competitors, ICPs, personas

4. **Analysis Components**
   - `response-table.tsx`: Main analysis table
   - `query-section.tsx`: Query management section

5. **Types Split**
   - `setup.ts`: Setup-related interfaces
   - `analysis.ts`: Analysis-related interfaces
   - `shared.ts`: Shared types

### 4. Implementation Steps
1. Create the directory structure
2. Move types to their new locations
3. Extract components one by one
4. Update imports
5. Test each component in isolation
6. Integrate components back together
7. Add proper error boundaries
8. Test the full flow

### 5. Testing Strategy
1. Keep the backup working while developing
2. Test each component as it's extracted
3. Test the full flow after integration
4. Compare with backup functionality

Would you like me to proceed with any specific part of this plan?
