# Implementation Plan: New User Company Creation Flow

## Goal
Ensure new users are properly directed to company creation when they have no companies.

## Current Status
1. ✅ Account Creation (auth/callback/route.ts)
   - Creates account for new users
   - Sets up account-user relationship

2. ✅ Middleware (middleware.ts)
   - Fixed auth callback handling
   - Allows account creation to complete

## Remaining Changes

### 1. Dashboard Content (`dashboard-content.tsx`)
- Add imports:
  ```typescript
  import { useEffect } from 'react'
  import { useRouter } from 'next/navigation'
  ```
- Add redirect logic:
  ```typescript
  const router = useRouter()
  
  useEffect(() => {
    if (companies.length === 0) {
      router.push('/dashboard/generate-analysis')
    }
  }, [companies, router])
  ```

### 2. Dashboard Wrapper (`dashboard-wrapper.tsx`)
- Already modified to:
  - Accept initialCompanies prop
  - Initialize store with companies
  - Pass data to dashboard-content

### 3. Store (`store.ts`)
- Already has required functionality:
  - companies state
  - setCompanies action
  - addCompany action

## Flow After Changes
1. User signs up
2. Auth callback creates account
3. Dashboard loads
4. Store initialized with companies
5. If no companies:
   - Redirected to generate-analysis
   - Can create first company
6. If has companies:
   - Shows normal dashboard

## Testing Points
1. New user signup -> Should redirect to company creation
2. Existing user with no companies -> Should redirect
3. User with companies -> Should see dashboard
4. Company creation -> Should update store and return to dashboard

## Security Considerations
- All changes maintain existing RLS policies
- Account context preserved throughout flow
- Auth state properly handled

## Next Steps
1. Apply changes to dashboard-content.tsx
2. Test the complete flow
3. Verify security boundaries
4. Add error handling if needed