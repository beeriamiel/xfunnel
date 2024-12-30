# Codebase Organization

## Directory Structure
```typescript
/app
  /dashboard/
    /components/     # Dashboard-specific components
      buying-journey-analysis.tsx
      dashboard-content.tsx
      dashboard-header.tsx
      engine-metrics-chart.tsx
    page.tsx        # Main dashboard page
    search-params.ts # URL state management

/components/        # Shared UI components
  model-selector.tsx
  
/lib
  /actions/         # Server actions
    generate-gemini-response.ts
  /batch-processing/
    analysis.ts     # Analysis logic
    processor.ts    # Processing pipeline
    queue.ts        # Processing queue management
    citation-processor.ts # Citation processing system
    moz-queue.ts    # Handles Moz API integration

/hooks/            # Custom React hooks
  use-model-selection.ts

/utils
  /supabase/       # Database utilities
    migration.sql
    test-connection.ts
```

## Core Modules

### 1. Data Processing Pipeline
- **Batch Processing**
  - `lib/batch-processing/processor.ts`
    - Handles response processing in chunks
    - Manages processing queue
    - Tracks progress and handles errors
    - Coordinates citation processing
  
  - `lib/batch-processing/queue.ts`
    - Manages response processing queue
    - Handles batch operations
    - Processes citations in transaction
    - Error handling and retries

  - `lib/batch-processing/citation-processor.ts`
    - Citation extraction and validation
    - URL normalization
    - Metadata enrichment
    - Transaction handling
    - Error handling and logging
  
  - `lib/batch-processing/analysis.ts`
    - Analyzes responses for sentiment, rankings
    - Extracts citations and features
    - Categorizes by region, industry, persona
    - Processes citation metadata

  - `lib/batch-processing/moz-queue.ts`
    - Handles Moz API integration
    - Processes domain authority metrics
    - Manages empty timestamp values
    - Tracks spam scores
    - URL normalization for matching
    - Handles nested Moz API response structure
    - Accurate logging and monitoring
    - Error handling and validation

### 2. Dashboard Components
- **Analysis Views**
  - `buying-journey-analysis.tsx`
    - Journey stage visualization
    - Metrics by stage
    - Trend analysis
  
  - `engine-metrics-chart.tsx`
    - Engine performance comparison
    - Time-series metrics
    - Hierarchical data processing

### 3. State Management
- **URL State**
  - Uses `nuqs` for URL search parameters
  - Manages filters and selections
  - Preserves navigation state

- **Data Fetching**
  - Server components for initial data
  - Real-time updates via hooks
  - Optimistic updates for UI

### Content Analysis Service
  - `lib/services/content-analysis-service.ts`
    - Strict JSON validation
    - Claude response formatting rules
    - Error handling for malformed responses
    - Detailed logging

## Database Schema

### Main Tables
1. `responses`
   - Stores raw AI responses
   - Tracks answer engine and citations
   - Links to queries

2. `response_analysis`
   - Contains processed analysis
   - Stores metrics and scores
   - Maintains dimensional data
   - Stores parsed citations data

3. `citations`
   - Stores validated citation URLs
   - Citation order tracking
   - Rich metadata
     - Company association
     - Response context
     - Buyer journey data
     - Domain authority
     - Source type classification
     - Query text
     - Content analysis
     - Domain authority metrics
       - Moz API data
       - Last crawled timestamps
       - Page and domain authority
       - Spam score tracking
   - Automatic timestamp management
     - Created at with default
     - Updated at with trigger
   - Optimized indexes
     - Citation order (btree)
     - Response analysis ID (btree)
     - Company ID (btree)
     - Created at desc (btree)

4. `batch_metadata`
   - Tracks processing batches
   - Manages processing status
   - Handles error states

## Key Patterns

### 1. Server Components
```typescript
// Server Component Pattern
export default async function DashboardPage() {
  // Direct database queries
  // Heavy data processing
  // Pass data to client components
}
```

### 2. Client Components
```typescript
'use client'
// Client Component Pattern
export function EngineMetricsChart({ data }) {
  // Interactive UI
  // Real-time updates
  // Client-side processing
}
```

### 3. Data Processing
```typescript
// Processing Pattern
export async function processResponseChunk(
  responses: Response[],
  batchSize: number
) {
  // Process in chunks
  // Handle errors
  // Track progress
  // Process citations
}

// Citation Processing Pattern
export async function processCitationsTransaction(
  responseAnalysis: ResponseAnalysis,
  citationsParsed: ParsedCitation
) {
  // Validate URLs
  // Extract metadata
  // Process in transaction
  // Store enhanced data
    - Domain authority
    - Source type
    - Query text
    - Content analysis
  // Error handling and logging
}
```

## Performance Considerations

### 1. Server-Side Optimization
- Use React Server Components where possible
- Implement streaming responses
- Chunk large data processing
- Batch citation processing

### 2. Client-Side Optimization
- Minimize client-side JavaScript
- Implement virtual scrolling for large lists
- Use optimistic updates

### 3. Database Optimization
- Indexed key columns
- Materialized views for common queries
- Batch inserts for analysis results
- Optimized citation queries
  - Created_at index
  - Company_id index
  - Response_analysis_id index
  - Citation_order index

## Error Handling

### 1. Processing Errors
- Graceful degradation
- Retry mechanisms
- Error logging and tracking
- Citation validation errors

### 2. UI Error Boundaries
- Component-level error catching
- Fallback UI states
- Error reporting

## Testing Strategy

### 1. Unit Tests
- Processing functions
- Analysis algorithms
- Utility functions
- Citation validation

### 2. Integration Tests
- API endpoints
- Database operations
- Processing pipeline
- Citation processing flow

### 3. E2E Tests
- User flows
- Dashboard interactions
- Data visualization 

## Key Components

### FirecrawlClient
- Location: `lib/clients/firecrawl.ts`
- Handles web content scraping
- Features:
  - Exponential backoff retry logic
  - Rate limit handling
  - Detailed error logging
  - Response validation
  - Timeout configuration

### ContentScrapingQueue
- Location: `lib/batch-processing/content-queue.ts`
- Manages content scraping pipeline
- Features:
  - Document type filtering
  - Content analysis
  - Error handling and logging
  - Database updates 

### URL Classifier
- Location: `lib/utils/url-classifier.ts`
- Features:
  - Domain extraction and normalization
  - UGC domain list management
  - Fuzzy name matching
  - Detailed classification logging

### Citation Processor
- Location: `lib/batch-processing/citation-processor.ts`
- Enhanced with:
  - URL source classification
  - Company name lookup
  - Competitor matching
  - Preserved enrichment processes 