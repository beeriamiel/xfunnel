# Account-Based Authentication Plan

## Overview
Implementation of account-based access control using Supabase Auth (with OAuth providers) and Row Level Security (RLS), using a junction table approach for user-account relationships.

## Database Schema

### 1. New Tables
```sql
-- Accounts table
create table public.accounts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  account_type text not null check (account_type in ('internal', 'agency', 'company')),
  plan_type text not null check (plan_type in ('free', 'pro', 'enterprise')),
  monthly_credits_available integer not null default 0,
  monthly_credits_used integer not null default 0,
  credits_renewal_date timestamp with time zone,
  last_update_date timestamp with time zone default now(),
  created_at timestamp with time zone default now()
);

-- Junction table for user-account relationships
create table public.account_users (
  id uuid primary key default gen_random_uuid(),
  account_id uuid references public.accounts(id) not null,
  user_id uuid references auth.users(id) not null,
  role text not null check (role in ('admin', 'user')),
  created_at timestamp with time zone default now(),
  unique(account_id, user_id)
);
```

### 2. Additional Tables Needing account_id
```sql
-- From migration.sql
alter table ideal_customer_profiles 
add column account_id uuid references public.accounts(id);

alter table personas 
add column account_id uuid references public.accounts(id);

alter table queries 
add column account_id uuid references public.accounts(id);

alter table response_analysis 
add column account_id uuid references public.accounts(id);

alter table citations 
add column account_id uuid references public.accounts(id);
```

## OAuth Configuration

### 1. Google Provider Setup
```markdown
1. Supabase Dashboard Configuration:
   - Authentication > Providers > Google
   - Add Google Client ID and Secret
   - Configure redirect URLs:
     - http://localhost:3000/auth/callback (development)
     - https://yourdomain.com/auth/callback (production)

2. Google Cloud Console Setup:
   - Create OAuth 2.0 Client ID
   - Add authorized origins:
     - http://localhost:3000
     - https://yourdomain.com
   - Add redirect URIs:
     - http://localhost:3000/auth/callback
     - https://yourdomain.com/auth/callback
   - Enable required Google APIs
```

### 2. Auth Settings
```markdown
1. Configure Site URL in Supabase:
   - Set production URL
   - Set localhost for development

2. Set up redirect URLs:
   - /auth/callback (existing)
   - /login (existing)
   - /protected (existing)
   - /personal (new, for account management)

3. Configure email templates for:
   - Email/password signup (existing)
   - Magic links (new)
   - Account invitations (new)
   - Password reset (existing)
```

### 3. Environment Setup
```markdown
1. Add environment variables:
   - NEXT_PUBLIC_SUPABASE_URL (existing)
   - NEXT_PUBLIC_SUPABASE_ANON_KEY (existing)
   - GOOGLE_CLIENT_ID (new)
   - GOOGLE_CLIENT_SECRET (new)

2. Update Next.js configuration:
   - Update middleware.ts for new routes
   - Add /personal to protected routes
   - Keep existing auth redirects
```

### 4. Integration with Existing Auth
```markdown
1. Maintain current auth flow:
   - Keep email/password login
   - Keep existing session handling
   - Keep current error states

2. Add OAuth capabilities:
   - Add Google login button
   - Handle OAuth state
   - Manage account association

3. Update auth callback:
   - Handle both auth methods
   - Create account relationships
   - Manage user roles
```

## RLS Policies

### 1. Account Access
```sql
-- Enable RLS
alter table public.accounts enable row level security;
alter table public.account_users enable row level security;

-- Account users policies
create policy "Users can view their accounts"
on public.accounts for select using (
  exists (
    select 1 from public.account_users
    where account_users.account_id = accounts.id
    and account_users.user_id = auth.uid()
  )
);
```

### 2. Companies Access
```sql
create policy "Users can access their account's companies"
on companies for all using (
  exists (
    select 1 from public.account_users
    where account_users.account_id = companies.account_id
    and account_users.user_id = auth.uid()
  )
);
```

### 3. Batch Metadata Access
```sql
create policy "Users can access their account's batches"
on batch_metadata for all using (
  exists (
    select 1 from public.account_users
    where account_users.account_id = batch_metadata.account_id
    and account_users.user_id = auth.uid()
  )
);
```

### 4. Additional Table Policies
```sql
-- ICP Access
create policy "Users can access their account's ICPs"
on ideal_customer_profiles for all using (
  exists (
    select 1 from public.account_users
    where account_users.account_id = ideal_customer_profiles.account_id
    and account_users.user_id = auth.uid()
  )
);

-- Similar policies for: personas, queries, response_analysis, citations
```

## Component Updates

### 1. Existing Auth Components
- Maintain current components:
  - `login/page.tsx`: Page layout
  - `components/auth/login-form.tsx`: Auth form
  - `auth/callback/route.ts`: Auth callback handler

### 2. Required Updates

#### A. login-form.tsx
```typescript
// Add to existing component:
- Add OAuth button using Supabase client:
  supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  })
- Handle OAuth response
- Keep existing email/password flow
- Add loading states for OAuth
```

#### B. auth/callback/route.ts
```typescript
// Add to existing flow:
- Handle OAuth state verification
- Process OAuth tokens
- Create/verify account_users entry
- Handle role assignment
- Maintain existing error handling
```

#### C. personal/page.tsx
```typescript
// Add account management:
- Display account information from account_users
- Show account type and plan
- Display credit usage
- Add account switching (if multiple accounts)
```

#### D. company-icps-table.tsx
```typescript
// No changes needed - RLS handles filtering
// Data automatically filtered by account_id
```

#### E. generate-analysis/index.tsx
```typescript
// Add credit management:
- Check available credits before analysis
- Track credit usage in accounts table
- Show credit usage UI
```

### 3. Dashboard Components
```typescript
// All filtered by RLS automatically:
- buying-journey-analysis.tsx
- citation-analysis.tsx
- competitor-analysis.tsx
- engine-metrics-chart.tsx
- company-selector.tsx
```

### 4. Analysis Components
```typescript
// All use account context:
- response-analysis/page.tsx
- company-setup/company-setup.tsx
- query-generation/query-generation.tsx
```

## Implementation Phases

### Phase 1: Database Setup
1. Create accounts table
2. Create account_users junction table
3. Add account_id columns
4. Set up RLS policies
5. Add necessary indexes

### Phase 2: Auth Enhancement
1. Configure OAuth providers
2. Update login-form.tsx
   - Add OAuth buttons
   - Keep email/password
   - Add loading states

3. Update auth callback
   - Handle OAuth flow
   - Account association via account_users
   - Role management

### Phase 3: Usage Features
1. Add to generate-analysis:
   - Credit usage tracking
   - Plan limit checks
   - Keep existing analysis flow

### Phase 4: Migration
1. Create default accounts
2. Create account_users associations
3. Set initial roles
4. Test OAuth flows

### User Roles & Privileges

### 1. Regular Users
```markdown
Access Level: Own Account Data Only

A. Data Access:
- View/create companies
- View/create/edit/delete ICPs
- View/create/edit/delete personas
- View/create/delete queries
- View/create responses
- View analyses
- View citations

B. Components Access:
- dashboard/*: View own metrics, analyses
- response-analysis/*: Generate own analyses
- company-icps-table: Manage own ICPs
- generate-analysis/index.tsx: Create analyses
- personal/page.tsx: View own profile
```

### 2. Account Admins
```markdown
Access Level: Own Account Management

A. Account Management:
- Invite new users to account
- Remove users from account
- Manage account billing/subscription
- View account usage metrics

B. Additional Component Access:
- personal/page.tsx: 
  - User management UI
  - Billing management
  - Account settings
  - Usage reporting

C. Same Data Access as Users:
- Still restricted to account data
- Same RLS policies apply
- No override capabilities
```

### 3. Superadmins
```markdown
Access Level: Global System Access

A. System Management:
- Access all accounts
- Manage all users
- Override all limits
- Access all data

B. Component Access:
- Full access to all components
- Admin-specific views
- System management tools

C. Technical Access:
- Bypass RLS
- Direct database access
- System configuration
```

### 4. Implementation Details

#### A. Database Structure
```sql
-- Account users table role definition
create table public.account_users (
  id uuid primary key default gen_random_uuid(),
  account_id uuid references public.accounts(id) not null,
  user_id uuid references auth.users(id) not null,
  role text not null check (role in ('user', 'admin')), -- Regular user or Account Admin
  created_at timestamp with time zone default now(),
  unique(account_id, user_id)
);

-- Superadmin flag in auth.users
alter table auth.users
add column is_superadmin boolean default false;
```

#### B. Component Requirements

1. Auth Flow:
```markdown
- login-form.tsx: Standard login for all
- auth/callback/route.ts: Role-based redirects
- session-provider: Include role information
```

2. Dashboard Components:
```markdown
- dashboard-header.tsx: Show admin functions if admin
- company-selector.tsx: Account-scoped selection
- generate-analysis/index.tsx: Account-based limits
```

3. Analysis Components:
```markdown
- response-analysis/page.tsx: Account-scoped data
- company-setup/: Account-filtered companies
- query-generation/: Account-based access
```

4. Admin Components:
```markdown
personal/page.tsx:
- Regular users: Profile only
- Account admins: +User/billing management
- Superadmins: +System management
```

#### C. Access Control Implementation
```markdown
1. Regular Users & Account Admins:
- Protected by RLS policies
- Scoped to account_id
- Role-based UI elements

2. Superadmins:
- Bypass RLS using service role
- Access all accounts
- Full management UI
```

## Integration Points

### 1. Supabase Auth
```typescript
// Using existing auth client
import { createClient } from '@/app/supabase/client'

// OAuth specific methods
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google'
})
```

### 2. Session Management
```typescript
// Maintain existing session handling
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'

// Add account context
const { data: { account } } = await supabase
  .from('account_users')
  .select('account_id, role')
  .single()
```

### 3. Error Handling
- Keep existing error states
- Add OAuth-specific errors
- Add account-specific errors
- Add credit limit errors
- Maintain current UI feedback

## Success Metrics
- Successful account isolation via junction table
- Working OAuth flows
- Proper credit tracking
- Accurate usage limits
- Maintained existing functionality
- Successful OAuth user association
- Seamless auth method switching

## Migration Strategy
1. Zero-downtime deployment
2. Create accounts table
3. Create account_users associations
4. Preserve existing user data
5. Support both auth methods
6. Maintain current sessions

## Phase 3: Account Integration Implementation

### Overview
Comprehensive implementation of account associations across auth flows and data pipelines.

### 1. Auth Components Update
#### A. Callback Route (`app/auth/callback/route.ts`)
- Standardize account creation for OAuth/email
- Add account validation checks
- Enhance error handling
- Add logging for debugging
- Ensure account creation precedes redirects

#### B. Middleware (`middleware.ts`)
- Add account relationship verification
- Update protected route checks
- Add account context to headers
- Handle account-specific redirects

#### C. Auth Forms
- Update login/signup forms with account context
- Add account verification states
- Enhance error messaging
- Add loading states for account checks

#### D. Header Auth (`components/header-auth.tsx`)
- Add account display/selection
- Show account status
- Add account context provider

### 2. Data Pipeline Integration
#### A. ICP Generation (`generate-icps.ts`)
- Add account_id to company creation
- Update ICP generation with account context
- Ensure persona creation includes account

#### B. Query Generation (`generate-questions.ts`)
- Add account_id to queries
- Update query generation flow
- Pass account context through pipeline

#### C. Batch Processing (`generate-questions-batch.ts`)
- Add account_id to batch metadata
- Update batch processing
- Ensure response generation includes account

### 3. Analysis & Citation Updates
#### A. Response Processing (`processor.ts`)
- Add account context to analysis
- Update analysis queries
- Ensure data respects account boundaries

#### B. Citation Processing (`citation-processor.ts`)
- Add account_id to citations
- Update citation processing
- Maintain account context in enrichment

### 4. Database Updates
- Add NOT NULL constraints for account_id
- Update existing records
- Add necessary indexes
- Verify foreign key relationships

### 5. RLS Policy Updates
- Update companies access policy
- Add query access policy
- Update response access policy
- Add analysis access policy
- Update citation access policy
- Add batch metadata access policy

### Success Metrics
- All data properly associated with accounts
- RLS policies effectively filtering by account
- Successful account creation for all auth methods
- Proper error handling and user feedback
- Complete data pipeline account integration

### Implementation Order
1. Auth components and middleware
2. Database constraints and indexes
3. RLS policy updates
4. Data pipeline integration
5. Analysis and citation updates
6. Testing and verification