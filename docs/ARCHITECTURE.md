# System Architecture

## Overview
- Purpose: AI Response Analysis Platform
- Core functionality: Process, analyze, and visualize AI model responses
- Key metrics: Sentiment, Rankings, Company Mentions, Recommendations, Citations

## System Components
1. Data Collection Pipeline
   - Multiple AI engine integration (OpenAI, Gemini, Claude, etc.)
   - Response collection and storage
   - Citation extraction and validation
   - URL normalization and metadata enrichment

2. Analysis Pipeline
   - Batch processing system
   - Real-time analysis
   - Multi-dimensional analytics (Region, Industry, Persona, Journey Stage)
   - Citation processing and tracking
     - URL validation
     - Order preservation
     - Metadata enrichment
     - Company association

3. Dashboard System
   - Real-time metrics visualization
   - Comparative analysis across engines
   - Citation analytics and tracking
   - Hierarchical navigation (Region → Industry → Persona → Query)

## Data Flows
1. Response Generation
   - Query generation
   - Multi-engine response collection
   - Citation extraction and validation
   - URL normalization

2. Analysis Processing
   - Sentiment analysis
   - Ranking extraction
   - Company mention detection
   - Feature analysis
   - Citation processing
     - URL validation and cleaning
     - Order tracking
     - Metadata enrichment
     - Transaction handling
   - Metadata enrichment
     - Moz API integration for domain metrics
     - Conditional timestamp handling
     - Authority score tracking
   - Moz API integration
     - Nested result structure handling
     - Accurate response logging
     - Error tracking and monitoring
   - Claude content analysis
     - Strict JSON formatting rules
     - Response validation
     - Error handling for malformed responses

3. Metrics Aggregation
   - Geographic segmentation
   - Industry vertical analysis
   - Buyer persona insights
   - Journey stage progression
   - Citation analytics
     - URL patterns
     - Source distribution
     - Company associations

## Technology Stack
- Frontend: Next.js App Router, React, Shadcn UI, Tailwind
- Backend: Node.js, TypeScript
- Database: Supabase (PostgreSQL)
  - Response analysis table
  - Citations table with metadata
  - Optimized indexes for citation queries
- State Management: URL state (nuqs)
- External APIs
  - Moz API for domain authority metrics
    - Domain/Page authority
    - Spam score analysis
    - Last crawled tracking
  - Moz API
    - Nested response structure
    - Results tracking and monitoring
  - Claude API
    - JSON validation
    - Strict formatting rules
    - Error handling

## Processing Pipeline
1. Response Collection
   - Multi-engine querying
   - Response storage
   - Citation extraction

2. Analysis Processing
   - Response analysis
   - Citation processing
   - Metadata enrichment
   - Transaction handling

3. Data Storage
   - Response analysis records
   - Citation records with metadata
     - Basic citation data (URL, order)
     - Analysis context (company, response)
     - Journey metadata (persona, phase)
     - Enhanced metadata
       - Domain authority
       - Source type
       - Query text
       - Content analysis
   - Optimized indexes
     - Citation order (btree)
     - Response analysis ID (btree)
     - Company ID (btree)
     - Created at desc (btree)
   - Automatic timestamp management
     - Created at defaulting
     - Updated at trigger
   - Referential integrity
   - Transaction handling 

## Content Processing Pipeline

### Content Scraping
- ContentScrapingQueue handles web content extraction
- Uses Firecrawl API for HTML to markdown conversion
- Implements content analysis:
  - Word count
  - Code block detection
  - Heading structure analysis
- Filters out PDFs and document types
- Handles rate limiting and retries
- Stores results in citations table with content analysis metadata 

## Citation Processing Pipeline

### URL Classification System
- Automatic source classification during citation processing
- Classification hierarchy:
  1. UGC Check (exact domain match)
  2. OWNED Check (fuzzy company name match)
  3. COMPETITOR Check (fuzzy competitor name match)
  4. EARNED (default)
- Enhanced normalization:
  - Improved company name handling
  - Better period and special character handling
  - More accurate domain matching

### Citation Processing Flow
1. Initial Processing
   - Citation insertion
   - URL classification
   - Metadata preparation

2. Content Processing
   - Content scraping for new citations
   - Moz enrichment for new citations
   - Wait for content completion

3. Analysis
   - Content analysis for new citations only
   - Company mention counting for ALL citations with content
   - Independent error handling for each stage

### Moz Integration
- Enhanced metrics tracking:
  - Domain authority
  - Page authority
  - Spam score
  - Root domains
  - External links 

### Pipeline Components
- Citation Processor: Core processing logic and coordination
- Content Queue: Manages Firecrawl content scraping
- Moz Queue: Handles domain metrics enrichment
- Analysis Service: Coordinates content analysis

### Data Flow
1. URL Extraction & Validation
2. Citation Reuse Check (120-day window)
3. Batch Processing (new + reused citations)
4. Content Enrichment (scraping, Moz, analysis)
5. Company Mention Processing 

## Authentication Architecture

### 1. Auth Components
- Middleware Layer
  - Route protection
  - Session refresh
  - Cookie management
  - Auth state verification

- Server Components
  - SSR auth checks
  - Data access control
  - Role verification

- Client Components
  - Auth UI elements
  - Session management
  - Role-based rendering

### 2. Authorization System
- RLS Policies
  ```sql
  - Account-based access control
  - Role-based permissions
  - Super admin overrides
  ```

- Access Control
  ```typescript
  - Protected routes
  - Data access boundaries
  - Role enforcement
  ```

### 3. Session Management
- Cookie Handling
  ```typescript
  - Async operations
  - SSR compatibility
  - Secure defaults
  ```

- State Management
  ```typescript
  - Server-side verification
  - Client-side context
  - Role propagation
  ``` 

## Authentication

### Implementation
- Uses Supabase Auth with Next.js 14
- Server Components use `createServerComponentClient`
- Route Handlers use `createRouteHandlerClient`
- Client Components use `createClientComponentClient`

### Known Issues
- Next.js 14 shows warnings about synchronous cookie access in routes
- These warnings don't affect functionality:
  - Auth flows work correctly
  - OAuth implementation is stable
  - Session management is secure
  - RLS policies are enforced
- This is due to Supabase auth helpers' internal cookie handling
- Will be resolved in future Supabase updates

### Auth Flow
[Rest of existing auth documentation...] 

# Architecture

## Authentication and Data Access

### Auth Implementation
Our auth implementation uses Supabase Auth with Next.js 14, following these patterns:

#### Client Types
- Server Components: `createServerComponentClient`
- Route Handlers: `createRouteHandlerClient`
- Client Components: `createClientComponentClient`

#### Known Implementation Notes
- Current implementation shows Next.js 14 warnings about synchronous cookie access
- These warnings are suppressed as they don't affect functionality:
  - All auth flows work correctly
  - OAuth implementation is stable
  - Session management is secure
  - RLS policies are properly enforced
- Root cause: Supabase auth helpers' internal cookie handling
- Future: Will be resolved in upcoming Supabase updates

[Rest of existing documentation...] 